import { checkAndRecord, blockedMessage } from '../utils/rateLimiter';

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = import.meta.env.VITE_HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;

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

  if (!HF_API_KEY) {
    throw new Error('Missing VITE_HF_API_KEY. Add it to client-ui/.env.local to enable AI evaluation.');
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

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
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
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Hugging Face request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = extractJson(content);

  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    summary: parsed.summary || 'Evaluation completed.',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    modelAnswer: parsed.modelAnswer || '',
  };
}
