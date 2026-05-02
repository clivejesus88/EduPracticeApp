# Hugging Face Practice Evaluation Setup

This enables real AI grading for the `Practice` page.

## 1) Create a Hugging Face access token

1. Open [Hugging Face Settings -> Access Tokens](https://huggingface.co/settings/tokens).
2. Create a token with access to Inference Providers / Router.
3. Copy the token.

## 2) Add local environment variables

Create `client-ui/.env.local`:

```bash
VITE_HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
VITE_HF_MODEL=Qwen/Qwen2.5-72B-Instruct
```

Only `VITE_HF_API_KEY` is required.  
If `VITE_HF_MODEL` is omitted, the app defaults to `Qwen/Qwen2.5-72B-Instruct`.

## 3) Restart the app

```bash
cd client-ui
npm run dev
```

## 4) What the app does

- Sends the practice question, selected subject/level/topic, and the student's written solution
- Calls the Hugging Face router API
- Expects structured JSON back with:
  - `score`
  - `summary`
  - `strengths`
  - `improvements`
  - `modelAnswer`

## 5) Current limitation

- The optional uploaded file is stored only as attachment metadata in the request context.
- The AI grading currently evaluates the written solution text, not OCR from images/PDFs.

## 6) Troubleshooting

- **Missing API key error**
  - Make sure `VITE_HF_API_KEY` exists in `client-ui/.env.local`

- **401 / 403 from Hugging Face**
  - Verify the token is valid and has inference access

- **Model unavailable**
  - Try another instruct model in `VITE_HF_MODEL`

- **No feedback returned**
  - Check browser devtools network tab for the Hugging Face response body
