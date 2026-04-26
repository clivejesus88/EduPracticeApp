// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';

// ─── Auth Loader — Linear/Stripe style with completion sequence ───────────────
function AuthLoader({ onDone }) {
  const [progress, setProgress]     = useState(0);
  const [completing, setCompleting] = useState(false);
  const [fadeOut, setFadeOut]       = useState(false);

  // Phase 1 — ease from 0 → 85% over 2.4 s
  useEffect(() => {
    let raf;
    const start    = performance.now();
    const DURATION = 2400;

    const tick = (now) => {
      const t      = Math.min((now - start) / DURATION, 1);
      const eased  = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 85);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Phase 2 — triggered by parent when auth + 3 s minimum are both done
  useEffect(() => {
    const handler = () => setCompleting(true);
    window.addEventListener('auth-loader-complete', handler);
    return () => window.removeEventListener('auth-loader-complete', handler);
  }, []);

  useEffect(() => {
    if (!completing) return;
    setProgress(100);                                          // snap bar to 100%
    const t1 = setTimeout(() => setFadeOut(true),   400);    // start fade after bar
    const t2 = setTimeout(() => onDone?.(),          900);    // unmount after fade
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [completing]);

  return (
    <div
      className="fixed inset-0 bg-[#0B1120] flex flex-col items-center justify-center z-[9999]"
      style={{
        opacity:        fadeOut ? 0 : 1,
        transition:     fadeOut ? 'opacity 500ms ease' : 'none',
        pointerEvents:  fadeOut ? 'none' : 'auto',
      }}
    >
      {/* ── Progress bar ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className="h-full bg-[#f99c00]"
          style={{
            width:      `${progress}%`,
            transition: completing
              ? 'width 400ms cubic-bezier(0.4,0,0.2,1)'
              : 'width 300ms ease-out',
          }}
        />
        {/* Glowing tip */}
        <div
          className="absolute top-0 h-[2px] w-24 bg-gradient-to-r from-transparent to-[#f99c00] blur-sm"
          style={{
            left:       `calc(${progress}% - 6rem)`,
            transition: completing
              ? 'left 400ms cubic-bezier(0.4,0,0.2,1)'
              : 'left 300ms ease-out',
          }}
        />
      </div>

      {/* ── Center content ── */}
      <div
        className="flex flex-col items-center gap-6 select-none"
        style={{
          opacity:    fadeOut ? 0 : 1,
          transform:  fadeOut ? 'scale(0.96)' : 'scale(1)',
          transition: fadeOut ? 'opacity 400ms ease, transform 400ms ease' : 'none',
        }}
      >
        {/* Logo mark — swaps to checkmark on complete */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/40"
          style={{
            background:  completing
              ? 'linear-gradient(135deg,#f99c00 0%,#f88c00 100%)'
              : 'linear-gradient(135deg,#fff 0%,#e2e8f0 100%)',
            color:       completing ? '#0B1120' : '#0B1120',
            transition:  'background 400ms ease',
            animation:   completing ? 'none' : 'ep-pulse 2s ease-in-out infinite',
          }}
        >
          {completing
            ? <Icon icon="solar:check-circle-bold" width={34} height={34} />
            : <Icon icon="lucide:graduation-cap"   width={34} height={34} style={{ strokeWidth: 1.25 }} />
          }
        </div>

        {/* Wordmark */}
        <p className="text-white/90 text-xl font-bold tracking-tight">
          EduPractice
        </p>

        {/* Arc spinner — fades out when completing */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 animate-spin"
          style={{
            animationDuration:       '800ms',
            animationTimingFunction: 'linear',
            opacity:    completing ? 0 : 0.6,
            transition: 'opacity 300ms ease',
          }}
        >
          <circle cx="12" cy="12" r="10" stroke="rgba(249,156,0,0.2)" strokeWidth="2" />
          <path
            d="M12 2 A10 10 0 1 1 3.515 18"
            stroke="#f99c00"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <style>{`@keyframes ep-pulse{0%,100%{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}`}</style>
    </div>
  );
}

// ─── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = () => {
  const [loading, setLoading]           = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        const value = cookie.substring(name.length + 1);
        return value ? decodeURIComponent(value) : value;
      }
    }
    return null;
  };

  const authenticateFromUrlToken = (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn('URL token is empty or invalid.');
      return false;
    }
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('login_timestamp', Date.now().toString());
    searchParams.delete('token');
    setSearchParams(searchParams, { replace: true });
    return true;
  };

  const checkAuth = () => {
    try {
      const authToken      = sessionStorage.getItem('auth_token')      || getCookie('auth_token');
      const loginTimestamp = sessionStorage.getItem('login_timestamp') || getCookie('login_timestamp');
      if (!authToken) return false;
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
      if (loginTimestamp) {
        const timestamp = parseInt(loginTimestamp, 10);
        if (isNaN(timestamp) || Date.now() - timestamp > THREE_DAYS_MS) {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('login_timestamp');
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          document.cookie = 'login_timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    setLoading(true);
    const startTime = Date.now();

    const urlToken = searchParams.get('token');
    let isAuth = false;
    if (urlToken) isAuth = authenticateFromUrlToken(urlToken);
    if (!isAuth)  isAuth = checkAuth();
    setIsAuthenticated(isAuth);

    // Wait at least 3 s, then fire the completion sequence
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, 3000 - elapsed);

    setTimeout(() => {
      // Trigger the loader's completion animation
      window.dispatchEvent(new Event('auth-loader-complete'));
      // onDone callback inside the loader will call setLoading(false) via handleDone
    }, remaining);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading || isAuthenticated) return;
    const id = setInterval(() => {
      const isAuth = checkAuth();
      if (isAuth) { setIsAuthenticated(true); clearInterval(id); }
    }, 500);
    return () => clearInterval(id);
  }, [loading, isAuthenticated]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const isAuth = checkAuth();
        if (isAuth) setIsAuthenticated(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const returnUrl = window.location.href;
      window.location.href = `https://edupractice.vercel.app/login?return=${encodeURIComponent(returnUrl)}`;
    }
  }, [loading, isAuthenticated]);

  // Called by AuthLoader after its fade-out finishes
  const handleDone = () => setLoading(false);

  if (loading) return <AuthLoader onDone={handleDone} />;

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;