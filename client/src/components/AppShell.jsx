import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Menu, Shield, X, Bell, Moon, Sun, Laptop, User, Settings,
  Flame, Calendar, Search, ChevronRight, GraduationCap, Award, Sparkles
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../data/mockData.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getSkillMatchPercent } from '../data/roleSkillsMap.js';
import useLiveTime from '../hooks/useLiveTime.js';
import Logo, { LogoIcon } from './Logo.jsx';
import GlobalSearchModal from './dashboard/GlobalSearchModal.jsx';
import NotificationDrawer from './dashboard/NotificationDrawer.jsx';

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { dateStr, timeStr } = useLiveTime();
  const dropdownRef = useRef(null);
  const themeRef = useRef(null);

  // Computed sidebar data
  const targetRole = user?.profile?.targetRole || 'Full Stack Developer';
  const readinessPercent = getSkillMatchPercent(targetRole, user?.profile?.skills || []);
  const streakCurrent = user?.streak?.current || 0;
  const dailyGoalProgress = user?.xp ? Math.min(100, Math.floor((user.xp % 60) / 60 * 100)) : 0;

  function signOut() {
    logout();
    navigate('/login');
  }

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Breadcrumbs title calculations
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((seg, idx) => {
    const path = '/' + pathSegments.slice(0, idx + 1).join('/');
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');
    return { path, label };
  });

  const currentPageTitle = (() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/command-center') return 'Command Center';
    if (path === '/roadmap') return 'Roadmap';
    if (path === '/skill-gap') return 'Skill Gap';
    if (path === '/interview') return 'Interview Prep';
    if (path === '/chatbot') return 'AI Chatbot';
    if (path === '/jobs') return 'Jobs';
    if (path === '/learning') return 'Learning Hub';
    if (path === '/certificates') return 'Certificates';
    if (path === '/progress') return 'Progress';
    if (path === '/goals') return 'Career Goals';
    if (path === '/profile') return 'My Profile';
    if (path === '/admin') return 'Admin Panel';
    return 'CareerPilot AI';
  })();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-obsidian dark:text-white transition-colors">
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} onCountChange={setNotifCount} />

      {/* ─── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-200/80 bg-white/95 dark:border-white/10 dark:bg-black/80 p-5 backdrop-blur-2xl transition lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" onClick={() => setOpen(false)} className="inline-block">
            <Logo size="md" subtitle="Command Center" />
          </Link>
          <button
            className="lg:hidden p-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-4">Navigation</div>
          <nav className="space-y-1 mb-8" aria-label="Primary navigation">
            {navItems.map(([label, href, Icon]) => (
              <NavLink
                key={href}
                to={href}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-gold/10 to-transparent dark:from-gold/20 text-gold border-l-2 border-gold shadow-[inset_20px_0_20px_rgba(214,168,58,0.05)]'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white border-l-2 border-transparent'
                }`}
                aria-label={label}
              >
                <Icon size={18} className="transition-colors" aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>

          {user?.role === 'admin' && (
            <>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-4">System</div>
              <nav className="space-y-1" aria-label="Admin navigation">
                <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-gradient-to-r from-gold/10 to-transparent dark:from-gold/20 text-gold border-l-2 border-gold' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 border-l-2 border-transparent'}`}>
                  <Shield size={18} aria-hidden="true" /> Admin Panel
                </NavLink>
              </nav>
            </>
          )}
        </div>

        {/* Sidebar Stats footer */}
        <div className="mt-auto pt-6 border-t border-zinc-200/80 dark:border-white/10 space-y-3">
          {streakCurrent > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Flame size={16} className="text-amber-400" aria-hidden="true" />
              <span className="text-xs font-bold text-amber-400">{streakCurrent}-day streak</span>
              <span className="text-[10px] text-amber-500/60 ml-auto">🔥</span>
            </div>
          )}

          <div className="bg-zinc-100 dark:bg-black/40 rounded-2xl p-4 border border-zinc-200/60 dark:border-white/5">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Career Goal</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white truncate mb-3">{targetRole}</div>
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={readinessPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Career readiness">
              <motion.div initial={{ width: 0 }} animate={{ width: `${readinessPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gold" />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-bold text-zinc-500">
              <span>Readiness</span>
              <span className="text-gold">{readinessPercent}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Professional Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0B1120]/75 px-4 py-2 backdrop-blur-md sm:px-6 transition-all" role="banner">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 lg:hidden text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                onClick={() => setOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={open}
              >
                <Menu size={20} />
              </button>

              {/* CareerPilot Logo (Mobile / Tablet only) */}
              <Link to="/dashboard" className="flex lg:hidden items-center gap-2 select-none">
                <LogoIcon size="sm" />
                <span className="text-sm font-black text-zinc-900 dark:text-white leading-none tracking-tight">CareerPilot AI</span>
              </Link>

              {/* Breadcrumb Navigation (Desktop) */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-semibold select-none">
                <Link to="/dashboard" className="hover:text-gold transition-colors">Dashboard</Link>
                {breadcrumbItems.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <ChevronRight size={10} className="text-zinc-700" />
                    <Link to={item.path} className={`hover:text-gold transition-colors ${idx === breadcrumbItems.length - 1 ? 'text-zinc-700 dark:text-zinc-300 font-bold' : ''}`}>
                      {item.label}
                    </Link>
                  </span>
                ))}
              </div>

              {/* Current Page Title (Divider + Text for Tablet fallback) */}
              <div className="hidden sm:flex xl:hidden items-center gap-2 select-none">
                <span className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                <h1 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] tracking-wide">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            {/* Global Search trigger input */}
            <div className="flex-1 max-w-md hidden md:block">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full relative flex items-center transition-all bg-slate-100 hover:bg-slate-200/80 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:border-slate-800 rounded-2xl pl-4 pr-3 py-2 text-zinc-500 text-left select-none"
              >
                <Search size={16} className="text-zinc-500 mr-2" />
                <span className="text-xs text-zinc-500">Search goals, jobs, roadmaps (Ctrl + K)...</span>
                <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
                  <kbd className="inline-flex items-center justify-center h-4.5 px-1.5 text-[9px] font-bold text-zinc-400 bg-white/10 rounded border border-white/10">⌘</kbd>
                  <kbd className="inline-flex items-center justify-center h-4.5 px-1.5 text-[9px] font-bold text-zinc-400 bg-white/10 rounded border border-white/10">K</kbd>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile search trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2.5 rounded-full text-zinc-600 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors"
                title="Search"
              >
                <Search size={18} />
              </button>

              {/* AI Assistant Shortcut Button */}
              <Link
                to="/chatbot"
                className="p-2.5 rounded-full text-zinc-600 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors"
                title="AI Chatbot Assistant"
              >
                <Sparkles size={18} />
              </Link>

              {/* Theme Selector Dropdown */}
              <div className="relative" ref={themeRef}>
                <button
                  onClick={() => setThemeOpen(!themeOpen)}
                  className="p-2.5 rounded-full text-zinc-600 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors focus:outline-none"
                  title="Theme Menu"
                >
                  {theme === 'dark' && <Moon size={18} />}
                  {theme === 'light' && <Sun size={18} />}
                  {theme === 'system' && <Laptop size={18} />}
                </button>
                <AnimatePresence>
                  {themeOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 min-w-[130px]">
                      {['light', 'dark', 'system'].map(t => (
                        <button key={t} onClick={() => { setTheme(t); setThemeOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize flex items-center gap-2 transition-colors ${theme === t ? 'text-gold bg-gold/10' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}>
                          {t === 'light' && <Sun size={13} />}
                          {t === 'dark' && <Moon size={13} />}
                          {t === 'system' && <Laptop size={13} />}
                          <span>{t}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications bell */}
              <button
                className="p-2.5 rounded-full text-zinc-600 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors relative"
                title="Notifications"
                onClick={() => setNotifOpen(true)}
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 rounded-full text-[9px] font-black text-white px-1 border-2 border-white dark:border-black" aria-hidden="true">
                    {notifCount}
                  </span>
                )}
              </button>

              {/* Settings shortcut button */}
              <Link
                to="/profile"
                className="p-2.5 rounded-full text-zinc-600 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors"
                title="Account Settings"
              >
                <Settings size={18} />
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all select-none"
                  role="button"
                  aria-expanded={dropdownOpen}
                >
                  <img src={user?.photoURL || user?.avatar} alt="" className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full object-cover ring-2 ring-gold/40 aspect-square shrink-0" />
                  <div className="hidden sm:block mr-1">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{user?.name}</div>
                    <div className="text-[10px] text-gold font-extrabold">{user?.role === 'admin' ? 'Admin' : 'Pro'}</div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.96 }}
                      className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900 p-4 shadow-2xl backdrop-blur-2xl z-50 text-left"
                    >
                      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-zinc-200 dark:border-white/5">
                        <img src={user?.photoURL || user?.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-gold/40" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-snug">{user?.name}</h4>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-gold dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-gold transition-all">
                          <Settings size={14} /> Account Settings
                        </Link>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-gold dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-gold transition-all">
                          <Shield size={14} /> Dashboard
                        </Link>
                        <Link to="/goals" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-gold dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-gold transition-all">
                          <Award size={14} /> Career Goals
                        </Link>
                        <div className="border-t border-zinc-200/80 dark:border-white/5 my-2" />
                        <button onClick={() => { setDropdownOpen(false); signOut(); }} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all text-left">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-20 relative" role="main">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gold/5 blur-[120px] pointer-events-none rounded-full" aria-hidden="true" />
          <div className="max-w-7xl mx-auto relative z-10">
            {children}

            {/* Premium Footer */}
            <footer className="mt-20 pt-8 border-t border-zinc-200/80 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left select-none">
              <div className="flex items-center gap-3">
                <LogoIcon size="sm" />
                <div>
                  <div className="text-xs font-black text-zinc-950 dark:text-white">CareerPilot AI</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">AI Career Operating System</div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">
                "सफलता की उड़ान"
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
