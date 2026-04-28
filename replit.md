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

## Recent UI Changes
- Practice page redesigned with examdojo-inspired clean look: bigger headlines, generous spacing, single-column → multi-column responsive grids, pill-shaped CTAs, consistent rounded card system, mobile-friendly workboard with sticky-safe bottom padding.
- Workboard reserves right-side room for the chat sidebar only when chat is open (`lg:pr-[400px]` conditionally) instead of an invalid hard-coded class.
- Chatbot icon switched from `solar:magic-stick-3-bold` to Hugeicons `AiBrain05Icon` (free tier) in `ChatInterface.jsx` (avatar + header) and `Practice.jsx` (floating chat button + "Ask Maestro" CTA). Uses `@hugeicons/react` + `@hugeicons/core-free-icons`.
