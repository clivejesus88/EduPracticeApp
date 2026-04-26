import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';

export default function Profile() {
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: 'Sarah K.',
    email: 'sarah.k@example.com',
    schoolName: 'Makerere University',
    examLevel: 'A-Level',
    dailyGoal: 50,
    notifications: true,
    twoFactor: false
  });

  const stats = [
    { icon: 'solar:checklist-minimalistic-linear', label: t('profile.questionsAttempted'), value: '1,248', color: 'blue' },
    { icon: 'solar:target-linear', label: t('profile.averageAccuracyScore'), value: '86.5%', color: 'purple' },
    { icon: 'solar:clock-circle-linear', label: t('profile.totalStudyTime'), value: '156h 45m', color: 'rose' },
    { icon: 'solar:cup-star-linear', label: t('profile.achievements'), value: '24', color: 'amber' }
  ];

  const badges = [
    { name: 'First Steps', icon: 'solar:rocket-linear', date: 'Jan 15, 2025' },
    { name: 'Consistent Learner', icon: 'solar:fire-linear', date: 'Feb 3, 2025' },
    { name: 'Master of Physics', icon: 'solar:flash-bold', date: 'Feb 20, 2025' },
    { name: 'Quick Thinker', icon: 'solar:lightning-bolt-linear', date: 'Mar 1, 2025' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In production, this would send data to backend
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
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/user-files/fd86d650-37a4-4a87-a832-38f8d246494a/a14eeb81-d59e-4bcb-a228-5249b5a17192-pp.png?v=1776510809689"
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg md:rounded-2xl object-cover border-2 border-[#f99c00]/30"
              />
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
                      <option>O-Level</option>
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
              <h3 className="text-lg font-bold text-white mb-6">Earned Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge, idx) => (
                  <div key={idx} className="group relative">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#f99c00]/30 transition-all text-center cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-[#f99c00]/10">
                      <div className="w-12 h-12 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Icon icon={badge.icon} width="24" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">{badge.name}</h4>
                      <p className="text-xs text-slate-500 mt-2">{badge.date}</p>
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
