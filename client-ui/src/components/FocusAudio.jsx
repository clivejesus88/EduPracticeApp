import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

const STATIONS = [
  {
    id: 'lofi-beats',
    name: 'Lofi Beats',
    description: 'Instrumental hip-hop & chillhop',
    src: 'https://ice1.somafm.com/fluid-128-mp3',
    icon: 'solar:headphones-round-sound-linear',
  },
  {
    id: 'chill-study',
    name: 'Chill Study',
    description: 'Downtempo grooves for deep work',
    src: 'https://ice1.somafm.com/groovesalad-128-mp3',
    icon: 'solar:music-note-linear',
  },
  {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    description: 'Mellow vocal chillout',
    src: 'https://ice1.somafm.com/lush-128-mp3',
    icon: 'solar:cup-hot-linear',
  },
  {
    id: 'ambient',
    name: 'Ambient Focus',
    description: 'Atmospheric, no distractions',
    src: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    icon: 'solar:planet-linear',
  },
];

const STORAGE_KEY = 'eduPractice_focusAudio';

export default function FocusAudio() {
  const audioRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const station = STATIONS.find(s => s.id === stationId) || STATIONS[0];

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.stationId && STATIONS.some(s => s.id === saved.stationId)) {
        setStationId(saved.stationId);
      }
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
    } catch (e) {
      setError('Could not start the stream. Try another station.');
      setPlaying(false);
      setLoading(false);
    }
  };

  const handleStationClick = (id) => {
    setStationId(id);
    if (playing || loading) {
      play(id);
    }
  };

  const togglePlay = () => {
    if (playing || loading) stop();
    else play();
  };

  // Cleanup on unmount (e.g. when leaving the exam)
  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  return (
    <div className="relative">
      <audio ref={audioRef} preload="none" />

      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
          playing
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-white/5 border-white/10 text-slate-200 hover:border-white/30'
        }`}
        aria-label="Focus audio"
        aria-expanded={open}
      >
        <Icon
          icon={playing ? 'solar:soundwave-bold' : 'solar:headphones-round-sound-linear'}
          width="16"
          className={playing ? 'animate-pulse' : ''}
        />
        <span className="hidden sm:inline">{playing ? station.name : 'Focus audio'}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#111827] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Focus audio</p>
                  <p className="text-xs text-slate-400 mt-0.5">Lofi beats to help you concentrate</p>
                </div>
                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    playing
                      ? 'bg-emerald-500 text-[#0B1120] hover:bg-emerald-500/90'
                      : 'bg-[#f99c00] text-[#0B1120] hover:bg-[#f99c00]/90 disabled:opacity-50'
                  }`}
                  aria-label={playing ? 'Stop' : 'Play'}
                >
                  {loading ? (
                    <Icon icon="solar:refresh-linear" width="20" className="animate-spin" />
                  ) : playing ? (
                    <Icon icon="solar:stop-bold" width="20" />
                  ) : (
                    <Icon icon="solar:play-bold" width="20" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-2 max-h-72 overflow-y-auto">
              {STATIONS.map(s => {
                const active = s.id === stationId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStationClick(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                      active
                        ? 'bg-[#f99c00]/10 border border-[#f99c00]/30'
                        : 'border border-transparent hover:bg-white/5'
                    }`}
                  >
                    <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                      active ? 'bg-[#f99c00]/20 text-[#f99c00]' : 'bg-white/5 text-slate-300'
                    }`}>
                      <Icon icon={s.icon} width="18" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-slate-200'}`}>
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{s.description}</p>
                    </div>
                    {active && playing && (
                      <Icon icon="solar:soundwave-bold" width="16" className="text-emerald-300 animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <Icon
                  icon={volume === 0 ? 'solar:volume-cross-linear' : volume < 0.4 ? 'solar:volume-small-linear' : 'solar:volume-loud-linear'}
                  width="18"
                  className="text-slate-400 shrink-0"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-[#f99c00]"
                  aria-label="Volume"
                />
                <span className="text-xs text-slate-400 tabular-nums w-9 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              {error && (
                <p className="text-xs text-red-300 flex items-start gap-1.5">
                  <Icon icon="solar:danger-circle-linear" width="14" className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Streams continue while you take the exam. Audio stops automatically when you leave or submit.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
