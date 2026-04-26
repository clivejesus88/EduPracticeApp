import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import { examLevels, physicsTopics, mathematicsTopics } from '../data/examStructure';


// Custom Canvas Component for Drawing
const DrawingCanvas = ({ isReadOnly }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#f99c00"; // Signature Orange
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    // Handle window resize gracefully
    const handleResize = () => {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#f99c00";
      ctx.lineWidth = 3;
      ctx.putImageData(data, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (isReadOnly) return;
    const { x, y } = getCoordinates(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (isReadOnly) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing || isReadOnly) return;
    const { x, y } = getCoordinates(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="relative w-full h-80 sm:h-96 md:h-112 rounded-xl overflow-hidden border border-white/10 bg-[#1A2234]">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className={`w-full h-full relative z-10 touch-none ${isReadOnly ? 'cursor-default' : 'cursor-crosshair'}`}
      />
      {!isReadOnly && (
        <button 
          onClick={clearCanvas}
          className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-md bg-[#0B1120]/80 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default function Practice() {
  const { t } = useLocalization();
  const [step, setStep] = useState('selectLevel'); // selectLevel | topics | workboard
  const [selectedExamLevel, setSelectedExamLevel] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('canvas');
  const [aiState, setAiState] = useState('idle'); // idle | analyzing | feedback
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello Sarah! I'm Maestro. I'm here if you have any follow-up questions about this scenario or need a hint." }
  ]);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSubmit = () => {
    if (aiState !== 'idle') return;
    
    // Simulate submission and inline feedback
    setAiState('analyzing');

    setTimeout(() => {
      setAiState('feedback');
    }, 2000);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    
    // Simulate AI thinking and follow-up response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "To find the final velocity, remember to use the kinematic equation v² = u² + 2as. Since it starts from rest, u = 0. Have you calculated the acceleration first?" 
      }]);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full relative overflow-hidden bg-[#0B1120] gap-4 lg:gap-0">
      
      {/* EXAM LEVEL SELECTION SCREEN */}
      {step === 'selectLevel' ? (
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 md:p-8 h-full">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">{t('practice.chooseATopic')}</h1>
              <p className="text-slate-400 text-lg">{t('examLevels.selectLevel')}</p>
            </div>

            {/* Exam Level Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 mb-10">
              {Object.values(examLevels).map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleExamLevelSelect(level.id)}
                  className="group relative p-6 sm:p-7 md:p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-[#111827] to-[#0D0F1B] hover:border-white/10 hover:shadow-lg hover:shadow-white/5 transition-all duration-300 text-left overflow-hidden active:scale-95"
                >
                  {/* Background glow on hover */}
                  <div className={`absolute -inset-96 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-3xl pointer-events-none`}></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon icon="solar:book-2-bold" width="24" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#f99c00] transition-colors duration-300">{level.name}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed">{level.description}</p>

                    {/* Difficulty Badge */}
                    <div className="pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
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
              className="flex items-center gap-2 text-slate-400 hover:text-[#f99c00] transition-colors mb-8 text-sm font-medium group"
            >
              <Icon icon="solar:alt-arrow-left-linear" width="20" className="group-hover:scale-110 transition-transform" />
              <span>{t('practice.backToTopics')}</span>
            </button>
            
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">{t('practice.chooseATopic')}</h1>
              <p className="text-slate-400 text-lg">{t('practice.selectSubject')}</p>
              <p className="text-xs text-[#f99c00] font-semibold mt-2 uppercase tracking-widest">{selectedExamLevel?.toUpperCase().replace('-', ' ')}</p>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 mb-10">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="group relative p-6 sm:p-7 md:p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-[#111827] to-[#0D0F1B] hover:border-white/10 hover:shadow-lg hover:shadow-white/5 transition-all duration-300 text-left overflow-hidden active:scale-95"
                >
                  {/* Background glow on hover */}
                  <div className={`absolute -inset-96 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-3xl pointer-events-none`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon and Stats Row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon icon={topic.icon} width="28" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{topic.questions} {t('practice.questions')}</p>
                        <p className="text-xs text-slate-500 mt-1">{topic.difficulty}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#f99c00] transition-colors duration-300">{topic.name}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{topic.description}</p>

                    {/* Subtopics (if available) */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Subtopics</p>
                        <div className="flex flex-wrap gap-2">
                          {topic.subtopics.slice(0, 3).map((sub, i) => (
                            <span key={i} className="text-xs px-2.5 py-1.5 rounded-full bg-white/5 text-slate-300 group-hover:bg-white/10 transition-all">
                              {sub.name}
                            </span>
                          ))}
                          {topic.subtopics.length > 3 && (
                            <span className="text-xs px-2.5 py-1.5 rounded-full bg-[#f99c00]/10 text-[#f99c00]">
                              +{topic.subtopics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer with CTA */}
                    <div className="flex items-center justify-between pt-5 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('practice.startNow')}</span>
                      <div className="w-8 h-8 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] group-hover:bg-[#f99c00] group-hover:text-[#0B1120] transition-all duration-300">
                        <Icon icon="solar:alt-arrow-right-linear" width="18" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-5">{t('practice.whyPractice')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 flex items-start gap-4 hover:border-[#f99c00]/20 hover:shadow-lg hover:shadow-[#f99c00]/5 transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] shrink-0 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:star-bold" width="20" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{t('practice.instantAiFeedback')}</h4>
                    <p className="text-xs text-slate-400">{t('practice.getInstantAnalysis')}</p>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 flex items-start gap-4 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:target-bold" width="20" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{t('practice.trackProgress')}</h4>
                    <p className="text-xs text-slate-400">{t('practice.monitorGrowth')}</p>
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
                className="flex items-center gap-2 text-slate-400 hover:text-[#f99c00] transition-colors mb-5 text-sm font-medium"
              >
                <Icon icon="solar:alt-arrow-left-linear" width="20" />
                <span>Back to Topics</span>
              </button>
              <div className="flex items-center gap-2 text-[#f99c00] text-xs font-bold uppercase tracking-widest mb-3">
                <Icon icon="solar:book-bookmark-linear" width="16" />
                <span>{selectedTopic?.name} • Kinematics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Projectile Motion Scenario</h1>
            </div>

            {/* Scenario Details Card */}
            <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-7 md:p-8 space-y-6 hover:border-white/10 transition-all">
              <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                A block of mass <span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded">m</span> is sliding down a frictionless incline angled at <span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded">θ</span> to the horizontal. Derive the equation for its acceleration and calculate its final velocity if it starts from rest and travels a distance <span className="font-mono text-[#f99c00] bg-[#f99c00]/10 px-2 py-1 rounded">d</span>.
              </p>
              
              {/* Embedded Reference Image */}
              <div className="rounded-xl overflow-hidden border border-white/5 bg-white/5 hover:shadow-lg hover:shadow-white/5 transition-all">
                <img 
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/user-files/fd86d650-37a4-4a87-a832-38f8d246494a/c1d8f4a0-dfec-4aba-8c26-7c9d7cb813e2-pr.png?v=1776510287457" 
                  alt="Scenario Reference" 
                  className="w-full object-cover max-h-72 md:max-h-96"
                />
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">{t('practice.yourSolution')}</h3>
                
                {/* Tabs */}
                <div className="flex bg-[#111827] p-1 rounded-xl border border-white/5 self-start w-full xs:w-auto">
                  <button 
                    onClick={() => setActiveTab('canvas')}
                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'canvas' ? 'bg-[#f99c00] text-[#0B1120] shadow-lg shadow-[#f99c00]/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Icon icon="solar:pen-linear" width="20" style={{ strokeWidth: 1 }} />
                    {t('practice.draw')}
                  </button>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upload' ? 'bg-[#f99c00] text-[#0B1120] shadow-lg shadow-[#f99c00]/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Icon icon="solar:gallery-linear" width="20" style={{ strokeWidth: 1 }} />
                    {t('practice.upload')}
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="animate-fade-in-up">
                {activeTab === 'canvas' ? (
                  <DrawingCanvas isReadOnly={aiState === 'analyzing' || aiState === 'feedback'} />
                ) : (
                  <div className="w-full h-72 md:h-96 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#f99c00]/40 bg-gradient-to-b from-[#111827]/50 to-[#0D0F1B]/50 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#f99c00]/10 flex items-center justify-center text-slate-400 group-hover:text-[#f99c00] group-hover:scale-110 transition-all duration-300 mb-4">
                      <Icon icon="solar:upload-minimalistic-linear" width="28" />
                    </div>
                    <p className="text-base font-semibold text-white mb-2">{t('practice.clickToUpload')}</p>
                    <p className="text-sm text-slate-500 max-w-xs">{t('practice.uploadDescription')}</p>
                  </div>
                )}
              </div>

              {/* Submit Action */}
              {aiState !== 'feedback' && (
                <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-between">
                  <button 
                    onClick={handleSubmit}
                    disabled={aiState !== 'idle'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] px-7 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#f99c00]/20 hover:shadow-xl hover:shadow-[#f99c00]/30"
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

      {/* Floating Chat Toggle Button - Only show on workboard */}
      {step === 'workboard' && (
        <button
          onClick={() => setIsChatOpen(true)}
          className={`fixed lg:absolute right-4 bottom-24 lg:bottom-8 z-30 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#f99c00] to-rose-500 rounded-full flex items-center justify-center text-[#0B1120] shadow-xl shadow-[#f99c00]/40 hover:scale-110 transition-all duration-300 font-bold text-lg ${isChatOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
          aria-label="Open AI Tutor"
        >
          <iconify-icon icon="solar:magic-stick-3-bold" width="28" className="sm:w-8 sm:h-8"></iconify-icon>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#f99c00] rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Mobile Backdrop for Chat Panel */}
      {isChatOpen && step === 'workboard' && (
        <div 
          className="fixed inset-0 bg-[#0B1120]/60 backdrop-blur-sm z-55 lg:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* Slide-over Maestro AI Chat Panel - Mobile Responsive */}
      {step === 'workboard' && (
        <div className={`fixed lg:absolute top-0 bottom-0 right-0 z-60 w-full sm:w-105 lg:w-100 h-dvh lg:h-full bg-[#0B1120] lg:bg-gradient-to-b lg:from-[#0B1120] lg:to-[#0B1120] border-l border-white/5 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-lg ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          
          {/* Panel Header */}
          <div className="p-4 sm:p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#111827] to-[#0D0F1B] pt-safe lg:pt-4 md:pt-6 shrink-0 z-10 relative shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#f99c00] to-rose-500 flex items-center justify-center text-white shadow-lg shadow-[#f99c00]/30 shrink-0">
                <iconify-icon icon="solar:magic-stick-3-bold" width="24"></iconify-icon>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 truncate">
                  Maestro AI
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-xs text-slate-400 truncate font-medium">Follow-up Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all lg:hidden shrink-0"
            >
              <iconify-icon icon="solar:close-circle-linear" width="24"></iconify-icon>
            </button>
          </div>

          {/* Chat Conversation Area - Better mobile scrolling */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-5 md:space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`} style={{ animationDelay: `${Math.min(idx * 0.1, 0.3)}s` }}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'border border-white/10 overflow-hidden' : 'bg-gradient-to-br from-[#f99c00] to-rose-500 text-white'}`}>
                  {msg.role === 'user' ? (
                    <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/user-files/fd86d650-37a4-4a87-a832-38f8d246494a/a14eeb81-d59e-4bcb-a228-5249b5a17192-pp.png?v=1776510809689" alt="Sarah K." className="w-full h-full object-cover" />
                  ) : <iconify-icon icon="solar:magic-stick-3-linear" width="20"></iconify-icon>}
                </div>
                <div className={`max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#f99c00] text-[#0B1120] rounded-tr-none font-semibold' : 'bg-[#111827] border border-white/5 text-slate-300 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Footer - Mobile optimized */}
          <form onSubmit={handleChatSubmit} className="p-3 sm:p-4 md:p-5 border-t border-white/5 bg-gradient-to-r from-[#111827] to-[#0D0F1B] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 md:pb-5 shrink-0 z-10 relative shadow-lg">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Maestro..." 
                className="w-full bg-[#0B1120] border border-white/10 hover:border-white/20 rounded-lg pl-4 pr-11 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f99c00]/50 focus:ring-2 focus:ring-[#f99c00]/30 transition-all"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f99c00]/10 text-[#f99c00] transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <iconify-icon icon="solar:plain-bold" width="22"></iconify-icon>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
