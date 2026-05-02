import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiBrain05Icon } from '@hugeicons/core-free-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { examLevels, physicsTopics, mathematicsTopics } from '../data/examStructure';
import ChatInterface from '../components/ChatInterface';
import { trackPracticeAttempt, trackTopicView } from '../utils/analyticsTracker';
import { evaluatePracticeSolution } from '../services/practiceAiService';

// ─── Draft persistence ────────────────────────────────────────────────────────
const DRAFT_KEY = 'eduPractice_practiceDraft';
const loadDraft = () => {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
};
const saveDraft = (d) => localStorage.setItem(DRAFT_KEY, JSON.stringify(d));

// ─── Scenario data ────────────────────────────────────────────────────────────
const SCENARIOS = {
  physics: {
    topic: 'Energy & Power',
    difficulty: 2,
    totalMarks: 10,
    stem: 'A recently excavated spherical marble artifact has diameter of 2.4 × 10³ mm',
    parts: [
      { label: 'a', text: 'Write down the radius of the artifact.', marks: 1 },
      { label: 'b', text: 'Murchison Falls drops water through a height of 43 m. If 200 kg of water passes over the falls each second, derive the expression for the power available and calculate the maximum power output assuming g = 10 m/s².', marks: 4 },
      { label: 'c', text: 'Calculate the maximum theoretical power output. Take g = 10 m s⁻².', marks: 3 },
      { label: 'd', text: 'Suggest two reasons why the actual power output of a hydroelectric turbine at this location would be less than your answer in (c).', marks: 2 },
    ],
  },
  mathematics: {
    topic: 'Calculus Applications',
    difficulty: 3,
    totalMarks: 10,
    stem: 'A water tank in Mbarara is filled at a rate r(t) = 6t² + 2 litres per minute, where t is measured in minutes.',
    parts: [
      { label: 'a', text: 'Write down the definite integral that represents the total volume added in the first 5 minutes.', marks: 2 },
      { label: 'b', text: 'Evaluate the integral from part (a), showing all working.', marks: 4 },
      { label: 'c', text: 'Determine the rate of change of r(t) at t = 3 minutes and interpret your answer in context.', marks: 2 },
      { label: 'd', text: 'Sketch the graph of r(t) for 0 ≤ t ≤ 5, labelling all key features.', marks: 2 },
    ],
  },
};

const MARK_SCHEME = {
  physics: [
    { criterion: 'Identifies gravitational potential energy', marks: 1, max: 1 },
    { criterion: 'States P = ΔE/Δt', marks: 1, max: 1 },
    { criterion: 'Substitutes ΔE = mgh correctly', marks: 1, max: 1 },
    { criterion: 'Derives P = ṁgh with units verified', marks: 1, max: 1 },
    { criterion: 'Correct substitution of ṁ = 200, g = 10, h = 43', marks: 1, max: 1 },
    { criterion: 'P = 86 000 W / 86 kW stated', marks: 1, max: 1 },
    { criterion: 'Correct unit stated (W or kW)', marks: 1, max: 1 },
    { criterion: 'Valid reason 1 (e.g. friction / turbine inefficiency)', marks: 1, max: 1 },
    { criterion: 'Valid reason 2 (e.g. heat loss / water splashing)', marks: 1, max: 1 },
    { criterion: 'Both reasons are distinct and scientifically valid', marks: 1, max: 1 },
  ],
  mathematics: [
    { criterion: 'Correct integral limits (0 to 5)', marks: 1, max: 1 },
    { criterion: 'Correct integrand ∫(6t² + 2) dt written', marks: 1, max: 1 },
    { criterion: 'Antiderivative: 2t³ + 2t', marks: 2, max: 2 },
    { criterion: 'Correct substitution of limits', marks: 1, max: 1 },
    { criterion: 'Final answer 260 litres', marks: 1, max: 1 },
    { criterion: 'Correct derivative r′(t) = 12t', marks: 1, max: 1 },
    { criterion: 'r′(3) = 36 with units and contextual interpretation', marks: 1, max: 1 },
    { criterion: 'Correct shape (increasing, concave up)', marks: 1, max: 1 },
    { criterion: 'Labelled axes with r(0) = 2 and r(5) = 152 shown', marks: 1, max: 1 },
  ],
};

