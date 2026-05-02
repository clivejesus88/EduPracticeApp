import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

/* ── Station data with individual colour themes ──────────────────────────── */
const STATIONS = [
  {
    id: 'swiss-classic',
    name: 'Bach & Beethoven',
    shortName: 'Bach',
    label: 'Radio Swiss Classic',
    description: 'Orchestral & chamber music',
    src: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128',
    icon: 'solar:music-notes-linear',
    grad: 'from-blue-600 via-blue-500 to-indigo-600',
    glow: '#3b82f6',
    ring: 'ring-blue-500/40',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  {
    id: 'classic-fm',
    name: 'Classic FM',
    shortName: 'Classic FM',
    label: 'Popular & Film Scores',
    description: 'Orchestral & film soundtracks',
    src: 'https://media-ice.musicradio.com/ClassicFMMP3',
    icon: 'solar:vinyl-record-linear',
    grad: 'from-rose-600 via-rose-500 to-pink-600',
    glow: '#f43f5e',
    ring: 'ring-rose-500/40',
    badge: 'bg-rose-500/20 text-rose-300',
  },
  {
    id: 'wqxr',
    name: 'WQXR New York',
    shortName: 'WQXR',
    label: 'Symphonies & Opera',
    description: 'Opera, piano & concertos',
    src: 'https://stream.wqxr.org/wqxr',
    icon: 'solar:headphones-linear',
    grad: 'from-violet-600 via-violet-500 to-purple-600',
    glow: '#7c3aed',
    ring: 'ring-violet-500/40',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  {
    id: 'venice',
    name: 'Venice Classic',
    shortName: 'Venice',
    label: 'Italian Baroque',
    description: 'Baroque & Renaissance pieces',
    src: 'https://streamingv2.shoutcast.com/Venice-Classic-Radio-Italia',
    icon: 'solar:star-rings-linear',
    grad: 'from-amber-500 via-orange-500 to-amber-600',
    glow: '#f59e0b',
    ring: 'ring-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300',
  },
];

const STORAGE_KEY = 'eduPractice_focusAudio';

/* ── Animated equalizer bars ─────────────────────────────────────────────── */
const BAR_DELAYS  = [0, 0.2, 0.1, 0.3, 0.15];
const BAR_HEIGHTS = [55, 100, 75, 90, 60]; // % of 20px max

function EqualizerBars({ playing, color = '#10b981' }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {BAR_DELAYS.map((delay, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: playing ? undefined : Math.max(4, BAR_HEIGHTS[i] * 0.2),
            background: color,
            borderRadius: 99,
            animationName: playing ? 'eqBar' : 'none',
            animationDuration: `${0.55 + i * 0.08}s`,
            animationDelay: `${delay}s`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}
    </div>
  );
}

export default function FocusAudio() {
  const audioRef = useRef(null);
  const [open, setOpen]           = useState(false);
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [playing, setPlaying]     = useState(false);
  const [volume, setVolume]       = useState(0.35);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const station = STATIONS.find(s => s.id === stationId) || STATIONS[0];

  /* persist */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.stationId && STATIONS.some(s => s.id === saved.stationId)) setStationId(saved.stationId);
      if (typeof saved.volume === 'number') setVolume(saved.volume);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stationId, volume }));
  }, [stationId, volume]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setPlaying(false);
    setLoading(false);
  };

  const play = async (id = stationId) => {
    setError(null);
    setLoading(true);
    const target = STATIONS.find(s => s.id === id) || STATIONS[0];
    try {
      if (!audioRef.current) return;
      audioRef.current.src    = target.src;
      audioRef.current.volume = volume;
      await audioRef.current.play();
      setPlaying(true);
      setLoading(false);
    } catch {
      setError('Stream unavailable. Try another station.');
      setPlaying(false);
      setLoading(false);
    }
  };

  const handleStation = (id) => {
    setStationId(id);
    if (playing || loading) play(id);
  };

  const togglePlay = () => (playing || loading ? stop() : play());

  useEffect(() => () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
  }, []);

  const volumeIcon = volume === 0
    ? 'solar:volume-cross-bold'
    : volume < 0.45
    ? 'solar:volume-small-bold'
    : 'solar:volume-loud-bold';

  /* ── Trigger ─────────────────────────────────────────────────────────── */
  return (
    <div className="relative">
      {/* Inject keyframe */}
      <style>{`
        @keyframes eqBar {
          from { height: 4px; }
          to   { height: 20px; }
        }
      `}</style>

      <audio ref={audioRef} preload="none" />

      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Focus audio"
        aria-expanded={open}
        className={`
          relative flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-xl
          border text-sm font-semibold transition-all duration-200 overflow-hidden
          ${playing
            ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/15'
            : open
            ? 'bg-white/[0.08] border-white/20 text-white'
            : 'bg-white/[0.04] border-white/[0.09] text-slate-400 hover:text-slate-200 hover:border-white/20'}
        `}
      >
        {/* Subtle glow shimmer when playing */}
        {playing && (
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        )}

        {loading
          ? <Icon icon="solar:refresh-linear" width="15" className="animate-spin" />
          : <EqualizerBars playing={playing} color={playing ? '#34d399' : '#64748b'} />
        }

        <span className="hidden sm:inline">
          {playing ? station.shortName : 'Focus Music'}
        </span>
        <span className="sm:hidden text-[11px]">
          {playing ? station.shortName : 'Music'}
        </span>
      </button>

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
               onClick={() => setOpen(false)} aria-hidden="true" />

          <div className={`
            fixed left-3 right-3 bottom-[68px] z-50 flex flex-col overflow-hidden
            sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2 sm:w-[340px]
            rounded-2xl border border-white/[0.10] shadow-2xl
          `}
            style={{ background: 'linear-gradient(160deg,#0f1629 0%,#111827 60%,#0d1220 100%)' }}
          >

            {/* ── Hero strip ─────────────────────────────────────────── */}
            <div className={`relative overflow-hidden px-5 pt-5 pb-4 bg-gradient-to-br ${station.grad} shrink-0`}>
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.07] blur-sm pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-black/20 pointer-events-none" />

              <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      {playing ? 'Now playing' : 'Focus music'}
                    </span>
                    {playing && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-white/70 bg-black/20 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-white truncate leading-tight">{station.name}</p>
                  <p className="text-xs text-white/60 mt-0.5 truncate">{station.label}</p>

                  {/* Equalizer */}
                  <div className="mt-3">
                    <EqualizerBars playing={playing} color="rgba(255,255,255,0.7)" />
                  </div>
                </div>

                {/* Play/Stop button */}
                <button
                  onClick={togglePlay}
                  disabled={loading}
                  aria-label={playing ? 'Stop' : 'Play'}
                  className="shrink-0 ml-4 w-12 h-12 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur
                             flex items-center justify-center transition-all active:scale-90 disabled:opacity-40
                             shadow-lg border border-white/30"
                >
                  {loading
                    ? <Icon icon="solar:refresh-linear" width="20" className="animate-spin text-white" />
                    : playing
                    ? <Icon icon="solar:stop-bold" width="20" className="text-white" />
                    : <Icon icon="solar:play-bold" width="20" className="text-white ml-0.5" />
                  }
                </button>
              </div>
            </div>

            {/* ── Station grid 2×2 ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto shrink-0">
              {STATIONS.map(s => {
                const active = s.id === stationId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStation(s.id)}
                    className={`
                      group relative text-left p-3 rounded-xl transition-all duration-200
                      active:scale-95 overflow-hidden
                      ${active
                        ? `bg-gradient-to-br ${s.grad} shadow-lg ring-1 ${s.ring}`
                        : 'bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08]'}
                    `}
                  >
                    {/* Playing pulse glow */}
                    {active && playing && (
                      <span className="absolute inset-0 rounded-xl animate-pulse opacity-20 bg-white pointer-events-none" />
                    )}

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      active ? 'bg-white/25' : 'bg-white/[0.07]'
                    }`}>
                      <Icon icon={s.icon} width="17"
                            className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                    </div>

                    <p className={`text-xs font-bold leading-tight truncate ${active ? 'text-white' : 'text-slate-300'}`}>
                      {s.shortName}
                    </p>
                    <p className={`text-[10px] mt-0.5 truncate leading-snug ${active ? 'text-white/65' : 'text-slate-600'}`}>
                      {s.description}
                    </p>

                    {/* Active + playing indicator */}
                    {active && (
                      <div className="absolute top-2 right-2">
                        {playing
                          ? <span className="w-2 h-2 rounded-full bg-white animate-ping block opacity-70" />
                          : <span className="w-2 h-2 rounded-full bg-white/50 block" />
                        }
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Volume + footer ─────────────────────────────────────── */}
            <div className="px-4 pb-4 pt-1 space-y-3 shrink-0 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 pt-3">
                <Icon icon={volumeIcon} width="16" className="text-slate-500 shrink-0" />
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer accent-[#f99c00]"
                    style={{
                      background: `linear-gradient(to right, #f99c00 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                    }}
                    aria-label="Volume"
                  />
                </div>
                <span className="text-[11px] text-slate-500 tabular-nums w-8 text-right font-semibold">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {error && (
                <p className="text-xs text-red-300 flex items-start gap-1.5 bg-red-500/[0.08] border border-red-500/15 px-3 py-2 rounded-lg">
                  <Icon icon="solar:danger-circle-linear" width="13" className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-600">
                  Stops when you leave or submit.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="sm:hidden text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
