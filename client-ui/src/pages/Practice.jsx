import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import { examLevels, physicsTopics, mathematicsTopics } from '../data/examStructure';
import ChatInterface from '../components/ChatInterface';
import { trackPracticeAttempt, trackTopicView } from '../utils/analyticsTracker';


export default function Practice() {
  const { t } = useLocalization();
  const [step, setStep] = useState('selectLevel'); // selectLevel | topics | workboard
  const [selectedExamLevel, setSelectedExamLevel] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [aiState, setAiState] = useState('idle'); // idle | analyzing | feedback
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get topics based on selected exam level
  const getTopics = () => {
    if (!selectedExamLevel) return [];
    
    const levelKey = selectedExamLevel.toUpperCase().replace('-', '');
    const topics = [];
    
    // Add Physics topics if available
    if (physicsTopics[levelKey]) {
      topics.push({
        id: 'physics',
        name: t('subjects.physics'),
        description: t('subjects.physicsDescription'),
        icon: 'solar:flash-bold',
        color: 'from-blue-500 to-cyan-500',
        questions: physicsTopics[levelKey].reduce((sum, t) => sum + t.questions, 0),
        subtopics: physicsTopics[levelKey],
        difficulty: levelKey === 'OLEVEL' ? 'Beginner to Intermediate' : 'Intermediate to Advanced'
      });
    }
    
    // Add Mathematics topics if available
    if (mathematicsTopics[levelKey]) {
      topics.push({
        id: 'mathematics',
        name: t('subjects.mathematics'),
        description: t('subjects.mathematicsDescription'),
        icon: 'solar:calculator-bold',
        color: 'from-rose-500 to-pink-500',
        questions: mathematicsTopics[levelKey].reduce((sum, t) => sum + t.questions, 0),
        subtopics: mathematicsTopics[levelKey],
        difficulty: levelKey === 'OLEVEL' ? 'Beginner to Intermediate' : 'Intermediate to Advanced'
      });
    }
    
    return topics;
  };

  const topics = getTopics();

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
    setStep('workboard');
  };

  const handleBackToTopics = () => {
    setStep('topics');
    setSelectedTopic(null);
    setAiState('idle');
  };

  const handleBackToExamLevel = () => {
    setStep('selectLevel');
    setSelectedExamLevel(null);
    setSelectedSubject(null);
    setAiState('idle');
  };

  const handleSubmit = () => {
    if (aiState !== 'idle') return;
    
    // Simulate submission and inline feedback
    setAiState('analyzing');

    setTimeout(() => {
      setAiState('feedback');
      // Track practice attempt with simulated score
      const score = Math.floor(Math.random() * (95 - 70 + 1)) + 70; // Random score 70-95
      trackPracticeAttempt(selectedTopic?.name || 'Practice', score, 5);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0B1120]">
      
      {/* EXAM LEVEL SELECTION SCREEN */}
      {step === 'selectLevel' ? (
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 md:p-8 h-full">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 md:mb-3">{t('practice.chooseATopic')}</h1>
              <p className="text-sm md:text-base text-slate-400">{t('examLevels.selectLevel')}</p>
            </div>

            {/* Exam Level Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 md:mb-10">
              {Object.values(examLevels).map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleExamLevelSelect(level.id)}
                  className="group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg sm:rounded-2xl border border-white/5 bg-gradient-to-br from-[#111827] to-[#0D0F1B] hover:border-white/10 hover:shadow-lg hover:shadow-white/5 transition-all duration-300 text-left overflow-hidden active:scale-95 min-h-[180px] flex flex-col justify-between"
                >
                  {/* Background glow on hover */}
                  <div className={`absolute -inset-96 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-3xl pointer-events-none`}></div>
                  
                  <div className="relative z-10 space-y-2 sm:space-y-3 md:space-y-4">
                    <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon icon="solar:book-2-bold" width="20" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-[#f99c00] transition-colors duration-300 break-words">{level.name}</h3>
                    
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{level.description}</p>

                    {/* Difficulty Badge */}
                    <div className="pt-2 sm:pt-3 md:pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{level.difficulty}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : step === 'topics' ? (
        // TOPICS SELECTION SCREEN
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 md:p-8 h-full">
          <div className="max-w-5xl mx-auto">
            
            {/* Back Button */}
            <button
              onClick={handleBackToExamLevel}
              className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-[#f99c00] transition-colors mb-6 md:mb-8 text-xs sm:text-sm font-medium group"
            >
              <Icon icon="solar:alt-arrow-left-linear" width="18" className="group-hover:scale-110 transition-transform shrink-0" />
              <span>{t('practice.backToTopics')}</span>
            </button>
            
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 md:mb-3">{t('practice.chooseATopic')}</h1>
              <p className="text-sm md:text-base text-slate-400">{t('practice.selectSubject')}</p>
              <p className="text-xs text-[#f99c00] font-semibold mt-2 uppercase tracking-widest">{selectedExamLevel?.toUpperCase().replace('-', ' ')}</p>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-8 md:mb-10">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg sm:rounded-2xl border border-white/5 bg-gradient-to-br from-[#111827] to-[#0D0F1B] hover:border-white/10 hover:shadow-lg hover:shadow-white/5 transition-all duration-300 text-left overflow-hidden active:scale-95 flex flex-col"
                >
                  {/* Background glow on hover */}
                  <div className={`absolute -inset-96 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-3xl pointer-events-none`}></div>
                  
                  <div className="relative z-10 flex flex-col flex-1">
                    {/* Icon and Stats Row */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-5">
                      <div className={`w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon icon={topic.icon} width="20" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{topic.questions} {t('practice.questions')}</p>
                        <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">{topic.difficulty}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-[#f99c00] transition-colors duration-300 break-words">{topic.name}</h3>
                    
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3 sm:mb-4 flex-1">{topic.description}</p>

                    {/* Subtopics (if available) */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="mb-3 sm:mb-4 md:mb-5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2">Subtopics</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {topic.subtopics.slice(0, 3).map((sub, i) => (
                            <span key={i} className="text-xs px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-white/5 text-slate-300 group-hover:bg-white/10 transition-all">
                              {sub.name}
                            </span>
                          ))}
                          {topic.subtopics.length > 3 && (
                            <span className="text-xs px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[#f99c00]/10 text-[#f99c00]">
                              +{topic.subtopics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer with CTA */}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 md:pt-5 mt-auto border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('practice.startNow')}</span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] group-hover:bg-[#f99c00] group-hover:text-[#0B1120] transition-all duration-300 shrink-0">
                        <Icon icon="solar:alt-arrow-right-linear" width="16" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-5">{t('practice.whyPractice')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 md:p-5 rounded-lg md:rounded-xl bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 flex items-start gap-3 sm:gap-4 hover:border-[#f99c00]/20 hover:shadow-lg hover:shadow-[#f99c00]/5 transition-all group cursor-pointer">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] shrink-0 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:star-bold" width="18" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">{t('practice.instantAiFeedback')}</h4>
                    <p className="text-xs text-slate-400 leading-snug">{t('practice.getInstantAnalysis')}</p>
                  </div>
                </div>
                <div className="p-3 sm:p-4 md:p-5 rounded-lg md:rounded-xl bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 flex items-start gap-3 sm:gap-4 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group cursor-pointer">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:target-bold" width="18" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">{t('practice.trackProgress')}</h4>
                    <p className="text-xs text-slate-400 leading-snug">{t('practice.monitorGrowth')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // WORKBOARD SCREEN
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 md:p-8 pb-32 sm:pb-24 lg:pb-8 h-full lg:pr-105">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Header with Back Button */}
            <div>
              <button
                onClick={handleBackToTopics}
                className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-[#f99c00] transition-colors mb-4 sm:mb-5 text-xs sm:text-sm font-medium group"
              >
                <Icon icon="solar:alt-arrow-left-linear" width="18" className="group-hover:scale-110 transition-transform shrink-0" />
                <span>Back to Topics</span>
              </button>
  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
  <div className="flex items-center gap-2 text-[#f99c00] text-xs font-bold uppercase tracking-widest">
  <Icon icon="solar:book-bookmark-linear" width="16" />
  <span className="truncate">{selectedTopic?.name}</span>
  </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400">Easy</span>
                </div>
              </div>
  <div>
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white break-words mb-2">{selectedTopic?.name} Question</h1>
  <p className="text-sm text-slate-400">{t('practice.maximumMark')}: <span className="font-semibold text-white">7</span></p>
  </div>
            </div>

            {/* Scenario Details Card */}
            <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 hover:border-white/10 transition-all">
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base md:text-lg">
                A block of mass <span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded text-xs sm:text-sm">m</span> is sliding down a frictionless incline angled at <span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded text-xs sm:text-sm">θ</span> to the horizontal. Derive the equation for its acceleration and calculate its final velocity if it starts from rest and travels a distance <span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded text-xs sm:text-sm">d</span>.
              </p>
              
              {/* Embedded Reference Image */}
              <div className="rounded-xl overflow-hidden border border-white/5 bg-white/5 hover:shadow-lg hover:shadow-white/5 transition-all">
                <img 
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/user-files/fd86d650-37a4-4a87-a832-38f8d246494a/c1d8f4a0-dfec-4aba-8c26-7c9d7cb813e2-pr.png?v=1776510287457" 
                  alt="Scenario Reference" 
                  className="w-full object-cover max-h-48 sm:max-h-64 md:max-h-80 lg:max-h-96"
                />
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{t('practice.yourSolution')}</h3>
              </div>

              {/* Upload Area */}
              <div className="animate-fade-in-up">
                <div className="w-full h-48 sm:h-64 md:h-72 lg:h-96 rounded-xl sm:rounded-2xl border-2 border-dashed border-white/10 hover:border-[#f99c00]/40 bg-gradient-to-b from-[#111827]/50 to-[#0D0F1B]/50 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white/5 group-hover:bg-[#f99c00]/10 flex items-center justify-center text-slate-400 group-hover:text-[#f99c00] group-hover:scale-110 transition-all duration-300 mb-3 sm:mb-4">
                    <Icon icon="solar:upload-minimalistic-linear" width="24" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white mb-1 sm:mb-2">{t('practice.clickToUpload')}</p>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs px-2">{t('practice.uploadDescription')}</p>
                </div>
              </div>

              {/* Submit Action */}
              {aiState !== 'feedback' && (
                <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                  <button 
                    onClick={handleSubmit}
                    disabled={aiState !== 'idle'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] px-4 sm:px-7 py-3 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#f99c00]/20 hover:shadow-xl hover:shadow-[#f99c00]/30 min-h-[44px] sm:min-h-[48px]"
                  >
                    {aiState === 'analyzing' ? (
                      <>
                        <Icon icon="solar:loader-bold" width="20" className="animate-spin" />
                        <span className="hidden xs:inline">{t('practice.analyzing')}</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:magic-stick-3-linear" width="20" />
                        <span className="hidden xs:inline">{t('practice.submitForEvaluation')}</span>
                        <span className="xs:hidden">{t('practice.submitForEvaluation')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Inline Feedback Section */}
              {aiState === 'feedback' && (
                <div className="mt-6 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10 border border-emerald-500/30 rounded-2xl p-7 md:p-8 animate-fade-in-up relative overflow-hidden shadow-lg shadow-emerald-500/10">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  <div className="flex flex-col gap-5 md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <Icon icon="solar:check-circle-bold" width="24" />
                        {t('practice.solutionEvaluated')}
                      </h3>
                      <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-3">
                        <p>Your approach to breaking down the vector components is correct and your derivation for the acceleration is flawless.</p>
                        <p>However, watch your units in the final substitution step. The final answer should be explicitly written in meters per second squared (<span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded">m/s²</span>).</p>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 self-center sm:self-auto mt-4 md:mt-0 md:ml-6">
                      <span className="text-4xl font-bold text-emerald-400 font-mono">85%</span>
                      <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest mt-1">{t('practice.score')}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setAiState('idle')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all w-full sm:w-auto active:scale-95">
                      {t('practice.tryAgain')}
                    </button>
                    <button onClick={() => setIsChatOpen(true)} className="px-6 py-3 rounded-lg bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] text-sm font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-[#f99c00]/20 active:scale-95">
                      <Icon icon="solar:chat-line-linear" width="20" />
                      <span className="hidden xs:inline">{t('practice.askMaestro')}</span>
                      <span className="xs:hidden">{t('practice.askMaestro')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Floating Chat Toggle Button - Only show on workboard when chat is closed */}
      {step === 'workboard' && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed lg:absolute right-4 bottom-24 lg:bottom-8 z-30 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#f99c00] to-amber-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-[#f99c00]/30 hover:shadow-[#f99c00]/50 hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Open AI Tutor"
          title="Ask Maestro AI for help"
        >
          <Icon icon="solar:magic-stick-3-bold" width="26" height="26" className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0B1120] rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          </span>
        </button>
      )}

      {/* ChatInterface Component - Handles all chat UI */}
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
