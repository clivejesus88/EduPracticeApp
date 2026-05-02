import React from 'react';

/* ─────────────────────────────────────────────
   Individual SVG badge designs — one per badge
   All badges use viewBox="0 0 100 100"
   Locked → greyscale + dim applied by parent
───────────────────────────────────────────── */

function FirstStepsBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fs-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
        <radialGradient id="fs-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
        <filter id="fs-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0ea5e9" floodOpacity="0.7" />
        </filter>
      </defs>
      {/* Glow halo */}
      <ellipse cx="50" cy="54" rx="42" ry="42" fill="url(#fs-glow)" />
      {/* Shield body */}
      <path d="M50 6 L86 20 L86 58 Q86 84 50 96 Q14 84 14 58 L14 20 Z"
        fill="url(#fs-bg)" filter="url(#fs-shadow)" />
      {/* Inner shield bevel */}
      <path d="M50 13 L80 25 L80 58 Q80 79 50 89 Q20 79 20 58 L20 25 Z"
        fill="none" stroke="#bae6fd" strokeWidth="1" strokeOpacity="0.35" />
      {/* Rocket body */}
      <path d="M50 28 C50 28 42 38 42 50 L42 58 L58 58 L58 50 C58 38 50 28 50 28Z"
        fill="white" fillOpacity="0.95" />
      {/* Rocket nose */}
      <path d="M50 22 L44 36 L56 36 Z" fill="#e0f2fe" />
      {/* Rocket wings */}
      <path d="M42 52 L36 62 L42 60 Z" fill="#7dd3fc" />
      <path d="M58 52 L64 62 L58 60 Z" fill="#7dd3fc" />
      {/* Rocket window */}
      <circle cx="50" cy="47" r="4" fill="#0ea5e9" />
      <circle cx="50" cy="47" r="2.5" fill="#e0f2fe" />
      {/* Exhaust flames */}
      <ellipse cx="47" cy="61" rx="2" ry="3" fill="#fbbf24" fillOpacity="0.9" />
      <ellipse cx="53" cy="61" rx="2" ry="3" fill="#fbbf24" fillOpacity="0.9" />
      <ellipse cx="50" cy="63" rx="1.5" ry="4" fill="#f97316" fillOpacity="0.8" />
      {/* Star dots */}
      <circle cx="26" cy="32" r="1.2" fill="white" fillOpacity="0.7" />
      <circle cx="74" cy="28" r="1" fill="white" fillOpacity="0.5" />
      <circle cx="30" cy="72" r="0.9" fill="white" fillOpacity="0.4" />
      <circle cx="70" cy="70" r="1.2" fill="white" fillOpacity="0.6" />
      {/* Rim stars */}
      <polygon points="22,45 23.2,48.7 27,48.7 24,50.9 25.2,54.6 22,52.4 18.8,54.6 20,50.9 17,48.7 20.8,48.7"
        fill="#bae6fd" fillOpacity="0.6" transform="scale(0.7) translate(16,16)" />
    </svg>
  );
}

function ConsistentLearnerBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cl-bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id="cl-glow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fca5a5" stopOpacity="0" />
        </radialGradient>
        <filter id="cl-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f97316" floodOpacity="0.7" />
        </filter>
      </defs>
      <ellipse cx="50" cy="55" rx="40" ry="40" fill="url(#cl-glow)" />
      {/* Outer flame silhouette */}
      <path d="M50 8 C50 8 72 30 72 55 C72 75 62 92 50 92 C38 92 28 75 28 55 C28 30 50 8 50 8Z"
        fill="url(#cl-bg)" filter="url(#cl-shadow)" />
      {/* Inner flame lighter */}
      <path d="M50 28 C50 28 64 44 64 58 C64 72 57 82 50 82 C43 82 36 72 36 58 C36 44 50 28 50 28Z"
        fill="#fed7aa" fillOpacity="0.25" />
      {/* Core flame */}
      <path d="M50 42 C50 42 60 54 60 63 C60 72 55.5 78 50 78 C44.5 78 40 72 40 63 C40 54 50 42 50 42Z"
        fill="#fef3c7" fillOpacity="0.5" />
      {/* Hot inner tip */}
      <ellipse cx="50" cy="65" rx="7" ry="10" fill="#fef9c3" fillOpacity="0.7" />
      {/* Ember sparks */}
      <circle cx="36" cy="44" r="1.5" fill="#fbbf24" fillOpacity="0.9" />
      <circle cx="64" cy="40" r="1.2" fill="#fbbf24" fillOpacity="0.8" />
      <circle cx="32" cy="58" r="1" fill="#fb923c" fillOpacity="0.7" />
      <circle cx="68" cy="55" r="1.3" fill="#fb923c" fillOpacity="0.7" />
      <circle cx="40" cy="32" r="0.9" fill="#fef08a" fillOpacity="0.9" />
      <circle cx="60" cy="28" r="1.1" fill="#fef08a" fillOpacity="0.8" />
      {/* Ring at base */}
      <path d="M38 82 Q50 88 62 82" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

function MasterOfPhysicsBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <radialGradient id="mp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
        <filter id="mp-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.7" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#mp-glow)" />
      {/* Hexagon */}
      <polygon points="50,7 87,28.5 87,71.5 50,93 13,71.5 13,28.5"
        fill="url(#mp-bg)" filter="url(#mp-shadow)" />
      {/* Inner hexagon bevel */}
      <polygon points="50,14 81,31.5 81,68.5 50,86 19,68.5 19,31.5"
        fill="none" stroke="#ddd6fe" strokeWidth="0.8" strokeOpacity="0.3" />
      {/* Atom nucleus */}
      <circle cx="50" cy="50" r="5.5" fill="#e9d5ff" />
      <circle cx="50" cy="50" r="3" fill="#7c3aed" />
      {/* Orbit 1 — horizontal */}
      <ellipse cx="50" cy="50" rx="22" ry="8" stroke="#c4b5fd" strokeWidth="1.2" strokeOpacity="0.8" />
      {/* Orbit 2 — tilted 60° */}
      <ellipse cx="50" cy="50" rx="22" ry="8" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.7"
        transform="rotate(60 50 50)" />
      {/* Orbit 3 — tilted -60° */}
      <ellipse cx="50" cy="50" rx="22" ry="8" stroke="#8b5cf6" strokeWidth="1.2" strokeOpacity="0.6"
        transform="rotate(-60 50 50)" />
      {/* Electron dots */}
      <circle cx="72" cy="50" r="2.5" fill="#e9d5ff" />
      <circle cx="39" cy="32" r="2.5" fill="#ddd6fe" />
      <circle cx="39" cy="68" r="2.5" fill="#c4b5fd" />
      {/* Corner dots */}
      <circle cx="24" cy="40" r="1.2" fill="#c4b5fd" fillOpacity="0.5" />
      <circle cx="76" cy="60" r="1.2" fill="#c4b5fd" fillOpacity="0.5" />
    </svg>
  );
}

function QuickThinkerBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="qt-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="qt-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </radialGradient>
        <filter id="qt-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
        </filter>
      </defs>
      <ellipse cx="50" cy="50" rx="46" ry="46" fill="url(#qt-glow)" />
      {/* Diamond */}
      <path d="M50 5 L94 50 L50 95 L6 50 Z"
        fill="url(#qt-bg)" filter="url(#qt-shadow)" />
      {/* Inner diamond bevel */}
      <path d="M50 13 L87 50 L50 87 L13 50 Z"
        fill="none" stroke="#fef9c3" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Diamond facet lines */}
      <line x1="50" y1="13" x2="50" y2="87" stroke="#fef3c7" strokeWidth="0.5" strokeOpacity="0.25" />
      <line x1="13" y1="50" x2="87" y2="50" stroke="#fef3c7" strokeWidth="0.5" strokeOpacity="0.25" />
      {/* Lightning bolt */}
      <path d="M56 22 L40 52 L52 52 L44 78 L62 44 L50 44 Z"
        fill="white" fillOpacity="0.97" />
      {/* Speed lines */}
      <line x1="20" y1="40" x2="30" y2="40" stroke="#fef9c3" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="18" y1="50" x2="29" y2="50" stroke="#fef9c3" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="20" y1="60" x2="30" y2="60" stroke="#fef9c3" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="70" y1="40" x2="80" y2="40" stroke="#fef9c3" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="71" y1="50" x2="82" y2="50" stroke="#fef9c3" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="70" y1="60" x2="80" y2="60" stroke="#fef9c3" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

function MathsWizardBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mw-bg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#7e22ce" />
        </radialGradient>
        <radialGradient id="mw-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
        </radialGradient>
        <filter id="mw-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#a21caf" floodOpacity="0.7" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#mw-glow)" />
      {/* 5-pointed star */}
      <polygon
        points="50,6 61.8,38.2 95.1,38.2 68.1,57.5 78.6,90.1 50,71.5 21.4,90.1 31.9,57.5 4.9,38.2 38.2,38.2"
        fill="url(#mw-bg)" filter="url(#mw-shadow)" />
      {/* Inner star highlight */}
      <polygon
        points="50,14 59.4,40.8 87.6,40.8 65.1,57.1 73.7,83.8 50,67.8 26.3,83.8 34.9,57.1 12.4,40.8 40.6,40.8"
        fill="none" stroke="#f5d0fe" strokeWidth="0.7" strokeOpacity="0.3" />
      {/* Sigma symbol (Σ) */}
      <text x="50" y="63" textAnchor="middle" fontSize="30" fontWeight="bold"
        fill="white" fillOpacity="0.95" fontFamily="serif">Σ</text>
      {/* Star sparkle corners */}
      <circle cx="50" cy="10" r="2" fill="#fae8ff" fillOpacity="0.8" />
      <circle cx="92" cy="42" r="1.5" fill="#fae8ff" fillOpacity="0.6" />
      <circle cx="76" cy="87" r="1.5" fill="#fae8ff" fillOpacity="0.6" />
      <circle cx="24" cy="87" r="1.5" fill="#fae8ff" fillOpacity="0.6" />
      <circle cx="8" cy="42" r="1.5" fill="#fae8ff" fillOpacity="0.6" />
      {/* Floating math dots */}
      <text x="20" y="35" fontSize="7" fill="#f5d0fe" fillOpacity="0.7" fontFamily="monospace">+</text>
      <text x="73" y="32" fontSize="7" fill="#f5d0fe" fillOpacity="0.7" fontFamily="monospace">π</text>
      <text x="15" y="68" fontSize="6" fill="#f5d0fe" fillOpacity="0.6" fontFamily="monospace">∫</text>
      <text x="76" y="72" fontSize="7" fill="#f5d0fe" fillOpacity="0.6" fontFamily="monospace">√</text>
    </svg>
  );
}

function CenturyClubBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cc-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <radialGradient id="cc-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </radialGradient>
        <filter id="cc-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#d97706" floodOpacity="0.8" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#cc-glow)" />
      {/* Medal circle */}
      <circle cx="50" cy="50" r="40" fill="url(#cc-bg)" filter="url(#cc-shadow)" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="40" stroke="#fef3c7" strokeWidth="2" strokeOpacity="0.4" fill="none" />
      {/* Inner ring */}
      <circle cx="50" cy="50" r="33" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      {/* Laurel left */}
      <path d="M18 50 C18 44 22 38 28 36 C24 41 22 46 22 50 C22 54 24 59 28 64 C22 62 18 56 18 50Z"
        fill="#fef3c7" fillOpacity="0.5" />
      <path d="M20 43 C23 39 27 36 30 35" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M19 50 C20 47 21 44 23 42" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M20 57 C21 53 22 50 24 48" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      {/* Laurel right */}
      <path d="M82 50 C82 44 78 38 72 36 C76 41 78 46 78 50 C78 54 76 59 72 64 C78 62 82 56 82 50Z"
        fill="#fef3c7" fillOpacity="0.5" />
      <path d="M80 43 C77 39 73 36 70 35" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M81 50 C80 47 79 44 77 42" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M80 57 C79 53 78 50 76 48" stroke="#fef9c3" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      {/* "100" text */}
      <text x="50" y="56" textAnchor="middle" fontSize="24" fontWeight="900"
        fill="white" fillOpacity="0.97" fontFamily="sans-serif" letterSpacing="-1">100</text>
      {/* Small star at top */}
      <polygon points="50,16 52.4,23.4 60,23.4 54.2,27.9 56.5,35.3 50,30.7 43.5,35.3 45.8,27.9 40,23.4 47.6,23.4"
        fill="#fef9c3" fillOpacity="0.9" transform="scale(0.6) translate(33 9)" />
    </svg>
  );
}

function IronStreakBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="is-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="is-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#64748b" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="is-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </radialGradient>
        <filter id="is-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#64748b" floodOpacity="0.7" />
        </filter>
      </defs>
      <ellipse cx="50" cy="50" rx="44" ry="44" fill="url(#is-glow)" />
      {/* Rounded rectangle plate */}
      <rect x="12" y="12" width="76" height="76" rx="14" fill="url(#is-bg)" filter="url(#is-shadow)" />
      <rect x="12" y="12" width="76" height="76" rx="14" fill="url(#is-sheen)" />
      {/* Rivet corners */}
      <circle cx="22" cy="22" r="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
      <circle cx="78" cy="22" r="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
      <circle cx="22" cy="78" r="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
      <circle cx="78" cy="78" r="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Chain links */}
      {/* Link 1 */}
      <ellipse cx="50" cy="32" rx="9" ry="5.5" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
      <ellipse cx="50" cy="32" rx="5" ry="2" stroke="#cbd5e1" strokeWidth="1" fill="none" strokeOpacity="0.5" />
      {/* Link 2 */}
      <ellipse cx="50" cy="50" rx="9" ry="5.5" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
      <ellipse cx="50" cy="50" rx="5" ry="2" stroke="#cbd5e1" strokeWidth="1" fill="none" strokeOpacity="0.5" />
      {/* Link 3 */}
      <ellipse cx="50" cy="68" rx="9" ry="5.5" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
      <ellipse cx="50" cy="68" rx="5" ry="2" stroke="#cbd5e1" strokeWidth="1" fill="none" strokeOpacity="0.5" />
      {/* Connector bars */}
      <rect x="47.5" y="36.5" width="5" height="8.5" fill="#64748b" />
      <rect x="47.5" y="55" width="5" height="8.5" fill="#64748b" />
      {/* "7" label */}
      <text x="80" y="28" textAnchor="middle" fontSize="9" fontWeight="bold"
        fill="#94a3b8" fontFamily="monospace">7</text>
      <text x="80" y="36" textAnchor="middle" fontSize="5.5"
        fill="#64748b" fontFamily="monospace">DAYS</text>
      {/* Horizontal lines (iron texture) */}
      <line x1="18" y1="85" x2="82" y2="85" stroke="#334155" strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
}

function TopScorerBadge() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ts-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <radialGradient id="ts-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
        </radialGradient>
        <filter id="ts-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.7" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#ts-glow)" />
      {/* Crown base band */}
      <rect x="16" y="62" width="68" height="20" rx="5" fill="url(#ts-bg)" filter="url(#ts-shadow)" />
      <rect x="16" y="62" width="68" height="20" rx="5" fill="none" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Gems on base */}
      <polygon points="32,68 35,73 29,73" fill="#34d399" />
      <polygon points="50,68 53,73 47,73" fill="#a7f3d0" />
      <polygon points="68,68 71,73 65,73" fill="#34d399" />
      {/* Crown spires */}
      {/* Left spike */}
      <path d="M22 62 L28 34 L34 62 Z" fill="url(#ts-bg)" filter="url(#ts-shadow)" />
      <path d="M22 62 L28 34 L34 62 Z" fill="none" stroke="#6ee7b7" strokeWidth="0.7" strokeOpacity="0.4" />
      {/* Centre spike — taller */}
      <path d="M38 62 L50 22 L62 62 Z" fill="url(#ts-bg)" filter="url(#ts-shadow)" />
      <path d="M38 62 L50 22 L62 62 Z" fill="none" stroke="#6ee7b7" strokeWidth="0.7" strokeOpacity="0.4" />
      {/* Right spike */}
      <path d="M66 62 L72 34 L78 62 Z" fill="url(#ts-bg)" filter="url(#ts-shadow)" />
      <path d="M66 62 L72 34 L78 62 Z" fill="none" stroke="#6ee7b7" strokeWidth="0.7" strokeOpacity="0.4" />
      {/* Star at crown tip */}
      <polygon points="50,22 52.4,29.4 60,29.4 54.2,33.9 56.5,41.3 50,36.7 43.5,41.3 45.8,33.9 40,29.4 47.6,29.4"
        fill="#d1fae5" fillOpacity="0.95" transform="scale(0.65) translate(27 1)" />
      {/* Crown base gems */}
      <circle cx="28" cy="34" r="3" fill="#6ee7b7" fillOpacity="0.8" />
      <circle cx="72" cy="34" r="3" fill="#6ee7b7" fillOpacity="0.8" />
      <circle cx="50" cy="22" r="3.5" fill="#d1fae5" fillOpacity="0.95" />
    </svg>
  );
}

const BADGE_SVG_MAP = {
  'First Steps': FirstStepsBadge,
  'Consistent Learner': ConsistentLearnerBadge,
  'Master of Physics': MasterOfPhysicsBadge,
  'Quick Thinker': QuickThinkerBadge,
  'Maths Wizard': MathsWizardBadge,
  'Century Club': CenturyClubBadge,
  'Iron Streak': IronStreakBadge,
  'Top Scorer': TopScorerBadge,
};

export default function BadgeArt({ name, unlocked, size = 72 }) {
  const Comp = BADGE_SVG_MAP[name];
  if (!Comp) return null;
  return (
    <div
      style={{
        width: size,
        height: size,
        filter: unlocked
          ? 'drop-shadow(0 0 8px rgba(255,255,255,0.15))'
          : 'grayscale(1) brightness(0.3)',
        transition: 'filter 0.3s ease',
      }}
    >
      <Comp />
    </div>
  );
}
