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

## State Management
- `UserContext` (`src/contexts/UserContext.jsx`) holds the user profile (name, email, school, exam level, prefs) with localStorage persistence (key `eduPractice_user`). Mounted globally in `App.jsx` via `<UserProvider>`. Components consume it through `useUser()` (`user`, `updateUser`, `getFirstName`, `getInitials`).
- `Profile.jsx` initializes its form from the context, syncs back via `updateUser(formData)` on save, and re-syncs from context if the user changes elsewhere while not editing.
- `DashboardUI` welcome heading and `Layout` sidebar (avatar + name) all read live from `useUser()`, so any name edit on the Profile page propagates instantly across the app.

## Exam Engine
- `src/data/examBank.js` holds a real, hand-written question bank (Physics / Mathematics / Chemistry / Biology / English across O-Level, A-Level and UACE) with MCQ + numeric questions, answers, explanations and marks. Exposes `buildExam(config)` (deterministic, seeded shuffle with graceful fallback when filters are too narrow), `scoreExam()`, and `saveAttempt() / listAttempts() / getAttempt()` (localStorage key `eduPractice_examAttempts`, capped at 25).
- `src/pages/ExamRunner.jsx` (route `/exam/run`) is the distraction-free exam UI: countdown timer with low-time warning, progress strip, MCQ + numeric inputs, flag-for-review, question overview grid, draft auto-save (`eduPractice_examDraft`) so refreshes don't lose progress, and timer auto-submit at 0.
- `src/pages/ExamResults.jsx` (route `/exam/results/:attemptId`) shows the final score, grade, per-topic accuracy bars, and a per-question review with correct answers + explanations. Has retake and back-to-list actions.
- Both exam routes are mounted **outside** the sidebar `Layout` (still inside `ProtectedRoute`) for full-screen focus.
- `src/pages/MockExams.jsx` drives everything: level selector, dynamic mock exams filtered by level, topic exams generated from `data/examStructure.js` (only surfaces topics where the question bank has matching content), recent-attempts list, and a custom builder that accepts subject / level / difficulty / count and routes into the runner with a real config.

## Recent UI Changes
- Practice page redesigned with examdojo-inspired clean look: bigger headlines, generous spacing, single-column → multi-column responsive grids, pill-shaped CTAs, consistent rounded card system, mobile-friendly workboard with sticky-safe bottom padding.
- Workboard reserves right-side room for the chat sidebar only when chat is open (`lg:pr-[400px]` conditionally) instead of an invalid hard-coded class.
- Chatbot icon switched from `solar:magic-stick-3-bold` to Hugeicons `AiBrain05Icon` (free tier) in `ChatInterface.jsx` (avatar + header) and `Practice.jsx` (floating chat button + "Ask Maestro" CTA). Uses `@hugeicons/react` + `@hugeicons/core-free-icons`.
