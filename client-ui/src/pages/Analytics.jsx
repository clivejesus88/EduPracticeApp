import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';

export default function Analytics() {
  const { t } = useLocalization();
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  return (
    <div className="flex-1 overflow-y-auto w-full h-full p-4 sm:p-6 md:p-8 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">{t('nav.analytics')}</h1>
            <p className="text-sm text-slate-400">Track your learning progress and performance metrics</p>
          </div>
          
          {/* Period Selector */}
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full sm:w-auto bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 appearance-none transition-all min-h-[44px] sm:min-h-[40px]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Questions Answered */}
          <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 hover:border-blue-500/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Icon icon="solar:checklist-minimalistic-linear" width="24" style={{ strokeWidth: 1 }} />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">+18%</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-2">Questions Answered</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">1,248</h3>
          </div>

          {/* Average Score */}
          <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 hover:border-purple-500/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Icon icon="solar:target-linear" width="24" style={{ strokeWidth: 1 }} />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">+2.4%</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-2">Average Score</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">86.5%</h3>
          </div>

          {/* Study Time */}
          <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 hover:border-rose-500/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Icon icon="solar:clock-circle-linear" width="24" style={{ strokeWidth: 1 }} />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-white/5 px-2.5 py-1 rounded-full">This month</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-2">Study Time</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">42h 15m</h3>
          </div>

          {/* Global Rank */}
          <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 hover:border-[#f99c00]/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#f99c00]/10 flex items-center justify-center text-[#f99c00] group-hover:scale-110 transition-transform">
                <Icon icon="solar:cup-star-linear" width="24" style={{ strokeWidth: 1 }} />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">Top 5%</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-2">Global Rank</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">#4,291</h3>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 md:p-8 hover:border-white/10 transition-all">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Subject Performance</h3>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Physics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Physics
                </span>
                <span className="text-sm font-bold text-white">78%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Mathematics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  Mathematics
                </span>
                <span className="text-sm font-bold text-white">92%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            {/* Chemistry */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  Chemistry
                </span>
                <span className="text-sm font-bold text-white">85%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 md:p-8 hover:border-white/10 transition-all">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Weekly Activity</h3>
          
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights = ['h-16', 'h-20', 'h-24', 'h-28', 'h-20', 'h-12', 'h-8'];
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className={`w-full ${heights[i]} bg-gradient-to-t from-[#f99c00] to-[#f99c00]/60 rounded-lg hover:from-[#f99c00] hover:to-[#f99c00]/80 transition-all cursor-pointer`}></div>
                  <span className="text-xs font-medium text-slate-500">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 relative overflow-hidden group hover:border-[#f99c00]/20 transition-all">
            <div className="absolute -right-16 -top-16 text-white/5 group-hover:text-white/10 transition-colors">
              <Icon icon="solar:fire-bold" width="120" height="120" />
            </div>
            
            <div className="relative z-10">
              <p className="text-xs sm:text-sm text-slate-400 mb-2 uppercase tracking-widest font-semibold">Current Streak</p>
              <h3 className="text-3xl sm:text-4xl font-bold text-[#f99c00] mb-1">12 Days</h3>
              <p className="text-xs sm:text-sm text-slate-500">Keep it up! Don't break your streak.</p>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-[#111827] to-[#0D0F1B] border border-white/5 rounded-xl p-5 sm:p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <div className="absolute -right-16 -top-16 text-white/5 group-hover:text-white/10 transition-colors">
              <Icon icon="solar:trophy-bold" width="120" height="120" />
            </div>
            
            <div className="relative z-10">
              <p className="text-xs sm:text-sm text-slate-400 mb-2 uppercase tracking-widest font-semibold">Longest Streak</p>
              <h3 className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-1">47 Days</h3>
              <p className="text-xs sm:text-sm text-slate-500">Your best record so far</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