const SUBJECT_COLORS = {
  physics:     { bar: 'bg-blue-500',  badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  mathematics: { bar: 'bg-rose-500',  badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-rose-600', 'bg-violet-600', 'bg-amber-500',
  'bg-emerald-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-pink-600',
  'bg-teal-600', 'bg-orange-600', 'bg-fuchsia-600', 'bg-lime-600',
];

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ level = 1 }) {
  const label = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
  const dotColor = level === 1 ? 'bg-emerald-400' : level === 2 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = level === 1 ? 'text-emerald-400' : level === 2 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="flex items-center gap-[3px]">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= level ? dotColor : 'bg-white/10'}`} />
        ))}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
        level === 1
          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
          : level === 2
          ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
          : 'text-red-400 bg-red-400/10 border-red-400/20'
      }`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Practice() {
  const { t } = useLocalization();
  const draft = useMemo(() => loadDraft(), []);

  const [step, setStep]                           = useState(draft?.step || 'selectLevel');
  const [selectedExamLevel, setSelectedExamLevel] = useState(draft?.selectedExamLevel || null);
  const [selectedSubject, setSelectedSubject]     = useState(draft?.selectedSubject || null);
  const [selectedTopic, setSelectedTopic]         = useState(draft?.selectedTopic || null);
  const [targetGrade, setTargetGrade]             = useState(draft?.targetGrade || 4);

  const [solutionText, setSolutionText]           = useState(draft?.solutionText || '');
  const [selectedFileName, setSelectedFileName]   = useState(draft?.selectedFileName || '');
  const [aiState, setAiState]                     = useState(draft?.feedback ? 'feedback' : 'idle');
  const [feedback, setFeedback]                   = useState(draft?.feedback || null);
  const [awardedMarks, setAwardedMarks]           = useState(draft?.awardedMarks || null);
  const [showHint, setShowHint]                   = useState({});
  const [showMarkScheme, setShowMarkScheme]       = useState(false);
  const [error, setError]                         = useState('');
  const [isChatOpen, setIsChatOpen]               = useState(false);

  const inputFileRef       = useRef(null);
  const workboardStartedAt = useRef(Date.now());

  const scenario   = useMemo(() => selectedSubject ? SCENARIOS[selectedSubject] : null,  [selectedSubject]);
  const markScheme = useMemo(() => selectedSubject ? MARK_SCHEME[selectedSubject] : [],  [selectedSubject]);
  const totalScore   = awardedMarks ? awardedMarks.reduce((s, m) => s + m.marks, 0) : 0;
  const maxScore     = markScheme.reduce((s, m) => s + m.max, 0);
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const allTopics = useMemo(() => {
    if (!selectedExamLevel) return [];
    const levelKey = selectedExamLevel === 'uace'
      ? 'ALEVEL'
      : selectedExamLevel.toUpperCase().replace('-', '');
    const topics = [];
    let colorIdx = 0;

    const addSubtopics = (subtopics, subject, icon) => {
      subtopics.forEach((sub, i) => {
        topics.push({
          id: `${subject}-${i}`,
          subject,
          name: sub.name,
          code: `${subject === 'physics' ? 'PHY' : 'MTH'} ${Math.floor(i / 2) + 1}.${(i % 2) + 1}`,
          questions: sub.questions,
          progress: [0, 0, 53, 64, 0, 0, 0, 0, 0][i] ?? 0,
          color: AVATAR_COLORS[colorIdx++ % AVATAR_COLORS.length],
          icon,
        });
      });
    };

    if (physicsTopics[levelKey])     addSubtopics(physicsTopics[levelKey],     'physics',     'solar:flash-bold');
    if (mathematicsTopics[levelKey]) addSubtopics(mathematicsTopics[levelKey], 'mathematics', 'solar:calculator-bold');
    return topics;
  }, [selectedExamLevel]);

  useEffect(() => {
    saveDraft({ step, selectedExamLevel, selectedSubject, selectedTopic, solutionText, selectedFileName, feedback, awardedMarks, targetGrade });
  }, [step, selectedExamLevel, selectedSubject, selectedTopic, solutionText, selectedFileName, feedback, awardedMarks, targetGrade]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleExamLevelSelect = (id) => { setSelectedExamLevel(id); setStep('topics'); };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSelectedSubject(topic.subject);
    trackTopicView(topic.name, topic.id);
    setSolutionText('');
    setSelectedFileName('');
    setFeedback(null);
    setAwardedMarks(null);
    setShowHint({});
    setShowMarkScheme(false);
    setError('');
    workboardStartedAt.current = Date.now();
    setStep('workboard');
  };

  const handleEndPractice = () => {
    setStep('topics');
    setSelectedTopic(null);
    setAiState('idle');
    setFeedback(null);
    setAwardedMarks(null);
    setError('');
    setShowMarkScheme(false);
  };

  const handleSubmit = async () => {
    if (aiState !== 'idle') return;
    if (!solutionText.trim() && !selectedFileName) {
      setError('Write your answer or attach your working before submitting.');
      return;
    }
    setError('');
    setAiState('analyzing');
    try {
      const result = await evaluatePracticeSolution({
        subject:        selectedTopic?.name || 'Practice',
        level:          selectedExamLevel?.toUpperCase().replace('-', ' ') || 'A-Level',
        topic:          scenario?.topic || '',
        question:       scenario?.parts.map(p => `(${p.label}) ${p.text} [${p.marks} marks]`).join('\n') || '',
        studentAnswer:  solutionText,
        attachmentName: selectedFileName || null,
      });
      setFeedback(result);
      const awarded = markScheme.map((m, i) => ({
        ...m,
        marks: i < Math.round((result.score / 100) * markScheme.length) ? m.max : 0,
      }));
      setAwardedMarks(awarded);
      setAiState('feedback');
      const dur = Math.max(1, Math.round((Date.now() - workboardStartedAt.current) / 60000));
      trackPracticeAttempt(selectedTopic?.name || 'Practice', result.score, dur);
    } catch (err) {
      setError(err.message || 'Grading failed. Please try again.');
      setAiState('idle');
    }
  };

  const handleFileChange = (e) => {
    const name = e.target.files?.[0]?.name || '';
    setSelectedFileName(name);
    e.target.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN 1 — Level selection
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'selectLevel') {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0D0F14] px-4 sm:px-8 py-8 sm:py-14">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest mb-3">
              Practice
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-2 leading-tight">
              {t('practice.chooseATopic')}
            </h1>
            <p className="text-slate-500 text-sm">{t('examLevels.selectLevel')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(examLevels).map((level) => (
              <button
                key={level.id}
                onClick={() => handleExamLevelSelect(level.id)}
                className="group text-left p-5 sm:p-6 rounded-xl border border-white/[0.06] bg-[#12151C] hover:border-amber-500/30 hover:bg-[#14171F] transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-4 sm:mb-5">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                    <Icon icon="solar:book-2-bold" width="18" className="text-white" />
                  </div>
                  <Icon icon="solar:arrow-right-linear" width="14" className="text-white/20 group-hover:text-amber-400 transition-colors mt-1" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1">{level.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{level.description}</p>
                <span className="text-[10px] font-medium uppercase tracking-wide text-white/20">{level.difficulty}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN 2 — Topic list
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'topics') {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0D0F14]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-3 sm:space-y-4">

          <button
            onClick={() => setStep('selectLevel')}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium group"
          >
            <Icon icon="solar:alt-arrow-left-linear" width="13" className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {/* Header card */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {selectedExamLevel?.toUpperCase().replace('-', ' ')} Practice
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Select a topic to begin</p>
              </div>
              <button
                onClick={() => setStep('selectLevel')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-colors shrink-0"
              >
                Change
              </button>
            </div>

            {/* Grade target slider 1–7 */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <span key={n} className={`text-[10px] font-semibold select-none ${targetGrade === n ? 'text-amber-400' : 'text-white/20'}`}>
                    {n}
                  </span>
                ))}
              </div>
              <div className="relative h-8 flex items-center">
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/[0.06]" />
                <div
                  className="absolute left-0 h-1.5 rounded-full bg-amber-500/60 transition-all"
                  style={{ width: `${((targetGrade - 1) / 6) * 100}%` }}
                />
                <div
                  className="absolute w-4 h-4 bg-amber-500 rounded-full shadow-lg shadow-amber-500/30 transition-all pointer-events-none z-20"
                  style={{ left: `calc(${((targetGrade - 1) / 6) * 100}% - 8px)` }}
                />
                <input
                  type="range" min={1} max={7} step={1}
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                  className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-30"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Target grade: {targetGrade}</p>
            </div>
          </div>

          {/* Topic list */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
            {allTopics.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-600">No topics found for this level.</p>
            ) : allTopics.map((topic) => {
              const subjectColors = SUBJECT_COLORS[topic.subject] || {};
              return (
                <div key={topic.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg ${topic.color} flex items-center justify-center shrink-0`}>
                    <Icon icon={topic.icon} width="16" className="text-white" />
                  </div>

                  {/* Name + progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <p className="text-xs font-semibold text-white truncate">{topic.code} – {topic.name}</p>
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0 ${subjectColors.badge}`}>
                        {topic.subject === 'physics' ? 'PHY' : 'MTH'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-px h-3 bg-white/10 z-10" />
                        {topic.progress > 0 && (
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${subjectColors.bar} transition-all duration-500`}
                            style={{ width: `${topic.progress}%` }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 w-7 text-right shrink-0 tabular-nums">
                        {topic.progress > 0 ? `${topic.progress}%` : '–'}
                      </span>
                    </div>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={() => handleTopicSelect(topic)}
                    className="shrink-0 px-3 sm:px-4 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/60 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 transition-all active:scale-95"
                  >
                    Start
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[10px] text-slate-700 pb-4">
            {allTopics.length} topics · {selectedExamLevel?.toUpperCase().replace('-', ' ')}
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN 3 — Workboard
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-[#0D0F14] overflow-hidden">

      <input
        ref={inputFileRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Top bar ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-white/[0.06] shrink-0 bg-[#0D0F14]">
        <span className="text-xs text-slate-500 shrink-0">
          Max:&nbsp;<span className="text-white font-semibold">{scenario?.totalMarks}</span>&nbsp;marks
        </span>

        <div className="flex-1" />

        <DifficultyBadge level={scenario?.difficulty || 1} />

        {/* Desktop icon row */}
        <div className="hidden sm:flex items-center gap-1 ml-1">
          <div className="w-px h-4 bg-white/[0.08] mr-1" />
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] rounded-lg transition-all" title="Notes">
            <Icon icon="solar:pen-2-linear" width="15" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] rounded-lg transition-all" title="Save">
            <Icon icon="solar:bookmark-linear" width="15" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] rounded-lg transition-all" title="Flag">
            <Icon icon="solar:flag-linear" width="15" />
          </button>
        </div>

        {/* Ask Maestro — desktop only */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all text-xs font-semibold shrink-0"
        >
          <HugeiconsIcon icon={AiBrain05Icon} size={12} strokeWidth={2} />
          Ask Maestro
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">

            {/* Breadcrumb nav */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <button
                onClick={handleEndPractice}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-400 transition-colors text-xs font-medium group shrink-0"
              >
                <Icon icon="solar:alt-arrow-left-linear" width="11" className="group-hover:-translate-x-0.5 transition-transform" />
                Topics
              </button>
              <span className="text-white/10 text-xs">›</span>
              <span className="text-xs text-slate-600 truncate">
                {selectedTopic?.code} · {scenario?.topic}
              </span>
            </div>

            <div className="border-t border-white/[0.06] mb-6" />

            {aiState !== 'feedback' ? (
              /* ── QUESTION ─────────────────────────────────────────────────── */
              <div className="space-y-5">
                {scenario?.stem && (
                  <p className="text-sm text-slate-300 leading-relaxed">{scenario.stem}</p>
                )}

                <div className="space-y-5">
                  {scenario?.parts.map((part) => (
                    <div key={part.label} className="space-y-2">
                      <div className="flex items-start gap-2">
                        {/* Part label */}
                        <span className="text-sm text-amber-400/60 font-semibold shrink-0 w-5 pt-px">({part.label})</span>

                        {/* Question text */}
                        <p className="text-sm text-slate-300 leading-relaxed flex-1 min-w-0">{part.text}</p>

                        {/* Marks + hint */}
                        <div className="shrink-0 flex flex-col items-end gap-1 ml-1 pt-px">
                          <span className="text-[10px] text-slate-600 whitespace-nowrap tabular-nums">[{part.marks}]</span>
                          <button
                            onClick={() => setShowHint(prev => ({ ...prev, [part.label]: !prev[part.label] }))}
                            className="flex items-center gap-0.5 text-[10px] font-semibold text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap"
                          >
                            <Icon icon="solar:magic-stick-3-linear" width="10" />
                            Hint
                          </button>
                        </div>
                      </div>

                      {showHint[part.label] && (
                        <div className="ml-7 px-3 py-2.5 rounded-lg bg-violet-500/[0.08] border border-violet-500/15 text-xs text-violet-300 leading-relaxed">
                          Think about the fundamental formula linking this quantity to the given values. Show each substitution step explicitly.
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Working space */}
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Your Working</p>
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Write your working and answer here…"
                    className="w-full min-h-44 sm:min-h-56 text-sm text-slate-300 placeholder:text-white/10 bg-[#12151C] border border-white/[0.06] rounded-xl p-4 resize-none focus:outline-none focus:border-amber-500/30 leading-relaxed transition-colors"
                  />

                  {/* Attached file pill */}
                  {selectedFileName && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.08] border border-amber-500/15">
                      <Icon icon="solar:file-bold" width="13" className="text-amber-400 shrink-0" />
                      <span className="text-xs text-amber-400 truncate min-w-0 flex-1">{selectedFileName}</span>
                      <button
                        onClick={() => setSelectedFileName('')}
                        className="shrink-0 text-amber-400/50 hover:text-amber-400 transition-colors"
                      >
                        <Icon icon="solar:close-circle-bold" width="13" />
                      </button>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <Icon icon="solar:danger-circle-bold" width="13" />
                      {error}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* ── FEEDBACK ─────────────────────────────────────────────────── */
              <div className="space-y-4">

                {/* Score banner */}
                <div className={`rounded-xl p-4 sm:p-5 border ${
                  scorePercent >= 70 ? 'bg-emerald-500/[0.08] border-emerald-500/20' :
                  scorePercent >= 40 ? 'bg-amber-500/[0.08] border-amber-500/20' :
                                       'bg-red-500/[0.08] border-red-500/20'
                }`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold shrink-0 border text-sm sm:text-base tabular-nums ${
                      scorePercent >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      scorePercent >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                           'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {scorePercent}%
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-xs sm:text-sm ${
                        scorePercent >= 70 ? 'text-emerald-400' :
                        scorePercent >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {scorePercent >= 70 ? 'Great work' : scorePercent >= 40 ? 'Good effort' : 'Keep practising'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{feedback?.summary}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                        {totalScore}<span className="text-slate-600 text-sm sm:text-base"> / {maxScore}</span>
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-600">marks</p>
                    </div>
                  </div>
                </div>

                {/* Mark scheme toggle */}
                <button
                  onClick={() => setShowMarkScheme(!showMarkScheme)}
                  className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Icon icon={showMarkScheme ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width="13" />
                  {showMarkScheme ? 'Hide' : 'Show'} mark scheme
                </button>

                {showMarkScheme && (
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden text-xs">
                    <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex justify-between items-center">
                      <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Mark Scheme</span>
                      <span className="text-slate-600 tabular-nums">{totalScore} / {maxScore}</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {(awardedMarks || markScheme).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                            item.marks > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-500/50'
                          }`}>
                            <Icon icon={item.marks > 0 ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width="12" />
                          </div>
                          <p className="flex-1 text-slate-500 leading-snug min-w-0">{item.criterion}</p>
                          <span className={`font-semibold shrink-0 ml-2 tabular-nums ${item.marks > 0 ? 'text-emerald-400' : 'text-white/10'}`}>
                            {item.marks}/{item.max}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {feedback?.strengths?.length > 0 && (
                  <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-4">
                    <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wide mb-3">What you did well</p>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <Icon icon="solar:check-circle-linear" width="13" className="text-emerald-500 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {feedback?.improvements?.length > 0 && (
                  <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/10 p-4">
                    <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-wide mb-3">Improve next time</p>
                    <ul className="space-y-2">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <Icon icon="solar:arrow-up-circle-linear" width="13" className="text-amber-500 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model answer */}
                {feedback?.modelAnswer && (
                  <div className="rounded-xl bg-[#12151C] border border-white/[0.06] p-4">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-2">Model answer outline</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{feedback.modelAnswer}</p>
                  </div>
                )}

                <div className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar — desktop only ──────────────────────────────────── */}
        {aiState !== 'feedback' && (
          <div className="hidden sm:flex flex-col items-center gap-3 px-2 py-5 border-l border-white/[0.06] bg-[#0D0F14] shrink-0 w-12">
            <button
              className="w-8 h-8 rounded-lg border border-white/[0.06] bg-[#12151C] flex items-center justify-center text-slate-600 hover:text-slate-300 hover:border-white/20 transition-all"
              title="Scan / take photo"
            >
              <Icon icon="solar:camera-linear" width="16" />
            </button>

            <button
              onClick={() => inputFileRef.current?.click()}
              className="w-8 h-8 rounded-lg border border-white/[0.06] bg-[#12151C] flex items-center justify-center text-slate-600 hover:text-slate-300 hover:border-white/20 transition-all"
              title="Upload working"
            >
              <Icon icon="solar:file-upload-linear" width="16" />
            </button>

            {selectedFileName && (
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="solar:file-bold" width="12" className="text-amber-400" />
                <span className="text-[7px] text-amber-400 text-center leading-tight break-all px-0.5">
                  {selectedFileName.length > 7 ? selectedFileName.slice(0, 6) + '…' : selectedFileName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-white/[0.06] bg-[#0D0F14]">

        <button
          onClick={handleEndPractice}
          className="text-xs font-semibold text-red-500/60 hover:text-red-400 transition-colors shrink-0"
        >
          End practice
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile-only: upload */}
          {aiState !== 'feedback' && (
            <button
              onClick={() => inputFileRef.current?.click()}
              className="sm:hidden w-9 h-9 rounded-lg border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 active:scale-95 transition-all shrink-0"
              title="Upload working"
            >
              <Icon icon="solar:file-upload-linear" width="16" />
            </button>
          )}

          {/* Mobile-only: Maestro */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="sm:hidden w-9 h-9 rounded-lg border border-violet-500/20 bg-violet-500/10 flex items-center justify-center text-violet-400 active:scale-95 transition-all shrink-0"
            title="Ask Maestro"
          >
            <HugeiconsIcon icon={AiBrain05Icon} size={16} strokeWidth={2} />
          </button>

          {aiState === 'feedback' ? (
            <>
              <button
                onClick={() => {
                  setAiState('idle');
                  setFeedback(null);
                  setAwardedMarks(null);
                  setSolutionText('');
                  setShowMarkScheme(false);
                }}
                className="px-3 sm:px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-slate-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
              >
                Try again
              </button>
              <button
                onClick={handleEndPractice}
                className="px-4 sm:px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-amber-500/20"
              >
                Next →
              </button>
            </>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={aiState !== 'idle'}
              className="px-4 sm:px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-white/[0.06] disabled:text-white/20 disabled:cursor-not-allowed text-black text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap shadow-lg shadow-amber-500/20"
            >
              {aiState === 'analyzing' ? (
                <>
                  <Icon icon="solar:loader-bold" width="12" className="animate-spin shrink-0" />
                  <span>Marking…</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit for grading</span>
                  <span className="sm:hidden">Submit</span>
                  <span>&nbsp;→</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessage={`Hello! I'm Maestro. I see you're working on ${selectedTopic?.name || 'this topic'}. Ask me anything!`}
      />
    </div>
  );
}
