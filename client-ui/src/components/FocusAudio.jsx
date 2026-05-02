import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

const STATIONS = [
  {
    id: 'swiss-classic',
    name: 'Bach & Beethoven',
    description: 'Radio Swiss Classic — orchestral & chamber',
    src: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128',
    icon: 'solar:music-notes-linear',
  },
  {
    id: 'classic-fm',
    name: 'Classic FM',
    description: 'Popular orchestral & film scores (UK)',
    src: 'https://media-ice.musicradio.com/ClassicFMMP3',
    icon: 'solar:vinyl-record-linear',
  },
  {
    id: 'wqxr',
    name: 'WQXR New York',
    description: 'Symphonies, opera & piano concertos',
    src: 'https://stream.wqxr.org/wqxr',
    icon: 'solar:headphones-linear',
  },
  {
    id: 'venice',
    name: 'Venice Classic',
    description: 'Italian baroque & Renaissance pieces',
    src: 'https://streamingv2.shoutcast.com/Venice-Classic-Radio-Italia',
    icon: 'solar:star-rings-linear',
  },
];

const STORAGE_KEY = 'eduPractice_focusAudio';

export default function FocusAudio() {
  const audioRef = useRef(null);
  const [open, setOpen]       = useState(false);
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(0.35);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const station = STATIONS.find(s => s.id === stationId) || STATIONS[0];

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
      audioRef.current.src = target.src;
      audioRef.current.volume = volume;
      await audioRef.current.play();
      setPlaying(true);
      setLoading(false);
    } catch {
      setError('Could not start stream. Try another station.');
      setPlaying(false);
      setLoading(false);
    }
  };

  const handleStationClick = (id) => {
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

  return (
    <div className="relative">
      <audio ref={audioRef} preload="none" />

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Focus audio"
        aria-expanded={open}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
          playing
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
            : open
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
        }`}
      >
        {loading ? (
          <Icon icon="solar:refresh-linear" width="15" className="animate-spin" />
        ) : playing ? (
          <Icon icon="solar:soundwave-bold" width="15" className="text-emerald-400" />
        ) : (
          <Icon icon="solar:music-notes-linear" width="15" />
        )}
        <span className="hidden sm:inline leading-none">
          {playing ? station.name : 'Classical'}
        </span>
        {/* Mobile: show "Music" label or playing indicator dot */}
        <span className="sm:hidden text-xs leading-none">
          {playing ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Music
            </span>
          ) : 'Music'}
        </span>
      </button>

      {/* ── Popup Panel ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/*
            Mobile  : fixed bottom sheet, sits just above the bottom nav (bottom-[68px])
            Desktop : absolute dropdown below the trigger (top-full mt-2, right-aligned)
          */}
          <div className="
            fixed left-4 right-4 bottom-[68px] z-50 max-h-[70vh] flex flex-col
            sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2 sm:w-80 sm:max-h-none
            bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden
          ">

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/[0.07] shrink-0 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Classical Focus</p>
                <p className="text-xs text-slate-400 mt-0.5">Music to help you concentrate</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Main play/stop */}
                <button
                  onClick={togglePlay}
                  disabled={loading}
                  aria-label={playing ? 'Stop' : 'Play'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
                    playing
                      ? 'bg-emerald-500 text-[#0B1120] hover:bg-emerald-400'
                      : 'bg-[#f99c00] text-[#0B1120] hover:bg-[#f0930a]'
                  }`}
                >
                  {loading
                    ? <Icon icon="solar:refresh-linear" width="18" className="animate-spin" />
                    : playing
                    ? <Icon icon="solar:stop-bold" width="18" />
                    : <Icon icon="solar:play-bold" width="18" />
                  }
                </button>

                {/* Close (mobile only, sm+ the backdrop handles it) */}
                <button
                  onClick={() => setOpen(false)}
                  className="sm:hidden w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <Icon icon="solar:close-circle-linear" width="18" />
                </button>
              </div>
            </div>

            {/* Station list */}
            <div className="p-2 overflow-y-auto flex-1">
              {STATIONS.map(s => {
                const active = s.id === stationId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStationClick(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-[#f99c00]/10 border border-[#f99c00]/25'
                        : 'border border-transparent hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                      active ? 'bg-[#f99c00]/20 text-[#f99c00]' : 'bg-white/[0.06] text-slate-400'
                    }`}>
                      <Icon icon={s.icon} width="18" />
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-slate-300'}`}>
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{s.description}</p>
                    </div>
                    {active && playing && (
                      <Icon icon="solar:soundwave-bold" width="15" className="text-emerald-400 animate-pulse shrink-0" />
                    )}
                    {active && !playing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f99c00]/60 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume + footer */}
            <div className="px-4 py-3.5 border-t border-white/[0.07] space-y-3 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Icon icon={volumeIcon} width="17" className="text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-[#f99c00] h-1.5"
                  aria-label="Volume"
                />
                <span className="text-xs text-slate-400 tabular-nums w-9 text-right font-medium">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {error && (
                <p className="text-xs text-red-300 flex items-start gap-1.5">
                  <Icon icon="solar:danger-circle-linear" width="13" className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <p className="text-[10px] text-slate-600 leading-relaxed">
                Streams play while you practise and stop when you leave.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
