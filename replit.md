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

## Exam Engine (Physics & Mathematics only)
- `src/data/examBank.js` holds two pools: `questionBank` (MCQ + numeric questions for Physics & Maths across A-Level / UACE) and `scenarioBank` (Uganda-context scenario questions — Murchison Falls power, Mt. Rwenzori pressure, Makerere admissions, Mbarara water tank, etc.). Exposes `buildExam({ subject, level, difficulty, count, scenarioCount })`, `scoreExam()`, `saveAttempt()/listAttempts()/getAttempt()`, `deriveAnalytics({ days })`, and `formatStudyTime()`.
- A "scenario question" is just a regular MCQ/numeric question with a `context` paragraph attached. `buildExam` reserves N scenario slots per the `scenarioCount` parameter, then fills the rest from the regular bank.
- `src/pages/ExamRunner.jsx` (route `/exam/run`) is the **focus-mode** session: distraction-free header with a "Focus mode" pill, countdown timer, progress strip, MCQ/numeric inputs, flag-for-review, overview grid, and draft auto-save. When a question carries `context`, an amber "Scenario" card with the context paragraph renders above the prompt.
- `src/components/FocusAudio.jsx` is a self-contained lofi-beats player embedded in the runner header. Click the headphones pill to open a panel with 4 free streaming stations (Lofi Beats, Chill Study, Coffee Shop, Ambient Focus — all SomaFM streams), play/stop control, volume slider (persisted to localStorage key `eduPractice_focusAudio`), and graceful error handling. Audio is paused/torn down on unmount, so leaving or submitting the exam stops the music automatically. The pill in the header animates a soundwave when audio is playing.
- `src/pages/ExamResults.jsx` (route `/exam/results/:attemptId`) shows score, per-topic accuracy bars, and per-question review with correct answers + explanations. Both exam routes are mounted outside the sidebar `Layout` (still inside `ProtectedRoute`) for full-screen focus.
- `src/pages/MockExams.jsx` lists A-Level Physics + Mathematics mocks, each pre-configured with `scenarioCount: 2-3` so every mock mixes MCQs with Uganda-context scenarios. Also offers topic exams (auto-generated from `data/examStructure.js`) and a custom builder.

## Real-time Analytics
- All metrics on the Dashboard, Analytics page, and the header streak chip are computed from the real `listAttempts()` history via `deriveAnalytics({ days })`. There is **no** placeholder data anywhere in the user-facing app.
- `deriveAnalytics` returns `totalQuestions`, `totalCorrect`, `accuracyOverall`, `avgScore`, `studyMinutes`, `subjectPerformance` (Physics & Maths only, with mastery %, attempts, minutes), `weeklyActivity` (7 daily buckets of `{questions, correct, minutes}`), `streak` (consecutive days with ≥1 attempt, ending today or yesterday), `longestStreak`, `improvement` (avg of last 3 attempts vs first 3, in pp), and `latest`.
- `Analytics.jsx` has a working period selector (7/30/90/All time) that re-derives the data, an empty-state banner when there are no attempts, and a recent-attempts list that links into the result viewer.
- `DashboardUI.jsx` reads real values for the four stat cards, weekly activity bars (with tooltips), today's daily-goal progress (target 30 questions/day), recent sessions, and subject mastery (Physics + Maths). The "Resume Practice" modal is populated from real recent attempts.
- `Layout.jsx` shows the live current streak in the top-right "fire" pill (recomputed on every route change).

## Recent UI Changes
- Practice page redesigned with examdojo-inspired clean look: bigger headlines, generous spacing, single-column → multi-column responsive grids, pill-shaped CTAs, consistent rounded card system, mobile-friendly workboard with sticky-safe bottom padding.
- Workboard reserves right-side room for the chat sidebar only when chat is open (`lg:pr-[400px]` conditionally) instead of an invalid hard-coded class.
- Chatbot icon switched from `solar:magic-stick-3-bold` to Hugeicons `AiBrain05Icon` (free tier) in `ChatInterface.jsx` (avatar + header) and `Practice.jsx` (floating chat button + "Ask Maestro" CTA). Uses `@hugeicons/react` + `@hugeicons/core-free-icons`.

## Bug Fixes & UX Improvements (Comprehensive Audit Pass)
- **Rate limiting system**: `src/utils/rateLimiter.js` (sliding-window, localStorage) + `src/hooks/useRateLimit.js` hook. Applied to Login (5/15min), Signup (3/hr), Admin PinGate (5/30min), ChatInterface (12/5min), AudioOverview (4/10min).
- **Layout.jsx**: Settings gear button now navigates to `/profile`. Broken mobile `<a href="#">` replaced with a functional search icon button (opens SearchModal). Admin Panel link added to mobile slide-in sidebar. `refreshNotifs` added to `useEffect` dependency array.
- **DashboardUI.jsx**: Broken CSS checkbox hack toggle replaced with proper controlled `RemindersToggle` component using React state + localStorage persistence (`eduPractice_reminders`).
- **Practice.jsx workboard**: Dead Notes/Save/Flag toolbar buttons replaced with `WorkboardNotesButton` — a functional Save (bookmark) and Flag pair, both persisted to localStorage per-scenario.
- **Admin.jsx PinGate**: Fixed stale state bug — after `pinRL.record()`, accurate remaining count computed as `pinRL.remaining - 1` instead of reading the not-yet-updated hook state.
- **ExamRunner.jsx**: Replaced `window.confirm()` abandon dialog with a proper custom modal (matching the existing submit modal design pattern) — `showAbandonModal` state + amber-themed "Leave exam" / "Keep going" buttons.
- **Profile.jsx**: Added a visible Cancel + Save button pair in the page header when `isEditing === true`. Cancel resets form to current user state without saving.
- **NotFoundPage.jsx**: Removed inline `<link>` Google Fonts tag from JSX body (invalid in React). Fixed invalid Tailwind v4 class `bg-linear-to-r` → `bg-gradient-to-r`.
- **index.html**: Added Google Fonts preconnect + stylesheet link for DM Sans and Space Mono (used by NotFoundPage).
- **MockExams.jsx**: Replaced `window.location.reload()` in the Discard Draft button with a proper state reset.
