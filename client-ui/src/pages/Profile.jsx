import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useUser } from '../contexts/UserContext';
import Avatar from '../components/Avatar';
import useAnalyticsData from '../hooks/useAnalyticsData';

function fmtMinutes(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Profile() {
  const { t } = useLocalization();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    schoolName: user.schoolName,
    examLevel: user.examLevel,
    dailyGoal: user.dailyGoal,
    notifications: user.notifications,
    twoFactor: user.twoFactor,
  });

  const { data: analytics, loading: analyticsLoading, source } = useAnalyticsData();

  // Keep local form in sync when the user context changes from elsewhere
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        schoolName: user.schoolName,
        examLevel: user.examLevel,
        dailyGoal: user.dailyGoal,
        notifications: user.notifications,
        twoFactor: user.twoFactor,
      });
    }
  }, [user, isEditing]);

  const BADGE_DEFINITIONS = [
    {
      name: 'First Steps',
      icon: 'solar:rocket-linear',
      desc: 'Complete your first exam attempt',
      earned: (a) => a.totalAttempts >= 1,
    },
    {
      name: 'Consistent Learner',
      icon: 'solar:fire-linear',
      desc: 'Maintain a 3-day study streak',
      earned: (a) => a.streak >= 3,
    },
    {
      name: 'Master of Physics',
      icon: 'solar:flash-bold',
      desc: 'Achieve 80 %+ accuracy in Physics',
      earned: (a) => {
        const p = a.subjectPerformance?.find(s => s.subject === 'Physics');
        return p && p.mastery >= 80 && p.total >= 5;
      },
    },
    {
      name: 'Quick Thinker',
      icon: 'solar:lightning-bolt-linear',
      desc: 'Score 75 %+ average across all attempts',
      earned: (a) => a.avgScore >= 75 && a.totalAttempts >= 3,
    },
    {
      name: 'Maths Wizard',
      icon: 'solar:calculator-minimalistic-linear',
      desc: 'Achieve 80 %+ accuracy in Mathematics',
      earned: (a) => {
        const m = a.subjectPerformance?.find(s => s.subject === 'Mathematics');
        return m && m.mastery >= 80 && m.total >= 5;
      },
    },
    {
      name: 'Century Club',
      icon: 'solar:medal-ribbons-star-linear',
      desc: 'Answer 100+ questions in total',
      earned: (a) => a.totalQuestions >= 100,
    },
    {
      name: 'Iron Streak',
      icon: 'solar:calendar-mark-linear',
      desc: 'Study 7 days in a row',
      earned: (a) => a.streak >= 7,
    },
    {
      name: 'Top Scorer',
      icon: 'solar:cup-star-linear',
      desc: 'Score 90 %+ average across 5+ attempts',
      earned: (a) => a.avgScore >= 90 && a.totalAttempts >= 5,
    },
  ];

  const badges = useMemo(() => {
    if (!analytics) return BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: false }));
    return BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: b.earned(analytics) }));
  }, [analytics]);

  const earnedBadges = badges.filter(b => b.unlocked);

  const stats = [
    {
      icon: 'solar:checklist-minimalistic-linear',
      label: t('profile.questionsAttempted'),
      value: analyticsLoading ? '…' : analytics?.totalQuestions?.toLocaleString() ?? '0',
      color: 'blue',
    },
    {
      icon: 'solar:target-linear',
      label: t('profile.averageAccuracyScore'),
      value: analyticsLoading ? '…' : `${analytics?.accuracyOverall ?? 0}%`,
      color: 'purple',
    },
    {
      icon: 'solar:clock-circle-linear',
      label: t('profile.totalStudyTime'),
      value: analyticsLoading ? '…' : fmtMinutes(analytics?.studyMinutes ?? 0),
      color: 'rose',
    },
    {
      icon: 'solar:cup-star-linear',
      label: t('profile.achievements'),
      value: analyticsLoading ? '…' : `${earnedBadges.length} / ${BADGE_DEFINITIONS.length}`,
      color: 'amber',
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const colorMap = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    rose: 'from-rose-500 to-orange-500',
    amber: 'from-amber-500 to-yellow-500'
  };

  const colorBgMap = {
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    rose: 'bg-rose-500/10 text-rose-400',
    amber: 'bg-amber-500/10 text-amber-400'
  };

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 md:p-8 h-full">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-1 sm:mb-2 break-words">{t('profile.myProfile')}</h1>
            <p className="text-xs sm:text-sm text-slate-400">Manage your account settings and learning preferences</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all active:scale-95 min-h-[44px] sm:min-h-[40px] shrink-0"
            >
              <Icon icon="solar:pen-linear" width="16" style={{ strokeWidth: 1 }} />
              <span className="hidden sm:inline">{t('profile.editProfile')}</span>
              <span className="sm:hidden">Edit</span>
            </button>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-lg md:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 hover:border-white/10 transition-all">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
                <Avatar name={formData.fullName} size={112} className="!rounded-lg md:!rounded-2xl !border-2 !border-[#f99c00]/30 w-full h-full" />
              </div>
              <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-3 sm:w-4 h-3 sm:h-4 bg-emerald-500 rounded-full border-2 border-[#0B1120]"></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3 sm:space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 min-h-[44px] sm:min-h-[40px]"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 min-h-[44px] sm:min-h-[40px]"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1 break-words">{formData.fullName}</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4 break-all">{formData.email}</p>
                </>
              )}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f99c00]/10 border border-[#f99c00]/30">
                  <span className="text-xs font-semibold text-[#f99c00] uppercase tracking-widest">{formData.examLevel}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Icon icon="solar:check-circle-bold" width="14" className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group cursor-pointer hover:scale-105"
            >
              <div className={`w-12 h-12 rounded-lg ${colorBgMap[stat.color]} flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform`}>
                <Icon icon={stat.icon} width="24" />
              </div>
              <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'personal', label: t('profile.personalInfo') },
            { id: 'security', label: t('profile.accountSettings') },
            { id: 'preferences', label: t('profile.preferences') },
            { id: 'achievements', label: t('profile.achievements') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
 activeTab === tab.id
 ? 'text-[#f99c00] border-[#f99c00]'
 : 'text-slate-400 border-transparent hover:text-white'
 }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-6">{t('profile.personalInfo')}</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">{t('profile.fullName')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                    />
                  ) : (
                    <p className="text-white">{formData.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">{t('profile.email')}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                    />
                  ) : (
                    <p className="text-white">{formData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">{t('profile.schoolName')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                    />
                  ) : (
                    <p className="text-white">{formData.schoolName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">{t('profile.examLevel')}</label>
                  {isEditing ? (
                    <select
                      name="examLevel"
                      value={formData.examLevel}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50"
                    >
                      <option>A-Level</option>
                      <option>UACE</option>
                    </select>
                  ) : (
                    <p className="text-white">{formData.examLevel}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icon icon="solar:lock-linear" width="20" />
                  {t('profile.changePassword')}
                </h3>
                <button className="px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-sm font-semibold text-slate-300 hover:text-white transition-all">
                  Update Password
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      <Icon icon="solar:shield-linear" width="20" />
                      {t('profile.twoFactorAuth')}
                    </h3>
                    <p className="text-sm text-slate-400">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase ${formData.twoFactor ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {formData.twoFactor ? t('profile.enabled') : t('profile.disabled')}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
                        className={`relative w-12 h-7 rounded-full transition-colors ${formData.twoFactor ? 'bg-emerald-500' : 'bg-slate-600'}`}
                      >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.twoFactor ? 'translate-x-5' : ''}`}></div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">{t('profile.dailyGoalTarget')}</label>
                {isEditing ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="dailyGoal"
                      min="10"
                      max="200"
                      value={formData.dailyGoal}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-[#f99c00] min-w-fit">{formData.dailyGoal} questions</span>
                  </div>
                ) : (
                  <p className="text-white text-lg">{formData.dailyGoal} questions per day</p>
                )}
              </div>

              <div className="border-t border-white/5 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{t('profile.notificationReminders')}</h4>
                    <p className="text-sm text-slate-400">Receive daily practice reminders</p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, notifications: !prev.notifications }))}
                      className={`relative w-12 h-7 rounded-full transition-colors ${formData.notifications ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.notifications ? 'translate-x-5' : ''}`}></div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Badges</h3>
                <span className="text-xs font-semibold text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full tabular-nums">
                  {earnedBadges.length} / {BADGE_DEFINITIONS.length} earned
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {badges.map((badge, idx) => (
                  <div key={idx} className="group relative">
                    <div className={`rounded-2xl p-4 sm:p-5 transition-all text-center border ${
                      badge.unlocked
                        ? 'bg-[#f99c00]/5 border-[#f99c00]/20 hover:border-[#f99c00]/40 hover:scale-105 cursor-default'
                        : 'bg-white/[0.02] border-white/[0.06] opacity-50'
                    }`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform ${
                        badge.unlocked
                          ? 'bg-[#f99c00]/15 text-[#f99c00] group-hover:scale-110'
                          : 'bg-white/5 text-slate-600'
                      }`}>
                        <Icon icon={badge.unlocked ? badge.icon : 'solar:lock-linear'} width="22" />
                      </div>
                      <h4 className={`text-xs font-bold mb-1 leading-tight ${badge.unlocked ? 'text-white' : 'text-slate-600'}`}>
                        {badge.name}
                      </h4>
                      <p className={`text-[10px] leading-snug ${badge.unlocked ? 'text-slate-500' : 'text-slate-700'}`}>
                        {badge.desc}
                      </p>
                      {badge.unlocked && (
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <Icon icon="solar:check-circle-bold" width="12" className="text-emerald-400" />
                          <span className="text-[10px] font-semibold text-emerald-400">Earned</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-8 sticky bottom-4 justify-center">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-semibold text-slate-300 hover:text-white transition-all"
            >
              {t('profile.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-lg bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
            >
              <Icon icon="solar:check-linear" width="18" />
              {t('profile.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
