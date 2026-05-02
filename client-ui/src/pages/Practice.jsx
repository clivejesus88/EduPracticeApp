import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiChat01Icon } from '@hugeicons/core-free-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { examLevels, physicsTopics, mathematicsTopics } from '../data/examStructure';
import ChatInterface from '../components/ChatInterface';
import AudioOverview from '../components/AudioOverview';
import MarkdownText from '../components/MarkdownText';
import FocusAudio from '../components/FocusAudio';
import { trackPracticeAttempt, trackTopicView } from '../utils/analyticsTracker';
import { evaluatePracticeSolution } from '../services/practiceAiService';

const DRAFT_KEY = 'eduPractice_practiceDraft';
const loadDraft = () => {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
};
const saveDraft = (d) => localStorage.setItem(DRAFT_KEY, JSON.stringify(d));

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
  physics:     { bar: 'bg-blue-500',  badge: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
  mathematics: { bar: 'bg-rose-500',  badge: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
};

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-rose-600', 'bg-violet-600', 'bg-amber-500',
  'bg-emerald-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-pink-600',
  'bg-teal-600', 'bg-orange-600', 'bg-fuchsia-600', 'bg-lime-600',
];

function DifficultyBadge({ level = 1 }) {
  const label = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
  const dotColor = level === 1 ? 'bg-emerald-400' : level === 2 ? 'bg-amber-400' : 'bg-red-400';
  const badgeCls = level === 1
    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
    : level === 2
    ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
    : 'text-red-300 bg-red-500/15 border-red-500/30';
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center gap-[3px]">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${i <= level ? dotColor : 'bg-white/10'}`} />
        ))}
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}>{label}</span>
    </div>
  );
}

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
  const [audioOverviewTopic, setAudioOverviewTopic] = useState(null);

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
      <div className="flex-1 overflow-y-auto bg-[#0D0F14] px-4 sm:px-8 pt-10 sm:pt-16 pb-[88px] sm:pb-16">
        <div className="max-w-4xl mx-auto">

          {/* Hero header */}
          <div className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Practice</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-3 leading-tight">
              {t('practice.chooseATopic')}
            </h1>
            <p className="text-base text-slate-400">{t('examLevels.selectLevel')}</p>
          </div>

          {/* Level cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(examLevels).map((level) => (
              <button
                key={level.id}
                onClick={() => handleExamLevelSelect(level.id)}
                className="group text-left p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#12151C] hover:border-amber-500/50 hover:bg-[#15181F] transition-all duration-200 active:scale-[0.98] relative overflow-hidden"
              >
                {/* Subtle gradient glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-amber-500/[0.04] to-transparent rounded-2xl" />

                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
                    <Icon icon="solar:book-2-bold" width="22" className="text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-lg border border-white/10 group-hover:border-amber-500/40 flex items-center justify-center transition-colors">
                    <Icon icon="solar:arrow-right-linear" width="15" className="text-white/30 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-1.5">{level.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{level.description}</p>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 group-hover:text-amber-400/60 transition-colors uppercase tracking-wide">
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {level.difficulty}
                </span>
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-[88px] sm:pb-8 space-y-4">

          {/* Back */}
          <button
            onClick={() => setStep('selectLevel')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group"
          >
            <Icon icon="solar:alt-arrow-left-linear" width="16" className="group-hover:-translate-x-0.5 transition-transform" />
            Back to levels
          </button>

          {/* Header card */}
          <div className="bg-[#12151C] rounded-2xl border border-white/10 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Exam level</p>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selectedExamLevel?.toUpperCase().replace('-', ' ')} Practice
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">Select a topic below to start your session</p>
              </div>
              <button
                onClick={() => setStep('selectLevel')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shrink-0"
              >
                Change
              </button>
            </div>

            {/* Grade target slider */}
            <div>
              <div className="flex items-center justify-between mb-2 px-0.5">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <span key={n} className={`text-xs font-semibold select-none ${targetGrade === n ? 'text-amber-400' : 'text-white/20'}`}>
                    {n}
                  </span>
                ))}
              </div>
              <div className="relative h-9 flex items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-white/[0.07]" />
                <div
                  className="absolute left-0 h-2 rounded-full bg-amber-500/70 transition-all"
                  style={{ width: `${((targetGrade - 1) / 6) * 100}%` }}
                />
                <div
                  className="absolute w-5 h-5 bg-amber-500 rounded-full shadow-lg shadow-amber-500/40 transition-all pointer-events-none z-20 border-2 border-amber-300/40"
                  style={{ left: `calc(${((targetGrade - 1) / 6) * 100}% - 10px)` }}
                />
                <input
                  type="range" min={1} max={7} step={1}
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                  className="absolute inset-x-0 w-full h-9 opacity-0 cursor-pointer z-30"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-1.5">Target grade: <span className="text-amber-400 font-semibold">{targetGrade}</span></p>
            </div>
          </div>

          {/* Topic list */}
          <div className="bg-[#12151C] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/[0.06]">
            {allTopics.length === 0 ? (
              <p className="py-14 text-center text-sm text-slate-500">No topics found for this level.</p>
            ) : allTopics.map((topic) => {
              const subjectColors = SUBJECT_COLORS[topic.subject] || {};
              return (
                <div key={topic.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-white/[0.03] transition-colors">

                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${topic.color} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon icon={topic.icon} width="18" className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">{topic.code} – {topic.name}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${subjectColors.badge}`}>
                        {topic.subject === 'physics' ? 'PHY' : 'MTH'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        {topic.progress > 0 && (
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${subjectColors.bar} transition-all duration-500`}
                            style={{ width: `${topic.progress}%` }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right shrink-0 tabular-nums">
                        {topic.progress > 0 ? `${topic.progress}%` : '–'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setAudioOverviewTopic({ name: topic.name, subject: topic.subject, level: selectedExamLevel })}
                    className="shrink-0 w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-500 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 transition-all active:scale-95"
                    title="Audio Overview"
                  >
                    <Icon icon="solar:headphones-bold" width="16" />
                  </button>

                  <button
                    onClick={() => handleTopicSelect(topic)}
                    className="shrink-0 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/70 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300 transition-all active:scale-95"
                  >
                    Start
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-600 pb-4">
            {allTopics.length} topics · {selectedExamLevel?.toUpperCase().replace('-', ' ')}
          </p>
        </div>

        {audioOverviewTopic && (
          <AudioOverview
            topic={audioOverviewTopic.name}
            subject={audioOverviewTopic.subject}
            level={audioOverviewTopic.level?.toUpperCase().replace('-', ' ') || 'A-Level'}
            onClose={() => setAudioOverviewTopic(null)}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN 3 — Workboard
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-[#0D0F14] overflow-hidden pb-[60px] md:pb-0">

      <input
        ref={inputFileRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/10 shrink-0 bg-[#0D0F14]">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-sm text-slate-400">Max:</span>
          <span className="text-sm font-bold text-white tabular-nums">{scenario?.totalMarks}</span>
          <span className="text-sm text-slate-400">marks</span>
        </div>

        <div className="flex-1" />

        <DifficultyBadge level={scenario?.difficulty || 1} />

        <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/10 ml-1">
          <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.07] rounded-xl transition-all" title="Notes">
            <Icon icon="solar:pen-2-linear" width="17" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.07] rounded-xl transition-all" title="Save">
            <Icon icon="solar:bookmark-linear" width="17" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.07] rounded-xl transition-all" title="Flag">
            <Icon icon="solar:flag-linear" width="17" />
          </button>
        </div>

        <FocusAudio />

        <button
          onClick={() => setAudioOverviewTopic({ name: selectedTopic?.name || scenario?.topic || 'Topic', subject: selectedSubject, level: selectedExamLevel })}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] text-violet-400 hover:bg-violet-500/15 hover:border-violet-500/40 transition-all text-sm font-semibold shrink-0"
          title="Audio Overview"
        >
          <Icon icon="solar:headphones-bold" width="16" />
          Listen
        </button>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all text-sm font-semibold shrink-0"
        >
          <HugeiconsIcon icon={AiChat01Icon} size={16} strokeWidth={1.5} />
          Ask Maestro
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-4">
              <button
                onClick={handleEndPractice}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors group shrink-0"
              >
                <Icon icon="solar:alt-arrow-left-linear" width="12" className="group-hover:-translate-x-0.5 transition-transform" />
                Topics
              </button>
              <span className="text-white/15 text-xs">›</span>
              <span className="text-xs text-slate-600 truncate">{selectedTopic?.code}</span>
              <span className="text-white/15 text-xs">›</span>
              <span className="text-xs text-slate-500 truncate font-medium">{scenario?.topic}</span>
            </div>

            {aiState !== 'feedback' ? (
              /* ── QUESTION ── */
              <div className="space-y-3">

                {/* Context / stem */}
                {scenario?.stem && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-white/[0.06]">
                      <Icon icon="solar:document-text-linear" width="12" className="text-slate-600 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Context</span>
                    </div>
                    <p className="px-3.5 py-3 text-sm text-slate-300 leading-relaxed">{scenario.stem}</p>
                  </div>
                )}

                {/* Question parts — each as a self-contained card */}
                <div className="space-y-2">
                  {scenario?.parts.map((part, idx) => {
                    const hintOpen = showHint[part.label];
                    return (
                      <div
                        key={part.label}
                        className="rounded-xl border border-white/[0.07] bg-[#11141C] overflow-hidden"
                      >
                        {/* Part body */}
                        <div className="flex items-start gap-2.5 px-3.5 pt-3 pb-2.5">
                          {/* Part label badge */}
                          <span className="shrink-0 w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center mt-0.5 uppercase">
                            {part.label}
                          </span>

                          {/* Question text */}
                          <p className="text-[13px] text-slate-200 leading-relaxed flex-1 min-w-0">
                            {part.text}
                          </p>

                          {/* Mark pill */}
                          <span className="shrink-0 self-start mt-0.5 text-[10px] font-bold tabular-nums text-slate-500 bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            {part.marks}m
                          </span>
                        </div>

                        {/* Hint strip */}
                        <div className="border-t border-white/[0.05]">
                          <button
                            onClick={() => setShowHint(prev => ({ ...prev, [part.label]: !prev[part.label] }))}
                            className="w-full flex items-center gap-1.5 px-3.5 py-1.5 text-left hover:bg-white/[0.03] transition-colors"
                          >
                            <Icon
                              icon={hintOpen ? 'solar:alt-arrow-up-linear' : 'solar:magic-stick-2-linear'}
                              width="11"
                              className="text-violet-500/70 shrink-0"
                            />
                            <span className="text-[10px] font-semibold text-violet-500/70">
                              {hintOpen ? 'Hide hint' : 'Show hint'}
                            </span>
                          </button>

                          {hintOpen && (
                            <div className="mx-3 mb-2.5 px-3 py-2 rounded-lg bg-violet-500/[0.07] border border-violet-500/15 text-[12px] text-violet-300/80 leading-relaxed">
                              Think about the fundamental formula linking this quantity to the given values. Show each substitution step explicitly.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Working space */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="solar:pen-2-linear" width="13" className="text-slate-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Your Working</span>
                    </div>
                    {solutionText.length > 0 && (
                      <span className="text-[10px] text-slate-600 tabular-nums">{solutionText.length} chars</span>
                    )}
                  </div>
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Write your working and answer here…"
                    className="w-full min-h-[140px] sm:min-h-[200px] text-sm text-slate-200 placeholder:text-white/15 bg-[#0d1018] border border-white/[0.08] rounded-xl p-3.5 resize-none focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/10 leading-relaxed transition-all font-mono"
                  />

                  {selectedFileName && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/15">
                      <Icon icon="solar:file-bold" width="13" className="text-amber-400 shrink-0" />
                      <span className="text-xs text-amber-300 truncate min-w-0 flex-1 font-medium">{selectedFileName}</span>
                      <button onClick={() => setSelectedFileName('')} className="shrink-0 text-amber-400/50 hover:text-amber-400 transition-colors">
                        <Icon icon="solar:close-circle-bold" width="13" />
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/[0.07] border border-red-500/15">
                      <Icon icon="solar:danger-circle-bold" width="14" className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-300">{error}</p>
                    </div>
                  )}
                </div>
              </div>

            ) : (
              /* ── FEEDBACK ── */
              <div className="space-y-5">

                {/* Score banner */}
                <div className={`rounded-2xl p-5 sm:p-6 border ${
                  scorePercent >= 70 ? 'bg-emerald-500/[0.08] border-emerald-500/25' :
                  scorePercent >= 40 ? 'bg-amber-500/[0.08] border-amber-500/25' :
                                       'bg-red-500/[0.08] border-red-500/25'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold shrink-0 border-2 text-lg tabular-nums ${
                      scorePercent >= 70 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      scorePercent >= 40 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                                           'bg-red-500/15 text-red-300 border-red-500/30'
                    }`}>
                      {scorePercent}%
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-base ${
                        scorePercent >= 70 ? 'text-emerald-300' :
                        scorePercent >= 40 ? 'text-amber-300' : 'text-red-300'
                      }`}>
                        {scorePercent >= 70 ? 'Great work!' : scorePercent >= 40 ? 'Good effort' : 'Keep practising'}
                      </p>
                      <p className="text-sm text-slate-400 mt-1 leading-snug">{feedback?.summary}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                        {totalScore}<span className="text-slate-500 text-lg"> / {maxScore}</span>
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5">marks</p>
                    </div>
                  </div>
                </div>

                {/* Mark scheme toggle */}
                <button
                  onClick={() => setShowMarkScheme(!showMarkScheme)}
                  className="flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Icon icon={showMarkScheme ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width="15" />
                  {showMarkScheme ? 'Hide' : 'Show'} mark scheme
                </button>

                {showMarkScheme && (
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <div className="px-5 py-3 bg-white/[0.04] border-b border-white/[0.08] flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Mark Scheme</span>
                      <span className="text-sm text-slate-500 tabular-nums">{totalScore} / {maxScore}</span>
                    </div>
                    <div className="divide-y divide-white/[0.06]">
                      {(awardedMarks || markScheme).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            item.marks > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400/50'
                          }`}>
                            <Icon icon={item.marks > 0 ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width="14" />
                          </div>
                          <p className="flex-1 text-sm text-slate-400 leading-snug min-w-0">{item.criterion}</p>
                          <span className={`text-sm font-bold shrink-0 ml-2 tabular-nums ${item.marks > 0 ? 'text-emerald-400' : 'text-white/15'}`}>
                            {item.marks}/{item.max}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {feedback?.strengths?.length > 0 && (
                  <div className="rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="solar:star-bold" width="15" className="text-emerald-400" />
                      <p className="text-sm font-bold text-emerald-300 uppercase tracking-wide">What you did well</p>
                    </div>
                    <ul className="space-y-2.5">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Icon icon="solar:check-circle-linear" width="15" className="text-emerald-400 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {feedback?.improvements?.length > 0 && (
                  <div className="rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="solar:chart-2-bold" width="15" className="text-amber-400" />
                      <p className="text-sm font-bold text-amber-300 uppercase tracking-wide">Improve next time</p>
                    </div>
                    <ul className="space-y-2.5">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Icon icon="solar:arrow-up-circle-linear" width="15" className="text-amber-400 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model answer */}
                {feedback?.modelAnswer && (
                  <div className="rounded-2xl bg-[#12151C] border border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="solar:document-text-linear" width="15" className="text-slate-400" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Model answer outline</p>
                    </div>
                    <MarkdownText content={feedback.modelAnswer} className="text-sm text-slate-300" />
                  </div>
                )}

                <div className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar (desktop) ── */}
        {aiState !== 'feedback' && (
          <div className="hidden sm:flex flex-col items-center gap-3 px-2 py-6 border-l border-white/10 bg-[#0D0F14] shrink-0 w-14">
            <button
              className="w-10 h-10 rounded-xl border border-white/10 bg-[#12151C] flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all"
              title="Scan / take photo"
            >
              <Icon icon="solar:camera-minimalistic-linear" width="18" />
            </button>
            <button
              onClick={() => inputFileRef.current?.click()}
              className="w-10 h-10 rounded-xl border border-white/10 bg-[#12151C] flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all"
              title="Upload working"
            >
              <Icon icon="solar:cloud-upload-linear" width="18" />
            </button>
            {selectedFileName && (
              <div className="flex flex-col items-center gap-0.5 px-0.5">
                <Icon icon="solar:file-bold" width="13" className="text-amber-400" />
                <span className="text-[8px] text-amber-400 text-center leading-tight break-all">
                  {selectedFileName.length > 7 ? selectedFileName.slice(0, 6) + '…' : selectedFileName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-white/10 bg-[#0D0F14]">

        <button
          onClick={handleEndPractice}
          className="text-sm font-semibold text-red-400/70 hover:text-red-400 transition-colors shrink-0"
        >
          End practice
        </button>

        <div className="flex items-center gap-2">
          {aiState !== 'feedback' && (
            <button
              onClick={() => inputFileRef.current?.click()}
              className="sm:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-95 transition-all shrink-0"
              title="Upload working"
            >
              <Icon icon="solar:cloud-upload-linear" width="17" />
            </button>
          )}

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="sm:hidden w-10 h-10 rounded-xl border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-violet-300 active:scale-95 transition-all shrink-0"
            title="Ask Maestro"
          >
            <HugeiconsIcon icon={AiChat01Icon} size={18} strokeWidth={1.5} />
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
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
              >
                Try again
              </button>
              <button
                onClick={handleEndPractice}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-amber-500/25"
              >
                Next →
              </button>
            </>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={aiState !== 'idle'}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-white/[0.07] disabled:text-white/20 disabled:cursor-not-allowed text-black text-sm font-bold transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap shadow-lg shadow-amber-500/25"
            >
              {aiState === 'analyzing' ? (
                <>
                  <Icon icon="solar:loader-bold" width="14" className="animate-spin shrink-0" />
                  <span>Marking…</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit for grading</span>
                  <span className="sm:hidden">Submit</span>
                  <span>→</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessage={`Hello! I'm Maestro. I see you're working on **${selectedTopic?.name || 'this topic'}**. Ask me anything about the question or the concept!`}
        context={{
          subject: selectedSubject,
          level: selectedExamLevel?.toUpperCase().replace('-', ' '),
          topic: selectedTopic?.name || scenario?.topic,
          stem: scenario?.stem,
          parts: scenario?.parts?.map((p) => `(${p.label}) ${p.text} [${p.marks} marks]`).join('\n'),
        }}
      />

      {audioOverviewTopic && (
        <AudioOverview
          topic={audioOverviewTopic.name}
          subject={audioOverviewTopic.subject}
          level={audioOverviewTopic.level?.toUpperCase().replace('-', ' ') || 'A-Level'}
          onClose={() => setAudioOverviewTopic(null)}
        />
      )}
    </div>
  );
}
