import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '@iconify/react';

/**
 * AuthLoader Component
 * Smooth loading animation while authentication state is being verified
 */
function AuthLoader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Phase 1 — ease from 0 → 85% over 2.4 s
  useEffect(() => {
    let raf;
    const start = performance.now();
    const DURATION = 2400;

    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
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
    setProgress(100); // snap bar to 100%
    const t1 = setTimeout(() => setFadeOut(true), 400); // start fade after bar
    const t2 = setTimeout(() => onDone?.(), 900); // unmount after fade
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [completing, onDone]);

  return (
    <div
      className="fixed inset-0 bg-[#0B1120] flex flex-col items-center justify-center z-9999"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? 'opacity 500ms ease' : 'none',
        pointerEvents: fadeOut ? 'none' : 'auto'
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className="h-full bg-[#f99c00]"
          style={{
            width: `${progress}%`,
            transition: completing ? 'width 400ms cubic-bezier(0.4,0,0.2,1)' : 'width 300ms ease-out'
          }}
        />
        {/* Glowing tip */}
        <div
          className="absolute top-0 h-0.5 w-24 bg-linear-to-r from-transparent to-[#f99c00] blur-sm"
          style={{
            left: `calc(${progress}% - 6rem)`,
            transition: completing ? 'left 400ms cubic-bezier(0.4,0,0.2,1)' : 'left 300ms ease-out'
          }}
        />
      </div>

      {/* Center content */}
      <div
        className="flex flex-col items-center gap-6 select-none"
        style={{
          opacity: fadeOut ? 0 : 1,
          transform: fadeOut ? 'scale(0.96)' : 'scale(1)',
          transition: fadeOut ? 'opacity 400ms ease, transform 400ms ease' : 'none'
        }}
      >
        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: completing
              ? 'linear-gradient(135deg,#f99c00 0%,#f88c00 100%)'
              : 'linear-gradient(135deg,#fff 0%,#e2e8f0 100%)',
            color: '#0B1120',
            transition: 'background 400ms ease',
            animation: completing ? 'none' : 'ep-pulse 2s ease-in-out infinite'
          }}
        >
          {completing ? (
            <Icon icon="solar:check-circle-bold" width={34} height={34} />
          ) : (
            <Icon icon="lucide:graduation-cap" width={34} height={34} style={{ strokeWidth: 1.25 }} />
          )}
        </div>

        {/* Wordmark */}
        <p className="text-white/90 text-xl font-bold tracking-tight">EduPractice</p>

        {/* Arc spinner */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 animate-spin"
          style={{
            animationDuration: '800ms',
            animationTimingFunction: 'linear',
            opacity: completing ? 0 : 0.6,
            transition: 'opacity 300ms ease'
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

/**
 * ProtectedRoute Component
 * 
 * Security improvements:
 * - Uses AuthContext for session verification (no URL tokens)
 * - Redirects to /login on same domain (not external subdomain)
 * - Session managed by Supabase internally
 * - No sensitive data in URLs or localStorage (except Supabase session)
 */
const ProtectedRoute = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showLoader, setShowLoader] = useState(true);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);

  // Ensure minimum loading time for visual effect
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadTimeElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle authentication check and redirect
  useEffect(() => {
    if (auth.isLoading) return;

    if (!auth.isAuthenticated && minLoadTimeElapsed) {
      window.dispatchEvent(new Event('auth-loader-complete'));
      const redirectTimer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }

    if (auth.isAuthenticated && minLoadTimeElapsed) {
      window.dispatchEvent(new Event('auth-loader-complete'));
      const hideLoaderTimer = setTimeout(() => setShowLoader(false), 1000);
      return () => clearTimeout(hideLoaderTimer);
    }
  }, [auth.isLoading, auth.isAuthenticated, minLoadTimeElapsed, navigate]);

  const handleLoaderDone = () => {
    if (auth.isAuthenticated) setShowLoader(false);
  };

  if (showLoader || auth.isLoading) {
    return <AuthLoader onDone={handleLoaderDone} />;
  }

  return auth.isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;