import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import { getMetrics } from '../utils/analyticsTracker';

export default function DashboardUI() {
  const { t, translate } = useLocalization();
  const [metrics, setMetrics] = useState(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const data = getMetrics();
    setMetrics(data);
  }, []);

  const handleResumePractice = () => {
    setShowPracticeModal(true);
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };

  const handleStatClick = (statType) => {
    const messages = {
      questions: 'View detailed analytics for all questions solved',
      accuracy: 'Check your performance breakdown by subject',
      studyTime: 'View your study schedule and trends',
      exams: 'See exam results and progress',
    };
    alert(messages[statType] || 'Loading...');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1120]">
      {/* Header */}
      <div className="bg-[#0B1120] border-b border-white/5 sticky top-0 z-10">
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {translate('dashboard.welcomeBack', { name: 'Sarah' })}
                </h1>
                <p className="text-slate-400 text-sm mt-1">{t('dashboard.keepingMomentum')}</p>
              </div>
              <button
                onClick={handleResumePractice}
                className="w-full sm:w-auto px-6 py-3 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] rounded-lg font-semibold text-sm transition-all min-h-[44px] flex items-center justify-center gap-2 active:scale-95"
              >
                <Icon icon="solar:play-circle-linear" width="18" />
                <span>Resume Practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleStatClick('questions')}
              className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 hover:border-[#f99c00]/20 hover:shadow-lg hover:shadow-[#f99c00]/10 transition-all text-left group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Icon icon="solar:checklist-minimalistic-linear" width="24" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {metrics?.improvement > 0 ? '+' : ''}{metrics?.improvement}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t('dashboard.questionsSolved')}</p>
              <h3 className="text-2xl font-bold text-white">{metrics?.totalAttempts || 0}</h3>
            </button>

            <button
              onClick={() => handleStatClick('accuracy')}
              className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 hover:border-[#f99c00]/20 hover:shadow-lg hover:shadow-[#f99c00]/10 transition-all text-left group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Icon icon="solar:target-linear" width="24" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {Math.round((metrics?.avgAccuracy || 0) / 10) / 10}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t('dashboard.averageAccuracy')}</p>
              <h3 className="text-2xl font-bold text-white">{metrics?.avgAccuracy || 0}%</h3>
            </button>

            <button
              onClick={() => handleStatClick('studyTime')}
              className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 hover:border-[#f99c00]/20 hover:shadow-lg hover:shadow-[#f99c00]/10 transition-all text-left group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Icon icon="solar:clock-circle-linear" width="24" />
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">Active</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t('dashboard.studyTime')}</p>
              <h3 className="text-2xl font-bold text-white">42h 15m</h3>
            </button>

            <button
              onClick={() => handleStatClick('exams')}
              className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 hover:border-[#f99c00]/20 hover:shadow-lg hover:shadow-[#f99c00]/10 transition-all text-left group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Icon icon="solar:cup-star-linear" width="24" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">95th</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t('dashboard.examsPassed')}</p>
              <h3 className="text-2xl font-bold text-white">{metrics?.examsTaken || 0}</h3>
            </button>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Activity Chart */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                      {t('dashboard.learningActivity')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
                      {t('dashboard.questionsAnsweredWeek')}
                    </p>
                  </div>
                  <select className="w-full sm:w-auto bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 appearance-none transition-all min-h-[44px] sm:min-h-[40px]">
                    <option value="7" className="bg-[#111827]">{t('dashboard.lastSevenDays')}</option>
                    <option value="30" className="bg-[#111827]">{t('dashboard.lastThirtyDays')}</option>
                  </select>
                </div>

                <div className="h-56 flex items-end justify-between gap-1.5 mt-8 px-2">
                  {[
                    { h: '40%', d: 'M', v: '24' },
                    { h: '65%', d: 'T', v: '45' },
                    { h: '30%', d: 'W', v: '18' },
                    { h: '90%', d: 'T', v: '72', active: true },
                    { h: '50%', d: 'F', v: '32' },
                    { h: '75%', d: 'S', v: '54' },
                    { h: '20%', d: 'S', v: '12' },
                  ].map((bar, i) => (
                    <div key={i} className="w-full flex flex-col justify-end gap-2 group">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 relative ${
                          bar.active
                            ? 'bg-[#f99c00] shadow-lg shadow-[#f99c00]/40'
                            : 'bg-[#f99c00]/20 hover:bg-[#f99c00]/40'
                        }`}
                        style={{ height: bar.h }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2a3441]/95 text-xs text-white px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-medium">
                          {bar.v} Qs
                        </div>
                      </div>
                      <span className={`text-xs text-center font-semibold ${bar.active ? 'text-[#f99c00]' : 'text-slate-500'}`}>
                        {bar.d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold tracking-tight text-white">{t('dashboard.recentSessions')}</h3>
                  <button className="text-sm text-[#f99c00] hover:text-[#f99c00]/80 font-medium transition-colors">
                    {t('dashboard.viewAll')}
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Kinematics Practice Test', sub: 'Physics • 25 Qs', icon: 'solar:ruler-cross-pen-linear', score: '92%', time: '2h ago', colorBg: 'bg-blue-500/10', colorText: 'text-blue-500', scoreColor: 'text-emerald-400' },
                    { title: 'Integration Fundamentals', sub: 'Math • 15 Qs', icon: 'solar:calculator-linear', score: '78%', time: 'Yesterday', colorBg: 'bg-rose-500/10', colorText: 'text-rose-500', scoreColor: 'text-amber-400' },
                    { title: 'Derivatives Quiz', sub: 'Math • 20 Qs', icon: 'solar:graph-up-linear', score: '100%', time: '3d ago', colorBg: 'bg-purple-500/10', colorText: 'text-purple-500', scoreColor: 'text-emerald-400' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:border-white/10"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`w-10 h-10 rounded-lg ${item.colorBg} flex items-center justify-center ${item.colorText} shrink-0`}>
                          <Icon icon={item.icon} width="20" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-white mb-1 truncate">{item.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{item.sub}</p>
                        </div>
                      </div>
                      <div className="text-right pl-3 shrink-0">
                        <span className={`block text-sm font-semibold ${item.scoreColor} mb-1`}>{item.score}</span>
                        <span className="block text-xs text-slate-500">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Daily Goal */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-[#f99c00]/20 transition-all hover:shadow-lg hover:shadow-[#f99c00]/10">
                <div className="absolute -right-12 -top-12 text-white/5 group-hover:text-white/10 transform rotate-12 pointer-events-none transition-colors">
                  <Icon icon="solar:target-linear" width="150" height="150" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.dailyGoal')}</h3>
                  <p className="text-sm text-slate-400 mb-6">{t('dashboard.completeDailyQuestions')}</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-3xl font-semibold text-white leading-none">32</span>
                    <span className="text-sm text-slate-500 leading-relaxed mb-1">/ 50</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden mb-3 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#f99c00] to-[#f88c00] rounded-full" style={{ width: '64%' }} />
                  </div>
                  <p className="text-sm font-medium text-[#f99c00]">18 {t('dashboard.questionsRemaining')}</p>
                </div>
              </div>

              {/* Subject Mastery */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all">
                <h3 className="text-lg font-semibold text-white mb-6">{t('dashboard.subjectMastery')}</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-medium text-slate-300">Physics</span>
                      <span className="text-sm font-semibold text-white bg-blue-500/10 px-3 py-1 rounded-full">74%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-medium text-slate-300">Mathematics</span>
                      <span className="text-sm font-semibold text-white bg-rose-500/10 px-3 py-1 rounded-full">88%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 rounded-lg border border-white/10 hover:border-[#f99c00]/30 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95">
                  {t('dashboard.viewDetailedSyllabus')}
                </button>
              </div>

              {/* Study Reminders Toggle */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-6 flex items-center justify-between hover:border-white/10 transition-all hover:shadow-lg hover:shadow-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{t('dashboard.studyReminders')}</h4>
                  <p className="text-xs text-slate-500">{t('dashboard.dailyPracticeAlerts')}</p>
                </div>
                <div className="relative inline-block w-11 h-6 align-middle select-none">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle"
                    defaultChecked
                    className="absolute block w-6 h-6 rounded-full bg-white border-2 border-slate-600 appearance-none cursor-pointer z-10 transition-all duration-300 checked:bg-[#f99c00] checked:border-[#f99c00] checked:translate-x-5"
                  />
                  <label
                    htmlFor="toggle"
                    className="block overflow-hidden h-6 rounded-full bg-slate-700 cursor-pointer transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Practice Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
          <div className="bg-[#0B1120] border border-white/5 rounded-t-2xl sm:rounded-xl w-full sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4">Resume Your Practice</h2>

            <div className="space-y-2 mb-6">
              {[
                { title: 'Kinematics - Motion in 2D', progress: 65, lastStudied: '2 hours ago' },
                { title: 'Integration Fundamentals', progress: 42, lastStudied: 'Yesterday' },
                { title: 'Derivatives Quiz', progress: 100, lastStudied: '3 days ago' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSessionClick(item);
                    alert(`Resuming: ${item.title}`);
                    setShowPracticeModal(false);
                  }}
                  className="w-full p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#f99c00]/30 transition-all text-left group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white group-hover:text-[#f99c00] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-[#f99c00]">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#f99c00] to-[#f88c00] rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Last studied: {item.lastStudied}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPracticeModal(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-semibold transition-all text-sm min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Opening Practice Mode');
                  setShowPracticeModal(false);
                }}
                className="flex-1 px-4 py-2.5 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] rounded-lg font-semibold transition-all text-sm min-h-[40px]"
              >
                Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}