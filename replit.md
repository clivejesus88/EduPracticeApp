# EduPractice Client UI

## Overview
A React + Vite + TypeScript single-page app for the EduPractice study platform. Auth is gated by a token cookie; unauthenticated users are redirected to `https://edupractice.vercel.app/login`.

## Project Structure
- `client-ui/` — React + Vite frontend (entry: `src/main.tsx`, app: `src/App.jsx`).
- `server/` — Optional FastAPI RAG backend (uses Ollama + Chroma + HuggingFace). Not run in this Replit environment because it requires a local Ollama install and large ML model downloads. The frontend does not call this backend directly.

## Replit Setup
- Frontend workflow: `cd client-ui && npm run dev`, port 5000, webview output.
- Vite is configured to bind `0.0.0.0:5000`, allow all hosts (for the iframe proxy), and use `wss` HMR on client port 443.
- Node.js 20 module is used. The `@rolldown/plugin-babel` package warns about Node engine but works.

## Deployment
- Configured as autoscale static deployment: build with `cd client-ui && npm run build`, serve `client-ui/dist`.
