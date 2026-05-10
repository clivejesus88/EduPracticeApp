const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models to try in order of preference
const FREE_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/wizardlm-2-8x22b:free',
  'google/gemma-7b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'huggingface/zephyr-7b-beta:free'
];

const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || FREE_MODELS[0];

function isAvailable() {
  return Boolean(API_KEY);
}

// Try multiple models in sequence for better reliability
async function tryWithFallbackModels(requestBody, modelsToTry = FREE_MODELS) {
  for (const model of modelsToTry) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'EduPractice App'
        },
        body: JSON.stringify({
          ...requestBody,
          model: model,
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        const error = handleOpenRouterError(res.status, detail);

        // If it's a model-specific error, try the next model
        if (res.status === 400 && detail.includes('model')) {
          console.warn(`Model ${model} failed, trying next model...`);
          continue;
        }

        // If it's a rate limit or auth error, don't retry
        if (res.status === 401 || res.status === 402 || res.status === 429) {
          throw error;
        }

        // For other errors, try next model
        console.warn(`Model ${model} failed (${res.status}), trying next model...`);
        continue;
      }

      const data = await res.json();

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

async function callGemini(contents, systemInstruction = null, opts = {}) {
  if (!API_KEY) throw new Error('VITE_OPENROUTER_API_KEY is not set.');

  const messages = [];

  // Add system instruction if provided
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  // Convert Gemini-style contents to OpenAI-style messages
  for (const content of contents) {
    if (content.role === 'user') {
      const messageContent = [];

      for (const part of content.parts) {
        if (part.text) {
          messageContent.push({ type: 'text', text: part.text });
        } else if (part.inlineData) {
          // Handle image data
          messageContent.push({
            type: 'image_url',
            image_url: {
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            }
          });
        }
      }

      messages.push({ role: 'user', content: messageContent });
    } else if (content.role === 'model') {
      messages.push({ role: 'assistant', content: content.parts.map(p => p.text).join('') });
    }
  }

  try {
    const requestBody = {
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxOutputTokens ?? 1024,
    };

    const data = await tryWithFallbackModels(requestBody);
    return data?.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    if (error.message.includes('OpenRouter') || error.message.includes('rate limit') || error.message.includes('API key')) {
      throw error; // Re-throw our custom errors
    }
    throw new Error(`Failed to communicate with AI service: ${error.message}`);
  }
}

async function* streamGemini(contents, systemInstruction = null, opts = {}) {
  if (!API_KEY) throw new Error('VITE_OPENROUTER_API_KEY is not set.');

  const messages = [];

  // Add system instruction if provided
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  // Convert Gemini-style contents to OpenAI-style messages
  for (const content of contents) {
    if (content.role === 'user') {
      const messageContent = [];

      for (const part of content.parts) {
        if (part.text) {
          messageContent.push({ type: 'text', text: part.text });
        } else if (part.inlineData) {
          // Handle image data
          messageContent.push({
            type: 'image_url',
            image_url: {
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            }
          });
        }
      }

      messages.push({ role: 'user', content: messageContent.length === 1 && messageContent[0].type === 'text' ? messageContent[0].text : messageContent });
    } else if (content.role === 'model') {
      messages.push({ role: 'assistant', content: content.parts.map(p => p.text).join('') });
    }
  }

  try {
    // For streaming, we'll try models one by one until we get a successful connection
    for (const model of FREE_MODELS) {
      try {
        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'EduPractice App'
          },
          body: JSON.stringify({
            model: model,
            messages,
            temperature: opts.temperature ?? 0.7,
            max_tokens: opts.maxOutputTokens ?? 1024,
            stream: true,
          }),
        });

        if (!res.ok) {
          const detail = await res.text();
          const error = handleOpenRouterError(res.status, detail);

          // If it's a model-specific error, try the next model
          if (res.status === 400 && detail.includes('model')) {
            console.warn(`Streaming model ${model} failed, trying next model...`);
            continue;
          }

          // If it's a rate limit or auth error, don't retry
          if (res.status === 401 || res.status === 402 || res.status === 429) {
            throw error;
          }

          // For other errors, try next model
          console.warn(`Streaming model ${model} failed (${res.status}), trying next model...`);
          continue;
        }

        // If we get here, the model works for streaming
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const json = line.slice(6).trim();
            if (json === '[DONE]') return;
            try {
              const parsed = JSON.parse(json);

              // Check for OpenRouter error in streaming response
              if (parsed.error) {
                throw new Error(`OpenRouter streaming error: ${parsed.error.message}`);
              }

              const chunk = parsed?.choices?.[0]?.delta?.content;
              if (chunk) yield chunk;
            } catch (parseError) {
              if (parseError.message.includes('OpenRouter')) {
                throw parseError;
              }
              // Continue on JSON parse errors for individual chunks
            }
          }
        }
        return; // Successfully streamed with this model
      } catch (error) {
        console.warn(`Streaming with model ${model} failed: ${error.message}, trying next model...`);
        continue;
      }
    }

    // All models failed
    throw new Error('All available AI models are currently unavailable for streaming. Please try again later.');
  } catch (error) {
    if (error.message.includes('OpenRouter') || error.message.includes('rate limit') || error.message.includes('API key')) {
      throw error; // Re-throw our custom errors
    }
    throw new Error(`Failed to stream AI response: ${error.message}`);
  }
}

export { isAvailable, callGemini, streamGemini };
