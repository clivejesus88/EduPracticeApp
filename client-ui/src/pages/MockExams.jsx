import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import { trackExamStart, trackExamCompletion } from '../utils/analyticsTracker';

export default function MockExams() {
  const { t } = useLocalization();
  const [selectedLevel, setSelectedLevel] = useState(null);
  
  const handleStartExam = (exam) => {
    trackExamStart(exam.title, exam.difficulty);
    // In a real app, this would navigate to exam page or open exam modal
    console.log('[v0] Starting exam:', exam.title);
  };
  
  const handleCreateExam = () => {
    // In a real app, this would open a custom exam builder
    console.log('[v0] Create exam clicked');
  };
  
  const handleViewAll = () => {
    // In a real app, this would show all exams for the selected level
    console.log('[v0] View all exams clicked');
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
    <div className="flex-1 overflow-y-auto w-full h-full p-4 sm:p-6 md:p-8 bg-[#0B1120]">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Mock Exams</h1>
          <p className="text-sm text-slate-400">Practice with full-length exams designed to match real exam standards</p>
        </div>

        {/* Exam Levels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {examLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
              className={`p-5 sm:p-6 rounded-xl border transition-all text-left group min-h-[120px] sm:min-h-[140px] flex flex-col justify-between ${
                selectedLevel === level.id
                  ? 'bg-[#f99c00]/15 border-[#f99c00]/50 shadow-lg shadow-[#f99c00]/20'
                  : 'bg-gradient-to-br from-[#111827] to-[#0D0F1B] border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{level.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400">{level.description}</p>
              </div>
              <p className="text-sm font-semibold text-[#f99c00]">{level.exams} Mock Exams</p>
            </button>
          ))}
        </div>

        {/* Mock Exams List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Available Mock Exams</h2>
            <button onClick={handleViewAll} className="text-sm font-medium text-[#f99c00] hover:text-[#f88c00] transition-colors">View All</button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {mockExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-4 sm:p-6 hover:border-white/10 transition-all group cursor-pointer"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  {/* Left - Title and difficulty */}
                  <div className="sm:col-span-2 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-white flex-1">{exam.title}</h3>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                        exam.difficulty === 'Easy' 
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : exam.difficulty === 'Medium'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {exam.difficulty}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-slate-400">
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

                  {/* Right - Score and action */}
                  <div className="flex flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {exam.score ? (
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-xs text-slate-400 mb-1">Your Score</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#f99c00]">{exam.score}%</p>
                      </div>
                    ) : (
                      <button onClick={() => handleStartExam(exam)} className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] rounded-lg font-semibold transition-all min-h-[44px] sm:min-h-[40px] flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-[#f99c00]/20">
                        <Icon icon="solar:play-circle-linear" width="18" />
                        <span className="hidden sm:inline">Start Exam</span>
                        <span className="sm:hidden">Start</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Custom Exam */}
        <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 sm:p-8 hover:border-white/10 transition-all text-center">
          <Icon icon="solar:layers-linear" width="48" height="48" className="text-[#f99c00] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Create Custom Exam</h3>
          <p className="text-sm text-slate-400 mb-4">Build your own mock exam by selecting specific topics and questions</p>
          <button onClick={handleCreateExam} className="px-6 py-3 bg-[#f99c00]/20 border border-[#f99c00]/30 hover:border-[#f99c00]/50 text-[#f99c00] rounded-lg font-semibold transition-all min-h-[44px] inline-flex items-center gap-2">
            <Icon icon="solar:add-circle-linear" width="20" />
            <span>Create Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
}
