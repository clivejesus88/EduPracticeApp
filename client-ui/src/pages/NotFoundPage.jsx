import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../contexts/AuthContext";

export default function NotFoundPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [glitch, setGlitch]   = useState(false);

  useEffect(() => {
    // staggered mount
    const t = setTimeout(() => setMounted(true), 50);

    // occasional glitch on "404"
    const glitchLoop = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3500);

    return () => { clearTimeout(t); clearInterval(glitchLoop); };
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6"
      style={{ background: "#0B1120", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Ambient grid ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249,156,0,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,156,0,.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Radial amber glow ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: "680px",
          height: "680px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,156,0,.10) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(2px)",
        }}
      />

      {/* ── Top progress bar — static amber ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
        <div className="h-full bg-[#f99c00]" style={{ width: "38%" }} />
        <div
          className="absolute top-0 h-0.5 w-24 bg-gradient-to-r from-transparent to-[#f99c00]"
          style={{ left: "calc(38% - 6rem)", filter: "blur(3px)" }}
        />
      </div>

      {/* ── Brand wordmark ── */}
      <div
        className="absolute top-6 left-8 flex items-center gap-2.5"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 500ms ease, transform 500ms ease",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#fff 0%,#e2e8f0 100%)",
          }}
        >
          <Icon icon="lucide:graduation-cap" width={17} height={17} color="#0B1120" style={{ strokeWidth: 1.5 }} />
        </div>
        <span className="text-white/80 text-sm font-bold tracking-tight">EduPractice</span>
      </div>

      {/* ── Main card ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
        style={{
          opacity:   mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 600ms ease 100ms, transform 600ms ease 100ms",
        }}
      >
        {/* 404 number — glitch effect */}
        <div className="relative select-none mb-2" style={{ lineHeight: 1 }}>
          <span
            className="text-[120px] font-bold"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: "transparent",
              WebkitTextStroke: "2px rgba(249,156,0,0.25)",
              letterSpacing: "-4px",
            }}
          >
            404
          </span>

          {/* Glitch layers */}
          <span
            className="absolute inset-0 text-[120px] font-bold"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: "#f99c00",
              letterSpacing: "-4px",
              clipPath: glitch ? "inset(30% 0 50% 0)" : "inset(0 0 0 0)",
              transform: glitch ? "translate(-4px, 0)" : "translate(0,0)",
              opacity: glitch ? 0.9 : 1,
              transition: glitch ? "none" : "opacity 200ms ease",
              mixBlendMode: "screen",
            }}
          >
            404
          </span>
          <span
            className="absolute inset-0 text-[120px] font-bold"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: "#00e5ff",
              letterSpacing: "-4px",
              clipPath: glitch ? "inset(55% 0 20% 0)" : "inset(100% 0 0 0)",
              transform: glitch ? "translate(4px, 0)" : "translate(0,0)",
              opacity: glitch ? 0.6 : 0,
              transition: glitch ? "none" : "opacity 200ms ease",
              mixBlendMode: "screen",
            }}
          >
            404
          </span>
        </div>

        {/* Icon badge */}
        <div
          className="mb-6 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(249,156,0,.15) 0%, rgba(249,156,0,.05) 100%)",
            border: "1px solid rgba(249,156,0,.2)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.8)",
            transition: "opacity 500ms ease 300ms, transform 500ms ease 300ms",
          }}
        >
          <Icon icon="solar:map-point-broken" width={26} height={26} color="#f99c00" />
        </div>

        {/* Heading */}
        <h1
          className="text-white text-2xl font-bold tracking-tight mb-3"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 500ms ease 400ms",
          }}
        >
          Page not found
        </h1>

        {/* Description */}
        <p
          className="text-white/45 text-sm leading-relaxed mb-8 max-w-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 500ms ease 500ms",
          }}
        >
          Looks like this lesson doesn't exist — or it may have been moved.
          Head back to your dashboard to keep learning.
        </p>

        {/* Divider */}
        <div
          className="w-full h-px mb-8"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(249,156,0,.2), transparent)",
            opacity: mounted ? 1 : 0,
            transition: "opacity 500ms ease 550ms",
          }}
        />

        {/* Actions — auth-aware: signed-in users return to the app; guests can sign in or sign up */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 500ms ease 600ms, transform 500ms ease 600ms",
          }}
        >
          {authLoading ? (
            <div className="h-10 w-40 rounded-xl bg-white/5 animate-pulse" aria-hidden />
          ) : isAuthenticated ? (
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg,#f99c00 0%,#f88c00 100%)",
                color: "#0B1120",
                boxShadow: "0 0 24px rgba(249,156,0,.25)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 0 36px rgba(249,156,0,.45)";
                e.currentTarget.style.transform  = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 0 24px rgba(249,156,0,.25)";
                e.currentTarget.style.transform  = "translateY(0)";
              }}
            >
              <Icon icon="lucide:layout-dashboard" width={16} height={16} />
              Back to dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg,#f99c00 0%,#f88c00 100%)",
                  color: "#0B1120",
                  boxShadow: "0 0 24px rgba(249,156,0,.25)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 0 36px rgba(249,156,0,.45)";
                  e.currentTarget.style.transform  = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(249,156,0,.25)";
                  e.currentTarget.style.transform  = "translateY(0)";
                }}
              >
                <Icon icon="lucide:log-in" width={16} height={16} />
                Sign in
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/90 border border-white/15 hover:bg-white/5 transition-all duration-200"
              >
                <Icon icon="lucide:user-plus" width={16} height={16} />
                Create account
              </Link>
            </>
          )}
        </div>

        {/* Error code tag */}
        <p
          className="mt-8 text-xs"
          style={{
            color: "rgba(249,156,0,.3)",
            opacity: mounted ? 1 : 0,
            transition: "opacity 500ms ease 700ms",
          }}
        >
          ERROR_CODE · HTTP_404 · PAGE_NOT_FOUND
        </p>
      </div>

      {/* ── Floating decorative orbs ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#f99c00", opacity: 0.4,
          top: "22%", left: "18%",
          animation: "float1 6s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 4, height: 4, borderRadius: "50%",
          background: "#f99c00", opacity: 0.25,
          top: "65%", right: "22%",
          animation: "float2 8s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "#fff", opacity: 0.08,
          bottom: "28%", left: "30%",
          animation: "float1 7s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50%       { transform: translateY(-8px) translateX(4px); }
        }
      `}</style>
    </div>
  );
}