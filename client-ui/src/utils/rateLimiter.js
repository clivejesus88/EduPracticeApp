/**
 * Client-side sliding-window rate limiter.
 *
 * Persists attempt timestamps in localStorage so limits survive page refreshes
 * and tab closes. Each action type has its own config and storage key.
 *
 * NOTE: This is a "good-faith" barrier — sophisticated users can clear
 * localStorage. Its purpose is to protect against automated scripts, bots,
 * and accidental rapid-fire requests, not determined human attackers.
 */

const STORE_PREFIX = 'eduPractice_rl_';

// ─── Action configs ────────────────────────────────────────────────────────
// maxAttempts : calls allowed within the window
// windowMs    : rolling time window (milliseconds)
// Only-on-fail: some actions (login) only count failures — enforced in callers
export const LIMITS = {
  login:         { maxAttempts: 5,  windowMs: 15 * 60 * 1000 },  // 5 fails / 15 min
  signup:        { maxAttempts: 3,  windowMs: 60 * 60 * 1000 },  // 3 tries  / 1 hr
  aiChat:        { maxAttempts: 12, windowMs:  5 * 60 * 1000 },  // 12 msgs  / 5 min
  aiEval:        { maxAttempts: 6,  windowMs: 10 * 60 * 1000 },  // 6 evals  / 10 min
  audioOverview: { maxAttempts: 4,  windowMs: 10 * 60 * 1000 },  // 4 gen    / 10 min
  adminPin:      { maxAttempts: 5,  windowMs: 30 * 60 * 1000 },  // 5 tries  / 30 min
  passwordReset: { maxAttempts: 3,  windowMs: 60 * 60 * 1000 },  // 3 resets / 1 hr
};

// ─── Storage helpers ───────────────────────────────────────────────────────
function loadTimestamps(action) {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + action);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTimestamps(action, timestamps) {
  try {
    localStorage.setItem(STORE_PREFIX + action, JSON.stringify(timestamps));
  } catch { /* quota exceeded — silently ignore */ }
}

// ─── Sliding window helpers ────────────────────────────────────────────────
function pruneWindow(timestamps, windowMs) {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter(t => t > cutoff);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether an action is currently rate-limited.
 *
 * Returns: { blocked: boolean, remaining: number, retryAfterMs: number }
 *   - blocked      : true if the caller must be denied
 *   - remaining    : how many more attempts are allowed (0 when blocked)
 *   - retryAfterMs : ms until the oldest entry expires and a slot opens up
 */
export function checkLimit(action) {
  const config = LIMITS[action];
  if (!config) return { blocked: false, remaining: Infinity, retryAfterMs: 0 };

  const { maxAttempts, windowMs } = config;
  const now        = Date.now();
  const timestamps = pruneWindow(loadTimestamps(action), windowMs);
  const count      = timestamps.length;

  if (count < maxAttempts) {
    return { blocked: false, remaining: maxAttempts - count, retryAfterMs: 0 };
  }

  // Blocked — oldest entry determines when the first slot opens
  const oldestInWindow = Math.min(...timestamps);
  const retryAfterMs   = Math.max(0, oldestInWindow + windowMs - now);

  return { blocked: true, remaining: 0, retryAfterMs };
}

/**
 * Record one attempt for an action.
 * Call AFTER the action executes (or on failure for login).
 */
export function recordAttempt(action) {
  const config = LIMITS[action];
  if (!config) return;

  const { windowMs } = config;
  const timestamps   = pruneWindow(loadTimestamps(action), windowMs);
  timestamps.push(Date.now());
  saveTimestamps(action, timestamps);
}

/**
 * Convenience: check, then record if not blocked.
 * Returns same shape as checkLimit().
 * Use for actions where every call should be counted (AI, signup, admin PIN).
 */
export function checkAndRecord(action) {
  const result = checkLimit(action);
  if (!result.blocked) {
    recordAttempt(action);
  }
  return result;
}

/**
 * Manually clear the rate limit for an action (e.g. on successful login).
 */
export function clearLimit(action) {
  localStorage.removeItem(STORE_PREFIX + action);
}

/**
 * Format a retryAfterMs value as a human-readable string.
 * e.g. 125 000 ms → "2 minutes 5 seconds"
 */
export function formatRetryAfter(ms) {
  if (ms <= 0) return 'a moment';
  const totalSec = Math.ceil(ms / 1000);
  const mins     = Math.floor(totalSec / 60);
  const secs     = totalSec % 60;
  if (mins === 0) return `${secs} second${secs !== 1 ? 's' : ''}`;
  if (secs === 0) return `${mins} minute${mins !== 1 ? 's' : ''}`;
  return `${mins} min ${secs} sec`;
}

/**
 * Build the user-facing blocked message for a given action.
 */
export function blockedMessage(action, retryAfterMs) {
  const labels = {
    login:         'Too many failed login attempts.',
    signup:        'Too many account creation attempts from this device.',
    aiChat:        'You\'re sending messages too quickly.',
    aiEval:        'You\'ve submitted too many evaluations in a short time.',
    audioOverview: 'Too many audio overview requests in a short time.',
    adminPin:      'Too many incorrect PIN attempts.',
    passwordReset: 'Too many password reset requests.',
  };
  const base = labels[action] || 'Too many requests.';
  return `${base} Please wait ${formatRetryAfter(retryAfterMs)} before trying again.`;
}
