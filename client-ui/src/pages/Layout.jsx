import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import Avatar from '../components/Avatar';

export default function Layout() {
  const location = useLocation();
  const { t } = useLocalization();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: 'solar:home-2-linear' },
    { name: t('nav.practice'), path: '/practice', icon: 'solar:book-bookmark-linear' },
    { name: t('nav.analytics'), path: '/analytics', icon: 'solar:chart-square-linear' },
    { name: t('nav.mockExams'), path: '/mock-exams', icon: 'solar:target-linear' },
  ];

  return (
    <div className="antialiased h-[100dvh] w-full overflow-hidden flex flex-col md:flex-row bg-[#0B1120]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-full border-r border-white/5 bg-gradient-to-b from-[#0B1120] to-[#0D0F1B] flex-col flex-shrink-0 z-20">
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-lg flex items-center justify-center text-[#0B1120] transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20">
              <Icon icon="lucide:graduation-cap" width="28" height="28" style={{ strokeWidth: 1 }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EduPractice</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group font-medium ${
                  isActive 
                    ? 'bg-[#f99c00]/15 text-[#f99c00] shadow-lg shadow-[#f99c00]/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon 
                  icon={item.icon} 
                  width="24" 
                  height="24" 
                  className={isActive ? '' : 'group-hover:text-white transition-colors'} 
                  style={{ strokeWidth: 1 }}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('sidebar.subjects')}</p>
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-sm">{t('subjects.physics')}</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-sm">{t('subjects.mathematics')}</span>
          </a>
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-white/5">
          <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all group">
            <Avatar name="Sarah K." size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Sarah K.</p>
              <p className="text-xs text-slate-500 truncate">{t('sidebar.freeplan')}</p>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" width="20" height="20" className="text-slate-500 group-hover:text-[#f99c00] transition-colors" style={{ strokeWidth: 1 }} />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0B1120]">
        {/* Background Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#f99c00]/3 rounded-full blur-[150px] pointer-events-none z-0 opacity-40"></div>

        {/* Top Header */}
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#0B1120] to-[#0D0F1B] backdrop-blur-lg z-10 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <Icon icon={isMobileSidebarOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="24" style={{ strokeWidth: 1 }} />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-lg flex items-center justify-center text-[#0B1120] group-hover:scale-110 transition-all">
                <Icon icon="lucide:graduation-cap" width="24" height="24" style={{ strokeWidth: 1 }} />
              </div>
            </Link>
          </div>
          <Link to="/" className="hidden md:flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-lg flex items-center justify-center text-[#0B1120] group-hover:scale-110 transition-all">
              <Icon icon="lucide:graduation-cap" width="24" height="24" style={{ strokeWidth: 1 }} />
            </div>
          </Link>

          <div className="hidden md:block relative w-96">
            <Icon icon="solar:magnifier-linear" width="20" height="20" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ strokeWidth: 1 }} />
            <input type="text" placeholder="Search topics, questions..." className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-lg pl-12 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f99c00]/50 focus:ring-2 focus:ring-[#f99c00]/30 transition-all" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="font-mono text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-2 py-1">⌘</kbd>
              <kbd className="font-mono text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-2 py-1">K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-[#111827]/80 hover:border-[#f99c00]/30 transition-all">
              <Icon icon="solar:fire-linear" width="18" height="18" className="text-[#f99c00]" style={{ strokeWidth: 1 }} />
              <span className="text-xs md:text-sm font-bold text-slate-300">12<span className="hidden sm:inline"> Days</span></span>
            </div>
            
            <button className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Icon icon="solar:bell-linear" width="24" height="24" style={{ strokeWidth: 1 }} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f99c00] border border-[#0B1120]"></span>
            </button>
            
            <button className="hidden md:flex w-11 h-11 items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Icon icon="solar:settings-linear" width="24" height="24" style={{ strokeWidth: 1 }} />
            </button>

            <a href="#" className="md:hidden w-10 h-10 rounded-full border border-white/10 overflow-hidden block hover:border-[#f99c00]/50 transition-all">
            </a>
          </div>
        </header>

        {/* Dynamic Route Content container */}
        <div className="flex-1 overflow-hidden z-10 flex flex-col relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-0 left-0 w-64 h-[100dvh] bg-gradient-to-b from-[#0B1120] to-[#0D0F1B] border-r border-white/5 flex flex-col z-40 transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-white/5 sticky top-0 bg-[#0B1120]/95 backdrop-blur">
          <Link to="/" className="flex items-center gap-3 group w-full" onClick={() => setIsMobileSidebarOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-lg flex items-center justify-center text-[#0B1120] transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20">
              <Icon icon="lucide:graduation-cap" width="28" height="28" style={{ strokeWidth: 1 }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EduPractice</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group font-medium ${
                  isActive 
                    ? 'bg-[#f99c00]/15 text-[#f99c00] shadow-lg shadow-[#f99c00]/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon 
                  icon={item.icon} 
                  width="24" 
                  height="24" 
                  className={isActive ? '' : 'group-hover:text-white transition-colors'} 
                  style={{ strokeWidth: 1 }}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('sidebar.subjects')}</p>
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-sm">{t('subjects.physics')}</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-sm">{t('subjects.mathematics')}</span>
          </a>
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-white/5 sticky bottom-0 bg-[#0B1120]/95 backdrop-blur">
          <Link to="/profile" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all group">
            <Avatar name="Sarah K." size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Sarah K.</p>
              <p className="text-xs text-slate-500 truncate">{t('sidebar.freeplan')}</p>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" width="20" height="20" className="text-slate-500 group-hover:text-[#f99c00] transition-colors" style={{ strokeWidth: 1 }} />
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Icons Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-[#0B1120]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center justify-center w-16 h-full transition-all ${
                isActive ? 'text-[#f99c00]' : 'text-slate-500 hover:text-white'
              }`}
              aria-label={item.name}
            >
              <Icon icon={item.icon} width="24" height="24" style={{ strokeWidth: 1.5 }} />
            </Link>
          )
        })}
        {/* Profile Icon */}
        <Link 
          to="/profile" 
          className={`flex items-center justify-center w-16 h-full transition-all ${
            location.pathname === '/profile' ? 'text-[#f99c00]' : 'text-slate-500 hover:text-white'
          }`}
          aria-label="Profile"
        >
          <Icon icon="solar:user-circle-linear" width="24" height="24" style={{ strokeWidth: 1.5 }} />
        </Link>
      </nav>
    </div>
  );
}
