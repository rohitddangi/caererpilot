import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, Trash2, ShieldAlert, Sparkles, Medal,
  Briefcase, Target, BookOpen, Clock, Calendar, CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_NOTIFS = [
  { id: 'n1', title: 'Roadmap Updated', message: 'Your Full Stack Developer roadmap was successfully updated with Next.js App Router tasks.', type: 'roadmap', time: '10m ago', read: false, icon: Target, color: '#3B82F6' },
  { id: 'n2', title: 'New Job Matching Profile', message: 'Vercel just posted a React & Frontend Intern role matching your skills.', type: 'job', time: '1h ago', read: false, icon: Briefcase, color: '#10B981' },
  { id: 'n3', title: 'Interview Reminder', message: 'AI Technical Mock Interview session scheduled for tomorrow morning.', type: 'interview', time: '2h ago', read: false, icon: Clock, color: '#F59E0B' },
  { id: 'n4', title: 'Goal Completed! 🎉', message: 'You have achieved your today\'s focus goal checklist item.', type: 'goal', time: '4h ago', read: true, icon: CheckSquare, color: '#D4AF37' },
  { id: 'n5', title: 'AI Recommendation Triggered', message: 'Gemini recommends bridging system design caching gaps to unlock FAANG jobs.', type: 'ai', time: '1d ago', read: true, icon: Sparkles, color: '#8B5CF6' },
];

export default function NotificationDrawer({ isOpen, onClose, onCountChange }) {
  const [list, setList] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_notifications');
      return saved ? JSON.parse(saved) : MOCK_NOTIFS;
    } catch {
      return MOCK_NOTIFS;
    }
  });
  const [filter, setFilter] = useState('all'); // all, unread
  const [search, setSearch] = useState('');

  // Sync count back to header badge
  const unreadCount = list.filter(n => !n.read).length;
  useEffect(() => {
    if (onCountChange) onCountChange(unreadCount);
    localStorage.setItem('cp_notifications', JSON.stringify(list));
  }, [list, unreadCount, onCountChange]);

  const markAllRead = () => {
    setList(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const toggleRead = (id) => {
    setList(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotif = (id) => {
    setList(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setList([]);
    toast.success('All notifications cleared');
  };

  const filtered = list
    .filter(n => filter === 'all' ? true : !n.read)
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
    );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-white/10 flex flex-col h-full shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-gold" />
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Filters and Search Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-white/5 space-y-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-slate-50 border border-slate-200 text-zinc-900 placeholder:text-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-zinc-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold/50"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {['all', 'unread'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                      filter === f ? 'border-gold text-gold bg-gold/10' : 'border-slate-200 dark:border-white/5 text-zinc-500 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {list.length > 0 && (
                <div className="flex gap-3 text-[10px]">
                  <button onClick={markAllRead} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors">Mark all read</button>
                  <span className="text-zinc-700">|</span>
                  <button onClick={clearAll} className="text-red-500 hover:text-red-400 font-semibold transition-colors">Clear all</button>
                </div>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="mx-auto text-zinc-400 dark:text-zinc-600 mb-3" size={24} />
                <div className="text-zinc-500 text-xs font-bold">No notifications found</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">You are all caught up!</div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map(notif => {
                  const Icon = notif.icon || Bell;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-2xl border transition-all relative group flex gap-3 ${
                        notif.read
                          ? 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5'
                          : 'bg-gold/[0.02] border-gold/20'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl self-start" style={{ backgroundColor: `${notif.color || '#d6a83a'}15` }}>
                        <Icon size={16} style={{ color: notif.color || '#d6a83a' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold ${notif.read ? 'text-zinc-500 dark:text-zinc-300' : 'text-zinc-900 dark:text-white'}`}>{notif.title}</h4>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal mt-1">{notif.message}</p>
                      </div>

                      {/* Hover action icons */}
                      <div className="absolute right-3 bottom-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleRead(notif.id)}
                          className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title={notif.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          <Check size={10} className={notif.read ? 'text-zinc-400 dark:text-zinc-500' : 'text-emerald-500 dark:text-emerald-400'} />
                        </button>
                        <button
                          onClick={() => deleteNotif(notif.id)}
                          className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
