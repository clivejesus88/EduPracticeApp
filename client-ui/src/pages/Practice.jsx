import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiChat01Icon } from '@hugeicons/core-free-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { examLevels, physicsTopics, mathematicsTopics } from '../data/examStructure';
import { pickScenarioForTopic } from '../data/practiceScenarios';
import ChatInterface from '../components/ChatInterface';
import AudioOverview from '../components/AudioOverview';
import MarkdownText from '../components/MarkdownText';
import FocusAudio from '../components/FocusAudio';
import { trackPracticeAttempt, trackTopicView } from '../utils/analyticsTracker';
import { evaluatePracticeSolution } from '../services/practiceAiService';

const PRACTICE_DRAFT_KEY = 'eduPractice_practiceDraft';

function loadPracticeDraft() {
  try {
    const raw = localStorage.getItem(PRACTICE_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePracticeDraft(draft) {
  localStorage.setItem(PRACTICE_DRAFT_KEY, JSON.stringify(draft));
}

function getScenarioForSubject(subject) {
  if (subject === 'physics') {
    return {
      title: 'Murchison Falls Energy & Power',
      topic: 'Energy & Power',
      maxMark: 10,
      question:
        'Murchison Falls drops water through a height of 43 m. If 200 kg of water passes over the falls each second, derive the expression for the power available and calculate the maximum power output assuming g = 10 m/s².',
    };
  }

  return {
    title: 'Applied Mathematics Modelling',
    topic: 'Calculus Applications',
    maxMark: 10,
    question:
      'A water tank in Mbarara is filled at a rate r(t) = 6t^2 + 2 litres per minute, where t is in minutes. Derive the expression for the total volume added in the first 5 minutes and compute the result.',
  };
}

export default function Practice() {
  const { t } = useLocalization();
  const draft = useMemo(() => loadPracticeDraft(), []);
  const [step, setStep] = useState(draft?.step || 'selectLevel'); // selectLevel | topics | workboard
  const [selectedExamLevel, setSelectedExamLevel] = useState(draft?.selectedExamLevel || null);
  const [selectedSubject, setSelectedSubject] = useState(draft?.selectedSubject || null);
  const [selectedTopic, setSelectedTopic] = useState(draft?.selectedTopic || null);
  const [aiState, setAiState] = useState(draft?.feedback ? 'feedback' : 'idle'); // idle | analyzing | feedback
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [solutionText, setSolutionText] = useState(draft?.solutionText || '');
  const [selectedFileName, setSelectedFileName] = useState(draft?.selectedFileName || '');
  const [feedback, setFeedback] = useState(draft?.feedback || null);
  const [error, setError] = useState('');
  const inputFileRef = useRef(null);
  const workboardStartedAt = useRef(Date.now());

  // Get topics based on selected exam level
  const getTopics = () => {
    if (!selectedExamLevel) return [];

    const levelKey = selectedExamLevel === 'uace' ? 'ALEVEL' : selectedExamLevel.toUpperCase().replace('-', '');
    const topics = [];

    if (physicsTopics[levelKey]) {
      topics.push({
        id: 'physics',
        name: t('subjects.physics'),
        description: t('subjects.physicsDescription'),
        icon: 'solar:flash-bold',
        color: 'from-blue-500 to-cyan-500',
        questions: physicsTopics[levelKey].reduce((sum, t) => sum + t.questions, 0),
        subtopics: physicsTopics[levelKey],
        difficulty: 'Intermediate to Advanced',
      });
    }

    if (mathematicsTopics[levelKey]) {
      topics.push({
        id: 'mathematics',
        name: t('subjects.mathematics'),
        description: t('subjects.mathematicsDescription'),
        icon: 'solar:calculator-bold',
        color: 'from-rose-500 to-pink-500',
        questions: mathematicsTopics[levelKey].reduce((sum, t) => sum + t.questions, 0),
        subtopics: mathematicsTopics[levelKey],
        difficulty: 'Intermediate to Advanced',
      });
    }

    return topics;
  };

  const topics = getTopics();
  const currentScenario = useMemo(() => getScenarioForSubject(selectedSubject), [selectedSubject]);

  useEffect(() => {
    savePracticeDraft({
      step,
      selectedExamLevel,
      selectedSubject,
      selectedTopic,
      solutionText,
      selectedFileName,
      feedback,
    });
  }, [step, selectedExamLevel, selectedSubject, selectedTopic, solutionText, selectedFileName, feedback]);

  const handleExamLevelSelect = (levelId) => {
    setSelectedExamLevel(levelId);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setStep('topics');
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSelectedSubject(topic.id);
    trackTopicView(topic.name, topic.id);
    setSolutionText('');
    setSelectedFileName('');
    setFeedback(null);
    setError('');
    workboardStartedAt.current = Date.now();
    setStep('workboard');
  };

  const handleBackToTopics = () => {
    setStep('topics');
    setSelectedTopic(null);
    setAiState('idle');
    setSolutionText('');
    setSelectedFileName('');
    setFeedback(null);
    setError('');
  };

  const handleBackToExamLevel = () => {
    setStep('selectLevel');
    setSelectedExamLevel(null);
    setSelectedSubject(null);
    setAiState('idle');
    setFeedback(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (aiState !== 'idle') return;
    if (!solutionText.trim()) {
      setError('Write your solution before sending it for evaluation.');
      return;
    }
    setError('');
    setAiState('analyzing');

    try {
      const result = await evaluatePracticeSolution({
        subject: selectedTopic?.name || 'Practice',
        level: selectedExamLevel?.toUpperCase().replace('-', ' ') || 'A-Level',
        topic: currentScenario.topic,
        question: currentScenario.question,
        studentAnswer: solutionText,
        attachmentName: selectedFileName || null,
      });

      setFeedback(result);
      setAiState('feedback');
      const durationMinutes = Math.max(1, Math.round((Date.now() - workboardStartedAt.current) / 60000));
      trackPracticeAttempt(selectedTopic?.name || 'Practice', result.score, durationMinutes);
    } catch (err) {
      setError(err.message || 'AI evaluation failed.');
      setAiState('idle');
    }
  };

  // Reserve room on the right for the chat sidebar on large screens when chat is open
  const workboardPaneClass = isChatOpen ? 'lg:pr-[400px]' : '';

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0B1120]">

      {/* EXAM LEVEL SELECTION SCREEN */}
      {step === 'selectLevel' ? (
        <div className="flex-1 overflow-y-auto w-full px-5 sm:px-8 md:px-10 py-8 sm:py-10 md:py-14">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="mb-8 sm:mb-10 md:mb-14">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3 leading-[1.1]">
                {t('practice.chooseATopic')}
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
                {t('examLevels.selectLevel')}
              </p>
            </div>

            {/* Exam Level Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {Object.values(examLevels).map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleExamLevelSelect(level.id)}
                  className="group relative p-6 sm:p-7 md:p-8 rounded-2xl border border-white/10 bg-[#111827] hover:border-[#f99c00]/40 hover:bg-[#141d2e] transition-all duration-200 text-left active:scale-[0.98] flex flex-col gap-5 min-h-[180px]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white`}>
                    <Icon icon="solar:book-2-bold" width="22" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 group-hover:text-[#f99c00] transition-colors break-words">
                      {level.name}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{level.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {level.difficulty}
                    </span>
                    <Icon icon="solar:arrow-right-linear" width="18" className="text-slate-500 group-hover:text-[#f99c00] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : step === 'topics' ? (
        // TOPICS SELECTION SCREEN
        <div className="flex-1 overflow-y-auto w-full px-5 sm:px-8 md:px-10 py-8 sm:py-10 md:py-14">
          <div className="max-w-5xl mx-auto">

            {/* Back Button */}
            <button
              onClick={handleBackToExamLevel}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#f99c00] transition-colors mb-6 sm:mb-8 text-sm font-medium group"
            >
              <Icon icon="solar:alt-arrow-left-linear" width="18" className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
              <span>{t('practice.backToTopics')}</span>
            </button>

            {/* Header */}
            <div className="mb-8 sm:mb-10 md:mb-12">
              <p className="text-xs text-[#f99c00] font-bold mb-3 uppercase tracking-[0.18em]">
                {selectedExamLevel?.toUpperCase().replace('-', ' ')}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3 leading-[1.1]">
                {t('practice.chooseATopic')}
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
                {t('practice.selectSubject')}
              </p>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10 md:mb-14">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="group relative p-6 sm:p-7 md:p-8 rounded-2xl border border-white/10 bg-[#111827] hover:border-[#f99c00]/40 hover:bg-[#141d2e] transition-all duration-200 text-left active:scale-[0.98] flex flex-col"
                >
                  {/* Icon row */}
                  <div className="flex items-start justify-between mb-5 gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white shrink-0`}>
                      <Icon icon={topic.icon} width="22" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">{topic.questions}</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider">{t('practice.questions')}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 group-hover:text-[#f99c00] transition-colors break-words">
                    {topic.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">
                    {topic.description}
                  </p>

                  {/* Subtopics chips */}
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <div className="mb-5">
                      <div className="flex flex-wrap gap-1.5">
                        {topic.subtopics.slice(0, 3).map((sub, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5">
                            {sub.name}
                          </span>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#f99c00]/10 text-[#f99c00] border border-[#f99c00]/20">
                            +{topic.subtopics.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {t('practice.startNow')}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] group-hover:bg-[#f99c00] group-hover:text-[#0B1120] transition-all shrink-0">
                      <Icon icon="solar:alt-arrow-right-linear" width="16" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Features Section */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4">{t('practice.whyPractice')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-4 hover:border-[#f99c00]/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] shrink-0">
                    <Icon icon="solar:star-bold" width="18" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white mb-1">{t('practice.instantAiFeedback')}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t('practice.getInstantAnalysis')}</p>
                  </div>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-4 hover:border-emerald-500/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon icon="solar:target-bold" width="18" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white mb-1">{t('practice.trackProgress')}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t('practice.monitorGrowth')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // WORKBOARD SCREEN
        <div className={`flex-1 overflow-y-auto w-full px-5 sm:px-8 md:px-10 py-8 sm:py-10 pb-32 lg:pb-10 ${workboardPaneClass} transition-[padding] duration-300`}>
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">

            {/* Back Button */}
            <button
              onClick={handleBackToTopics}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#f99c00] transition-colors text-sm font-medium group"
            >
              <Icon icon="solar:alt-arrow-left-linear" width="18" className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
              <span>Back to Topics</span>
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 text-[#f99c00] text-xs font-bold uppercase tracking-[0.18em]">
                  <Icon icon="solar:book-bookmark-linear" width="16" />
                  <span className="truncate">{selectedTopic?.name}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400">Easy</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white break-words mb-2 leading-tight">
                {selectedTopic?.name} Question
              </h1>
              <p className="text-sm text-slate-400">
                {t('practice.maximumMark')}: <span className="font-semibold text-white">{currentScenario.maxMark}</span>
              </p>
            </div>

            {/* Scenario Card */}
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 space-y-5">
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                {currentScenario.question}
              </p>
            </div>

            {/* Answer Section */}
            <div className="space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white">{t('practice.yourSolution')}</h3>

              <textarea
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Write your derivation, working, substitutions, and final answer here."
                className="w-full min-h-48 rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/40"
              />

              {/* Upload Area */}
              <div
                onClick={() => inputFileRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-white/15 hover:border-[#f99c00]/50 bg-[#111827]/50 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group px-5"
              >
                <input
                  ref={inputFileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setSelectedFileName(file?.name || '');
                  }}
                />
                <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-[#f99c00]/10 flex items-center justify-center text-slate-400 group-hover:text-[#f99c00] transition-all mb-3">
                  <Icon icon="solar:upload-minimalistic-linear" width="24" />
                </div>
                <p className="text-base font-semibold text-white mb-1">{t('practice.clickToUpload')}</p>
                <p className="text-sm text-slate-500 max-w-xs">
                  {selectedFileName || `${t('practice.uploadDescription')} Attachment is optional.`}
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit Action */}
              {aiState !== 'feedback' && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={aiState !== 'idle'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] px-6 py-3.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] active:scale-95"
                  >
                    {aiState === 'analyzing' ? (
                      <>
                        <Icon icon="solar:loader-bold" width="20" className="animate-spin" />
                        <span>{t('practice.analyzing')}</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:magic-stick-3-linear" width="20" />
                        <span>{t('practice.submitForEvaluation')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Feedback */}
              {aiState === 'feedback' && feedback && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 md:p-8 animate-fade-in-up relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>

                  <div className="flex flex-col sm:flex-row gap-5 sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        <Icon icon="solar:check-circle-bold" width="22" />
                        {t('practice.solutionEvaluated')}
                      </h3>
                      <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-3">
                        <p>{feedback.summary}</p>
                        {feedback.strengths.length > 0 && (
                          <div>
                            <p className="font-semibold text-white mb-1">What you did well</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {feedback.strengths.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {feedback.improvements.length > 0 && (
                          <div>
                            <p className="font-semibold text-white mb-1">Improve next time</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {feedback.improvements.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {feedback.modelAnswer && (
                          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <p className="font-semibold text-white mb-1">Model answer outline</p>
                            <p>{feedback.modelAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 self-center sm:self-auto">
                      <span className="text-4xl font-bold text-emerald-400 font-mono">{feedback.score}%</span>
                      <span className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-widest mt-1">{t('practice.score')}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => { setAiState('idle'); setFeedback(null); }} className="px-6 py-3 rounded-full border border-white/15 hover:border-white/25 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all w-full sm:w-auto active:scale-95">
                      {t('practice.tryAgain')}
                    </button>
                    <button onClick={() => setIsChatOpen(true)} className="px-6 py-3 rounded-full bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] text-sm font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95">
                      <HugeiconsIcon icon={AiBrain05Icon} size={20} strokeWidth={2} />
                      <span>{t('practice.askMaestro')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Floating Chat Toggle Button */}
      {step === 'workboard' && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed lg:absolute right-4 bottom-24 lg:bottom-8 z-30 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#f99c00] to-amber-600 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Open AI Tutor"
          title="Ask Maestro AI for help"
        >
          <HugeiconsIcon icon={AiBrain05Icon} size={28} strokeWidth={2} className="group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0B1120] rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          </span>
        </button>
      )}

      {/* ChatInterface */}
      {step === 'workboard' && (
        <ChatInterface
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          initialMessage={`Hello! I'm Maestro, your AI study assistant. I see you're working on ${selectedTopic?.name || 'this topic'}. Feel free to ask me anything — I can explain concepts, give hints, or check your work!`}
        />
      )}

    </div>
  );
}
