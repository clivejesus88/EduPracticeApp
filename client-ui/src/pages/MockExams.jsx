import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import { trackExamStart, trackExamCompletion } from '../utils/analyticsTracker';

export default function MockExams() {
  const { t } = useLocalization();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showAllExams, setShowAllExams] = useState(false);
  const [activeExamModal, setActiveExamModal] = useState(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customExamConfig, setCustomExamConfig] = useState({
    subject: '',
    difficulty: '',
    numberOfQuestions: 30
  });
  
  const handleStartExam = (exam) => {
    trackExamStart(exam.title, exam.difficulty);
    setActiveExamModal(exam);
  };
  
  const handleCreateExam = () => {
    setShowCustomBuilder(!showCustomBuilder);
    setCustomExamConfig({ subject: '', difficulty: '', numberOfQuestions: 30 });
  };
  
  const handleViewAll = () => {
    setShowAllExams(!showAllExams);
  };

  const handleConfirmExam = () => {
    trackExamStart(activeExamModal.title, activeExamModal.difficulty);
    // In a real app, navigate to exam page
    setActiveExamModal(null);
    alert(`Starting exam: ${activeExamModal.title}`);
  };

  const handleBuildCustomExam = () => {
    if (!customExamConfig.subject || !customExamConfig.difficulty) {
      alert('Please select a subject and difficulty level');
      return;
    }
    alert(`Building custom exam: ${customExamConfig.numberOfQuestions} ${customExamConfig.difficulty} questions on ${customExamConfig.subject}`);
    setShowCustomBuilder(false);
  };

  const examLevels = [
    { id: 'olevel', name: 'O-Level (UCE)', description: 'Uganda Certificate of Education', exams: 12 },
    { id: 'alevel', name: 'A-Level', description: 'Advanced Level', exams: 8 },
    { id: 'uace', name: 'UACE', description: 'Uganda Advanced Certificate of Education', exams: 6 },
  ];

  const mockExams = [
    { id: 1, title: 'Full Mock Exam - Physics Paper 1', duration: '2h 30m', questions: 50, difficulty: 'Hard', date: '2024-01-15', score: 78 },
    { id: 2, title: 'Physics - Mechanics Section', duration: '1h', questions: 20, difficulty: 'Medium', date: '2024-01-14', score: 85 },
    { id: 3, title: 'Mathematics - Algebra & Calculus', duration: '1h 30m', questions: 30, difficulty: 'Hard', date: '2024-01-13', score: null },
    { id: 4, title: 'Chemistry - Organic Chemistry', duration: '1h', questions: 25, difficulty: 'Medium', date: '2024-01-12', score: 82 },
    { id: 5, title: 'Biology - Cell Biology', duration: '45m', questions: 15, difficulty: 'Easy', date: '2024-01-11', score: 91 },
    { id: 6, title: 'English - Literature Analysis', duration: '2h', questions: 40, difficulty: 'Medium', date: '2024-01-10', score: 88 },
  ];

  return (
    <>
      <div className="w-full bg-[#0B1120]">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#f99c00]/20 to-[#f99c00]/10 px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{t('nav.mockExams')}</h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl">Practice with full-length exams designed to match real exam standards. Track your progress and identify areas to improve.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Exam Levels Section */}
            <div className="mb-12 sm:mb-14 md:mb-16">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Select Your Level</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {examLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
                    className={`p-6 md:p-8 rounded-xl border-2 transition-all text-left group ${
 selectedLevel === level.id
 ? 'bg-[#f99c00]/10 border-[#f99c00] '
 : 'bg-white/5 border-white/10 hover:border-[#f99c00]/50'
 }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
 selectedLevel === level.id
 ? 'bg-[#f99c00] text-[#0B1120]'
 : 'bg-white/10 text-slate-300'
 }`}>
                        <Icon icon="solar:book-2-bold" width="24" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{level.name}</h3>
                        <p className="text-xs text-slate-400">{level.exams} exams</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Exams List Section */}
            <div className="mb-12 sm:mb-14 md:mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Available Exams</h2>
                <button 
                  onClick={handleViewAll}
                  className="text-[#f99c00] hover:text-[#f99c00]/80 font-medium text-sm"
                >
                  {showAllExams ? '← Show less' : 'View all →'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                {(showAllExams ? mockExams : mockExams.slice(0, 3)).map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-[#f99c00]/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left side - Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white">{exam.title}</h3>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
 exam.difficulty === 'Easy' 
 ? 'bg-emerald-500/20 text-emerald-400'
 : exam.difficulty === 'Medium'
 ? 'bg-[#f99c00]/20 text-[#f99c00]'
 : 'bg-red-500/20 text-red-400'
 }`}>
                            {exam.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Icon icon="solar:clock-circle-linear" width="16" />
                            <span>{exam.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icon icon="solar:checklist-minimalistic-linear" width="16" />
                            <span>{exam.questions} Questions</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icon icon="solar:calendar-linear" width="16" />
                            <span>{exam.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Action */}
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        {exam.score ? (
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">Score</p>
                            <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{exam.score}%</p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleStartExam(exam)}
                            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-[#f99c00] hover:bg-[#f99c00]/90 text-[#0B1120] rounded-lg font-semibold text-sm transition-all active:scale-95 min-h-[40px] flex items-center justify-center gap-2"
                          >
                            <Icon icon="solar:play-circle-linear" width="18" />
                            <span className="hidden sm:inline">Start</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Custom Exam Section */}
            <div className="bg-gradient-to-br from-[#f99c00]/10 to-[#f99c00]/5 border border-[#f99c00]/20 rounded-xl p-8 sm:p-10 md:p-12 text-center">
              <Icon icon="solar:layers-linear" width="48" height="48" className="text-[#f99c00] mx-auto mb-4 opacity-75" />
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Build Custom Exam</h3>
              <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-2xl mx-auto">Create a personalized exam by selecting your preferred subjects, difficulty level, and number of questions.</p>
              <button 
                onClick={handleCreateExam}
                className="px-7 py-3 bg-[#f99c00] hover:bg-[#f99c00]/90 text-[#0B1120] rounded-lg font-semibold transition-all text-sm inline-flex items-center gap-2 min-h-[44px]"
              >
                <Icon icon="solar:add-circle-linear" width="20" />
                Create Custom Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Start Modal */}
      {activeExamModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#111827] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Ready to start?</h2>
              <button 
                onClick={() => setActiveExamModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <Icon icon="solar:close-circle-linear" width="24" />
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Exam Title</p>
                <p className="text-white font-semibold">{activeExamModal.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Duration</p>
                  <p className="text-white font-semibold">{activeExamModal.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Questions</p>
                  <p className="text-white font-semibold">{activeExamModal.questions}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveExamModal(null)}
                className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 rounded-lg font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExam}
                className="flex-1 px-4 py-2.5 bg-[#f99c00] hover:bg-[#f99c00]/90 text-[#0B1120] rounded-lg font-semibold transition-all"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Exam Builder Modal */}
      {showCustomBuilder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#111827] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Custom Exam</h2>
              <button 
                onClick={() => setShowCustomBuilder(false)}
                className="text-slate-400 hover:text-white"
              >
                <Icon icon="solar:close-circle-linear" width="24" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Subject</label>
                <select 
                  value={customExamConfig.subject}
                  onChange={(e) => setCustomExamConfig({...customExamConfig, subject: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                >
                  <option value="" className="bg-[#111827]">Select a subject</option>
                  <option value="physics" className="bg-[#111827]">Physics</option>
                  <option value="mathematics" className="bg-[#111827]">Mathematics</option>
                  <option value="chemistry" className="bg-[#111827]">Chemistry</option>
                  <option value="biology" className="bg-[#111827]">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty</label>
                <select 
                  value={customExamConfig.difficulty}
                  onChange={(e) => setCustomExamConfig({...customExamConfig, difficulty: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                >
                  <option value="" className="bg-[#111827]">Select difficulty</option>
                  <option value="Easy" className="bg-[#111827]">Easy</option>
                  <option value="Medium" className="bg-[#111827]">Medium</option>
                  <option value="Hard" className="bg-[#111827]">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Number of Questions</label>
                <input 
                  type="number"
                  min="5"
                  max="100"
                  value={customExamConfig.numberOfQuestions}
                  onChange={(e) => setCustomExamConfig({...customExamConfig, numberOfQuestions: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomBuilder(false)}
                className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 rounded-lg font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBuildCustomExam}
                className="flex-1 px-4 py-2.5 bg-[#f99c00] hover:bg-[#f99c00]/90 text-[#0B1120] rounded-lg font-semibold transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
