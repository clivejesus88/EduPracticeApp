/**
 * React hook for rate-limit state with live countdown.
 *
 * Usage:
 *   const { blocked, remaining, message, countdown } = useRateLimit('login');
 *
 *   blocked   — boolean: deny the action
 *   remaining — how many attempts are left in the current window
 *   message   — string to show the user when blocked
 *   countdown — formatted string "2 min 5 sec" (updates every second while blocked)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { checkLimit, recordAttempt, clearLimit, blockedMessage, formatRetryAfter } from '../utils/rateLimiter';

export function useRateLimit(action) {
  const [state, setState] = useState(() => {
    const r = checkLimit(action);
    return {
      blocked:      r.blocked,
      remaining:    r.remaining,
      retryAfterMs: r.retryAfterMs,
    };
  });
  const intervalRef = useRef(null);

  // Refresh the rate-limit state (call after recording an attempt)
  const refresh = useCallback(() => {
    const r = checkLimit(action);
    setState({ blocked: r.blocked, remaining: r.remaining, retryAfterMs: r.retryAfterMs });
  }, [action]);

  // Live countdown tick
  useEffect(() => {
    if (!state.blocked) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const r = checkLimit(action);
      setState({ blocked: r.blocked, remaining: r.remaining, retryAfterMs: r.retryAfterMs });
      if (!r.blocked) clearInterval(intervalRef.current);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [action, state.blocked]);

  const record = useCallback(() => {
    recordAttempt(action);
    refresh();
  }, [action, refresh]);

  const clear = useCallback(() => {
    clearLimit(action);
    refresh();
  }, [action, refresh]);

  return {
    blocked:   state.blocked,
    remaining: state.remaining,
    countdown: state.blocked ? formatRetryAfter(state.retryAfterMs) : null,
    message:   state.blocked ? blockedMessage(action, state.retryAfterMs) : null,
    record,
    refresh,
    clear,
  };
}
