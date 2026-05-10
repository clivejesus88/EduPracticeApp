import { checkAndRecord, blockedMessage } from '../utils/rateLimiter';

const OR_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models to try in order of preference
const FREE_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/wizardlm-2-8x22b:free',
  'google/gemma-7b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'huggingface/zephyr-7b-beta:free'
];

const OR_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || FREE_MODELS[0];
const OR_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

function extractJson(text) {
  if (!text) {
    throw new Error('Empty AI response.');
  }

  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1]);
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return JSON.parse(objectMatch[0]);
  }

  throw new Error('Could not parse AI evaluation response.');
}

// Enhanced error handling for OpenRouter
function handleOpenRouterError(status, detail) {
  try {
    const errorData = JSON.parse(detail);

    switch (status) {
      case 400:
        if (errorData.error?.message?.includes('rate limit')) {
          return new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (errorData.error?.message?.includes('model')) {
          return new Error('The selected AI model is currently unavailable. Please try again later.');
        }
        return new Error(`Request error: ${errorData.error?.message || 'Invalid request'}`);

      case 401:
        return new Error('Invalid API key. Please check your OpenRouter API key.');

      case 402:
        return new Error('Insufficient credits. Please check your OpenRouter account balance.');

      case 429:
        // Rate limit - try to extract retry time
        const retryAfter = errorData.error?.message?.match(/try again in (\d+) seconds/i);
        const seconds = retryAfter ? parseInt(retryAfter[1]) : 60;
        return new Error(`Rate limited. Please wait ${seconds} seconds before trying again.`);

      case 500:
      case 502:
      case 503:
        return new Error('OpenRouter service is temporarily unavailable. Please try again later.');

      default:
        return new Error(`OpenRouter error (${status}): ${errorData.error?.message || detail}`);
    }
  } catch (parseError) {
    // If we can't parse the error response, return a generic message
    switch (status) {
      case 400:
        return new Error('Invalid request. Please check your input and try again.');
      case 401:
        return new Error('Authentication failed. Please check your API key.');
      case 402:
        return new Error('Payment required. Please check your account balance.');
      case 429:
        return new Error('Too many requests. Please wait before trying again.');
      case 500:
      case 502:
      case 503:
        return new Error('Service temporarily unavailable. Please try again later.');
      default:
        return new Error(`Request failed (${status}). Please try again.`);
    }
  }
}

// Try multiple models in sequence for better reliability
async function tryWithFallbackModels(requestBody, modelsToTry = FREE_MODELS) {
  for (const model of modelsToTry) {
    try {
      const response = await fetch(OR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OR_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'EduPractice App'
        },
        body: JSON.stringify({
          ...requestBody,
          model: model,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        const error = handleOpenRouterError(response.status, detail);

        // If it's a model-specific error, try the next model
        if (response.status === 400 && detail.includes('model')) {
          console.warn(`Model ${model} failed, trying next model...`);
          continue;
        }

        // If it's a rate limit or auth error, don't retry
        if (response.status === 401 || response.status === 402 || response.status === 429) {
          throw error;
        }

        // For other errors, try next model
        console.warn(`Model ${model} failed (${response.status}), trying next model...`);
        continue;
      }

      const data = await response.json();

      // Check for OpenRouter-specific error in response
      if (data.error) {
        console.warn(`Model ${model} returned error: ${data.error.message}, trying next model...`);
        continue;
      }

      // Success! Return the working response with the model used
      return { ...data, _usedModel: model };
    } catch (error) {
      console.warn(`Model ${model} failed: ${error.message}, trying next model...`);
      continue;
    }
  }

  // All models failed
  throw new Error('All available AI models are currently unavailable. Please try again later.');
}

export async function evaluatePracticeSolution({
  subject,
  level,
  topic,
  question,
  studentAnswer,
  attachmentName = null,
}) {
  // Rate limit: 6 evaluations per 10 minutes
  const rl = checkAndRecord('aiEval');
  if (rl.blocked) {
    throw new Error(blockedMessage('aiEval', rl.retryAfterMs));
  }

  if (!OR_API_KEY) {
    throw new Error('Missing VITE_OPENROUTER_API_KEY. Add it to client-ui/.env to enable AI evaluation.');
  }

  const prompt = [
    'You are a strict but supportive A-Level exam grader.',
    'Evaluate the student answer against the question.',
    'Return ONLY valid JSON with this exact shape:',
    '{"score": number, "summary": string, "strengths": string[], "improvements": string[], "modelAnswer": string}',
    '',
    `Subject: ${subject}`,
    `Level: ${level}`,
    `Topic: ${topic}`,
    '',
    'Question:',
    question,
    '',
    attachmentName ? `Attached file name: ${attachmentName}` : 'Attached file name: none',
    '',
    'Student answer:',
    studentAnswer,
  ].join('\n');

  try {
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Return only JSON. No markdown. No prose before or after the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 700,
    };

    const data = await tryWithFallbackModels(requestBody);

    const content = data?.choices?.[0]?.message?.content;
    const parsed = extractJson(content);

    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      summary: parsed.summary || 'Evaluation completed.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      modelAnswer: parsed.modelAnswer || '',
    };
  } catch (error) {
    if (error.message.includes('OpenRouter') || error.message.includes('rate limit') || error.message.includes('API key')) {
      throw error; // Re-throw our custom errors
    }
    if (error.message.includes('Could not parse AI evaluation response')) {
      throw error; // Re-throw JSON parsing errors
    }
    throw new Error(`Failed to evaluate practice solution: ${error.message}`);
  }
}
