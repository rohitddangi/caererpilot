import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Target, Sparkles, UserRoundCheck, Briefcase, GraduationCap,
  Medal, Brain, Flag, Terminal, History, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { courses, jobs, roadmapRoles } from '../../data/mockData.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const SEARCHABLE_ITEMS = [
  // Nav commands
  { title: 'Open Dashboard', type: 'Command', path: '/dashboard', desc: 'Go to command center and see system momentum', icon: Brain },
  { title: 'Open Skill Gap Analysis', type: 'Command', path: '/skill-gap', desc: 'Identify system gaps and calibration scores', icon: Sparkles },
  { title: 'Start Interview Prep', type: 'Command', path: '/interview', desc: 'Take a practice round and get instant ratings', icon: UserRoundCheck },
  { title: 'Launch AI Chatbot', type: 'Command', path: '/chatbot', desc: 'Chat with your digital twin career mentor', icon: Sparkles },
  { title: 'Browse Jobs & Internships', type: 'Command', path: '/jobs', desc: 'Find live matching opportunities', icon: Briefcase },
  { title: 'Explore Learning Hub', type: 'Command', path: '/learning', desc: 'Generate custom study plans and schedules', icon: GraduationCap },
  { title: 'Manage Credentials & Certificates', type: 'Command', path: '/certificates', desc: 'Upload and verify skills achievements', icon: Medal },
  { title: 'Track Analytics & Progress', type: 'Command', path: '/progress', desc: 'Review circular readiness indices and growth charts', icon: Brain },
  { title: 'Update Career Goals', type: 'Command', path: '/goals', desc: 'Calibrate role tracks, salary, and company targets', icon: Flag },

  // Roadmaps
  ...roadmapRoles.map(role => ({
    title: `${role} Roadmap`,
    type: 'Roadmap',
    path: '/roadmap',
    desc: `Intelligent milestone phases for ${role} track`,
    icon: Target
  })),

  // Courses / resources
  ...courses.map(c => ({
    title: c.title,
    type: 'Learning Resource',
    path: '/learning',
    desc: `[${c.level}] ${c.tech} ${c.type}`,
    icon: GraduationCap
  })),

  // Jobs
  ...jobs.map(j => ({
    title: `${j.title} at ${j.company}`,
    type: 'Job',
    path: '/jobs',
    desc: `${j.type} • Match Score: ${j.match}%`,
    icon: Briefcase
  })),

  // Pre-coded common questions / concepts
  { title: 'Solve 3 DSA Questions', type: 'Career Goal', path: '/goals', desc: 'Daily micro-goal checklist item', icon: Flag },
  { title: 'Complete React Hooks Module', type: 'Learning Resource', path: '/learning', desc: 'Advanced state and caching optimization', icon: GraduationCap },
  { title: 'Review AWS Cloud Practitioner', type: 'Certificate', path: '/certificates', desc: 'Verify certificate credential', icon: Medal },
  { title: 'System Design: Transaction Pools', type: 'Interview Question', path: '/interview', desc: 'PostgreSQL concurrency scaling topics', icon: UserRoundCheck }
];

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cp_search_history') || '[]');
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchableItems = useMemo(() => {
    const items = [...SEARCHABLE_ITEMS];

    if (user) {
      // Add custom user skills
      if (user.profile?.skills) {
        user.profile.skills.forEach(skill => {
          items.push({
            title: `Skill: ${skill}`,
            type: 'My Skill',
            path: '/skill-gap',
            desc: `Your active skill profile matching career signals`,
            icon: Sparkles
          });
        });
      }

      // Add target role tracking
      if (user.profile?.targetRole) {
        items.push({
          title: `Focus: ${user.profile.targetRole} track`,
          type: 'Target Role',
          path: '/goals',
          desc: `Current career target track with active indicators`,
          icon: Target
        });
      }

      // Add user projects
      if (user.profile?.projects) {
        user.profile.projects.forEach(proj => {
          items.push({
            title: proj.name || proj,
            type: 'My Project',
            path: '/profile',
            desc: `Dynamic project blueprint hosted on your profile`,
            icon: Terminal
          });
        });
      }

      // Add user certificates
      if (user.profile?.certifications) {
        user.profile.certifications.forEach(cert => {
          items.push({
            title: cert,
            type: 'My Certificate',
            path: '/certificates',
            desc: 'Verified professional badge in certificates locker',
            icon: Medal
          });
        });
      }
    }

    return items;
  }, [user]);

  const filtered = query.trim() === ''
    ? []
    : searchableItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item) => {
    // Add to history
    const nextHist = [item.title, ...history.filter(h => h !== item.title)].slice(0, 5);
    setHistory(nextHist);
    localStorage.setItem('cp_search_history', JSON.stringify(nextHist));

    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-gold font-bold bg-gold/10 px-0.5 rounded">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Search Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/5 px-4 py-3">
            <Search size={18} className="text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search goals, jobs, roadmaps, skills, commands..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 py-1"
            />
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
            {query.trim() === '' ? (
              <>
                {/* Recent Searches */}
                {history.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <History size={12} /> Recent Searches
                    </div>
                    <div className="space-y-0.5">
                      {history.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(h)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between group transition-all"
                        >
                          <span>{h}</span>
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-gold transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Overview */}
                <div>
                  <div className="px-3 py-1 text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Terminal size={12} /> Jump to Section
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {SEARCHABLE_ITEMS.filter(item => item.type === 'Command').map((cmd, i) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelect(cmd)}
                          className="text-left p-2.5 rounded-xl border border-zinc-100 dark:border-white/5 hover:border-gold/30 hover:bg-gold/5 flex items-center gap-2.5 group transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-400 group-hover:text-gold transition-colors">
                            <Icon size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{cmd.title}</div>
                            <div className="text-[9px] text-zinc-500 truncate max-w-[180px]">{cmd.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-zinc-500 mb-2">No results matching "{query}"</div>
                <div className="text-[10px] text-zinc-600">Try searching "Full Stack", "Docker", "DSA", or "Jobs"</div>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((item, idx) => {
                  const Icon = item.icon || Target;
                  const isSelected = idx === activeIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 border transition-all ${
                        isSelected
                          ? 'border-gold/30 bg-gold/10 text-zinc-900 dark:text-white'
                          : 'border-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-gold/20 text-gold' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold leading-tight truncate">{highlightText(item.title, query)}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isSelected ? 'border-gold/30 text-gold' : 'border-zinc-200 dark:border-white/10 text-zinc-500'
                          }`}>{item.type}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{highlightText(item.desc, query)}</div>
                      </div>
                      {isSelected && (
                        <div className="shrink-0 flex items-center gap-1 text-[9px] text-gold font-bold">
                          <span>Enter</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer keyboard shortcuts */}
          <div className="bg-zinc-100 dark:bg-black/40 border-t border-zinc-200 dark:border-white/5 px-4 py-2.5 flex items-center justify-between text-[10px] text-zinc-500 font-medium select-none">
            <div className="flex items-center gap-3">
              <span>Use <kbd className="bg-white/10 border border-white/10 px-1 rounded">↑↓</kbd> to navigate</span>
              <span>•</span>
              <span><kbd className="bg-white/10 border border-white/10 px-1 rounded">Enter</kbd> to select</span>
            </div>
            <span>Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
