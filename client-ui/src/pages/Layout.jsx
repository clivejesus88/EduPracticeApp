import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';
import Avatar from '../components/Avatar';
import SearchModal from '../components/SearchModal';

export default function Layout() {
  const location = useLocation();
  const { t } = useLocalization();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Auto-hide bottom nav on scroll ──────────────────────────────────────────
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // We watch the main scroll container, not window, since overflow is on the inner div
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentY = container.scrollTop;
      const delta = currentY - lastScrollY.current;

      if (delta > 6 && currentY > 40) {
        // Scrolling down — hide nav
        setNavVisible(false);
      } else if (delta < -6) {
        // Scrolling up — show nav
        setNavVisible(true);
      }

      lastScrollY.current = currentY;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Always show nav on route change
  useEffect(() => {
    setNavVisible(true);
    lastScrollY.current = 0;
  }, [location.pathname]);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            <div className="w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-lg flex items-center justify-center text-[#0B1120] transition-all group-hover:scale-110 -white/20">
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
 ? 'bg-[#f99c00]/15 text-[#f99c00] '
 : 'text-slate-400 hover:text-white hover:bg-white/5'
 }`}
              >
                <Icon
                  icon={item.icon}
                  width="24" height="24"
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
          <Link to="/practice?subject=physics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-sm">{t('subjects.physics')}</span>
          </Link>
          <Link to="/practice?subject=mathematics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-sm">{t('subjects.mathematics')}</span>
          </Link>
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
          </div>

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-3 w-96 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] rounded-lg px-4 py-2.5 text-sm text-slate-500 transition-all group"
          >
            <Icon icon="solar:magnifier-linear" width="20" height="20" className="text-slate-400 group-hover:text-slate-300" style={{ strokeWidth: 1 }} />
            <span className="flex-1 text-left">Search topics, questions...</span>
            <div className="flex items-center gap-1">
              <kbd className="font-mono text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-2 py-1">⌘</kbd>
              <kbd className="font-mono text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-2 py-1">K</kbd>
            </div>
          </button>

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

            <a href="#" className="md:hidden w-10 h-10 rounded-full border border-white/10 overflow-hidden block hover:border-[#f99c00]/50 transition-all"></a>
          </div>
        </header>

        {/* Dynamic Route Content — scroll container ref lives here */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden z-10 flex flex-col relative"
        >
          <Outlet />

          {/* Spacer so content isn't permanently hidden behind the nav when visible */}
          <div className="md:hidden h-[60px] shrink-0" />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-0 left-0 w-64 h-[100dvh] pb-[60px] bg-gradient-to-b from-[#0B1120] to-[#0D0F1B] border-r border-white/5 flex flex-col z-40 transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="h-20 px-6 flex items-center border-b border-white/5 sticky top-0 bg-[#0B1120]/95 backdrop-blur">
          <Link to="/" className="flex items-center gap-3 group w-full" onClick={() => setIsMobileSidebarOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-lg flex items-center justify-center text-[#0B1120] transition-all group-hover:scale-110 -white/20">
              <Icon icon="lucide:graduation-cap" width="28" height="28" style={{ strokeWidth: 1 }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EduPractice</span>
          </Link>
        </div>

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
 ? 'bg-[#f99c00]/15 text-[#f99c00] '
 : 'text-slate-400 hover:text-white hover:bg-white/5'
 }`}
              >
                <Icon
                  icon={item.icon}
                  width="24" height="24"
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
          <Link to="/practice?subject=physics" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-sm">{t('subjects.physics')}</span>
          </Link>
          <Link to="/practice?subject=mathematics" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-sm">{t('subjects.mathematics')}</span>
          </Link>
        </nav>

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

      {/* ── Mobile Bottom Nav — auto-hide on scroll down ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-[#0B1120]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-50"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
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
          );
        })}
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

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
