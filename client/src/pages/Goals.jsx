import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Target, Calendar, TrendingUp, Zap, CheckCircle2, ChevronRight,
  Activity, Star, Sparkles, Plus, Search, Filter, SortAsc, MoreHorizontal,
  Award, Clock, Building, BarChart3, AlertCircle, Pause, Play, Copy,
  Trash2, Edit3, X, ChevronDown, Briefcase, Code, Globe, Layers,
  Cloud, BookOpen, Users, ArrowUpRight, Circle, CheckCircle, XCircle,
  Timer, Flame, LayoutGrid, List, Eye, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../services/api.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Engineering', 'Data Science', 'Design', 'Projects', 'Certifications', 'Career', 'Learning', 'Practice', 'General'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];
const STATUSES = ['not_started', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
const WORK_TYPES = ['any', 'remote', 'hybrid', 'onsite'];
const ICON_MAP = { target: Target, code: Code, globe: Globe, layers: Layers, cloud: Cloud, briefcase: Briefcase, book: BookOpen, star: Star, award: Award, users: Users, flame: Flame, zap: Zap, activity: Activity };
const COLORS = ['#D4AF37', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
const STATUS_LABELS = { not_started: 'Not Started', planning: 'Planning', in_progress: 'In Progress', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_COLORS = { not_started: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', planning: 'text-blue-400 bg-blue-500/10 border-blue-500/20', in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20', on_hold: 'text-orange-400 bg-orange-500/10 border-orange-500/20', completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cancelled: 'text-red-400 bg-red-500/10 border-red-500/20' };
const PRIORITY_COLORS = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-zinc-400' };
const PRIORITY_DOTS = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-zinc-500' };
const SORT_OPTIONS = [{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'deadline', label: 'Deadline' }, { value: 'priority', label: 'Priority' }, { value: 'completion', label: 'Completion %' }, { value: 'alphabetical', label: 'A → Z' }];

const EMPTY_FORM = { title: '', description: '', category: 'General', priority: 'medium', difficulty: 'intermediate', targetCompany: '', targetRole: '', deadline: '', estimatedHours: '', currentSkillLevel: 3, targetSkillLevel: 7, expectedSalary: '', location: '', workType: 'any', color: '#D4AF37', icon: 'target', reminder: false };

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function GoalSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-2 bg-white/5 rounded w-1/2 mt-3" />
        </div>
      </div>
    </div>
  );
}

// ─── GOAL CARD ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, onDelete, onDuplicate, onStatusChange, onProgressChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const IconComp = ICON_MAP[goal.icon] || Target;
  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && goal.status !== 'completed' && goal.status !== 'cancelled';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-2xl p-5 border transition-all hover:border-gold/30 group relative ${isOverdue ? 'border-red-500/30' : 'border-white/5'}`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: `${goal.color}20` }}>
          <IconComp size={18} style={{ color: goal.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-bold leading-tight ${goal.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>
              {goal.title}
            </h4>
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[goal.status]}`}>
              {STATUS_LABELS[goal.status]}
            </span>
          </div>
          {goal.description && (
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-8 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[160px]">
                  <button onClick={() => { onEdit(goal); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 flex items-center gap-2"><Edit3 size={13} /> Edit Goal</button>
                  <button onClick={() => { onDuplicate(goal.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 flex items-center gap-2"><Copy size={13} /> Duplicate</button>
                  {goal.status !== 'completed' && <button onClick={() => { onStatusChange(goal.id, 'completed'); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-white/5 flex items-center gap-2"><CheckCircle size={13} /> Complete</button>}
                  {goal.status === 'in_progress' && <button onClick={() => { onStatusChange(goal.id, 'on_hold'); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-orange-400 hover:bg-white/5 flex items-center gap-2"><Pause size={13} /> Pause</button>}
                  {goal.status === 'on_hold' && <button onClick={() => { onStatusChange(goal.id, 'in_progress'); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2"><Play size={13} /> Resume</button>}
                  {goal.status === 'not_started' && <button onClick={() => { onStatusChange(goal.id, 'in_progress'); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2"><Play size={13} /> Start</button>}
                  <hr className="border-white/5 my-1" />
                  <button onClick={() => { onDelete(goal.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"><Trash2 size={13} /> Delete</button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[goal.priority]}`} />
          <span className={`text-[9px] font-bold uppercase ${PRIORITY_COLORS[goal.priority]}`}>{goal.priority}</span>
        </div>
        {goal.category && goal.category !== 'General' && (
          <span className="text-[9px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{goal.category}</span>
        )}
        {goal.targetCompany && (
          <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-0.5"><Building size={9} /> {goal.targetCompany}</span>
        )}
        {goal.deadline && (
          <span className={`text-[9px] font-bold flex items-center gap-0.5 ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
            <Clock size={9} /> {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
          </span>
        )}
        {goal.estimatedHours > 0 && (
          <span className="text-[9px] font-bold text-zinc-500 flex items-center gap-0.5"><Timer size={9} /> {goal.estimatedHours}h</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Progress</span>
          <span className="text-[9px] font-extrabold text-gold">{goal.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${goal.color}, ${goal.color}88)` }}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress || 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        {/* Quick progress buttons */}
        {goal.status !== 'completed' && goal.status !== 'cancelled' && (
          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {[25, 50, 75, 100].map(v => (
              <button key={v} onClick={() => onProgressChange(goal.id, v)}
                className={`text-[8px] font-bold px-2 py-0.5 rounded-full border transition-all ${goal.progress >= v ? 'border-gold/30 text-gold bg-gold/10' : 'border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
              >{v}%</button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── CREATE/EDIT MODAL ────────────────────────────────────────────────────────
function GoalModal({ isOpen, onClose, onSave, editGoal }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editGoal) {
      setForm({ ...EMPTY_FORM, ...editGoal, estimatedHours: editGoal.estimatedHours || '' });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editGoal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Goal title is required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch { /* handled in parent */ } finally { setSaving(false); }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}
          className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-none"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-white/5 p-5 flex items-center justify-between rounded-t-3xl">
            <div>
              <h3 className="text-sm font-black text-white">{editGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">{editGoal ? 'Update your career goal' : 'Define a SMART career goal'}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Goal Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Complete DSA, Get Google Internship, Master React" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your goal in detail..." rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 resize-none transition-colors" />
            </div>

            {/* Category + Priority + Difficulty */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Priority</label>
                <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                  {PRIORITIES.map(p => <option key={p} value={p} className="bg-zinc-900">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Difficulty</label>
                <select value={form.difficulty} onChange={e => update('difficulty', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                  {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-zinc-900">{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Target Company + Role */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Target Company</label>
                <input value={form.targetCompany} onChange={e => update('targetCompany', e.target.value)} placeholder="e.g. Google, Microsoft"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Target Role</label>
                <input value={form.targetRole} onChange={e => update('targetRole', e.target.value)} placeholder="e.g. SDE, Data Scientist"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
            </div>

            {/* Deadline + Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Estimated Hours</label>
                <input type="number" value={form.estimatedHours} onChange={e => update('estimatedHours', parseInt(e.target.value) || '')} placeholder="e.g. 120"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
            </div>

            {/* Salary + Location + Work Type */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Expected Salary</label>
                <input value={form.expectedSalary} onChange={e => update('expectedSalary', e.target.value)} placeholder="₹12 LPA"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Location</label>
                <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="Bengaluru"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Work Type</label>
                <select value={form.workType} onChange={e => update('workType', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                  {WORK_TYPES.map(w => <option key={w} value={w} className="bg-zinc-900">{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Skill Level Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Current Skill Level: {form.currentSkillLevel}/10</label>
                <input type="range" min={1} max={10} value={form.currentSkillLevel} onChange={e => update('currentSkillLevel', parseInt(e.target.value))} className="w-full accent-gold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Target Skill Level: {form.targetSkillLevel}/10</label>
                <input type="range" min={1} max={10} value={form.targetSkillLevel} onChange={e => update('targetSkillLevel', parseInt(e.target.value))} className="w-full accent-gold" />
              </div>
            </div>

            {/* Color + Icon */}
            <div className="flex gap-4 items-end">
              <div className="space-y-1 flex-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => update('color', c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Icon</label>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(ICON_MAP).map(([key, Icon]) => (
                    <button key={key} type="button" onClick={() => update('icon', key)}
                      className={`p-1.5 rounded-lg border transition-all ${form.icon === key ? 'border-gold bg-gold/10 text-gold' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}>
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reminder toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reminder} onChange={e => update('reminder', e.target.checked)} className="accent-gold w-3.5 h-3.5" />
              <span className="text-xs text-zinc-400">Enable deadline reminders</span>
            </label>

            {/* Submit */}
            <button disabled={saving} type="submit" className="premium-button w-full py-3 text-xs font-bold mt-2">
              {saving ? 'Saving...' : editGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [todayGoals, setTodayGoals] = useState([]);
  const [todayCompleted, setTodayCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_today_goals_done') || '[]'); } catch { return []; }
  });
  const [score, setScore] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState('goals');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchGoals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      if (sortBy) params.set('sort', sortBy);
      const { data } = await api.get(`/goals?${params.toString()}`);
      setGoals(data);
    } catch { /* silent */ }
  }, [search, filterStatus, filterPriority, sortBy]);

  const fetchAll = useCallback(async () => {
    try {
      const [analyticsRes, scoreRes, predRes, todayRes] = await Promise.allSettled([
        api.get('/goals/analytics'),
        api.get('/goals/score'),
        api.get('/goals/prediction'),
        api.get('/goals/today'),
      ]);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data);
      if (predRes.status === 'fulfilled') setPrediction(predRes.value.data);
      if (todayRes.status === 'fulfilled') setTodayGoals(todayRes.value.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchGoals(), fetchAll()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) fetchGoals();
  }, [search, filterStatus, filterPriority, sortBy]);

  // ─── CRUD handlers ──────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    if (editGoal) {
      await api.put(`/goals/${editGoal.id}`, form);
      toast.success('Goal updated!');
    } else {
      await api.post('/goals', form);
      toast.success('Goal created!');
    }
    setEditGoal(null);
    fetchGoals();
    fetchAll();
  };

  const handleDelete = async (id) => {
    await api.delete(`/goals/${id}?hard=true`);
    toast.success('Goal deleted');
    fetchGoals();
    fetchAll();
  };

  const handleDuplicate = async (id) => {
    await api.post(`/goals/${id}/duplicate`);
    toast.success('Goal duplicated!');
    fetchGoals();
    fetchAll();
  };

  const handleStatusChange = async (id, status) => {
    await api.patch(`/goals/${id}/status`, { status });
    toast.success(`Goal ${status === 'completed' ? 'completed! 🎉' : 'updated'}`);
    fetchGoals();
    fetchAll();
  };

  const handleProgressChange = async (id, progress) => {
    await api.patch(`/goals/${id}/progress`, { progress });
    toast.success('Progress updated');
    fetchGoals();
    fetchAll();
  };

  const handleAIGenerate = async () => {
    setAiLoading(true);
    try {
      const { data: suggestions } = await api.post('/goals/ai-generate');
      for (const s of suggestions) {
        await api.post('/goals', { ...s, deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] });
      }
      toast.success(`${suggestions.length} AI goals generated! 🚀`);
      fetchGoals();
      fetchAll();
    } catch {
      toast.error('Failed to generate AI goals');
    } finally { setAiLoading(false); }
  };

  const toggleTodayDone = (index) => {
    const next = todayCompleted.includes(index) ? todayCompleted.filter(i => i !== index) : [...todayCompleted, index];
    setTodayCompleted(next);
    localStorage.setItem('cp_today_goals_done', JSON.stringify(next));
  };

  const openEdit = (goal) => { setEditGoal(goal); setModalOpen(true); };
  const openCreate = () => { setEditGoal(null); setModalOpen(true); };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 animate-pulse">
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="flex-1 h-20 bg-white/5 rounded-2xl" />)}
          </div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <GoalSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const overallReadiness = score?.overall || 72;
  const activeCount = analytics?.active || 0;
  const completedCount = analytics?.completed || 0;
  const totalCount = analytics?.total || 0;
  const completionRate = analytics?.completionRate || 0;

  const TABS = [
    { id: 'goals', label: 'All Goals', icon: LayoutGrid, count: totalCount },
    { id: 'today', label: "Today's Goals", icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <GoalModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditGoal(null); }} onSave={handleSave} editGoal={editGoal} />

      {/* ─── SCOREBOARD HEADER ─── */}
      <div className="glass-panel p-6 sm:p-7 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div>
              <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                AI Goal Management
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">Career Goal Command Center</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={openCreate} className="premium-button py-2.5 px-5 text-xs font-bold">
                <Plus size={13} /> New Goal
              </button>
              <button onClick={handleAIGenerate} disabled={aiLoading}
                className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50">
                <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} /> {aiLoading ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Goals', value: totalCount, icon: Target, color: 'text-gold' },
              { label: 'Active', value: activeCount, icon: Zap, color: 'text-amber-400' },
              { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Readiness', value: `${overallReadiness}%`, icon: TrendingUp, color: 'text-blue-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-black/30 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5"><stat.icon size={16} className={stat.color} /></div>
                <div>
                  <div className="text-lg font-black text-white">{stat.value}</div>
                  <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TAB NAV ─── */}
      <div className="flex border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${tab === t.id ? 'border-gold text-gold bg-gold/[0.02]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <t.icon size={14} />
              <span>{t.label}</span>
              {t.count !== undefined && <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB CONTENT ─── */}

      {/* ─── ALL GOALS TAB ─── */}
      {tab === 'goals' && (
        <div className="space-y-4">
          {/* Search + Filter + Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search goals..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${showFilters ? 'border-gold/30 text-gold bg-gold/10' : 'border-white/10 text-zinc-400 hover:border-white/20'}`}>
                <Filter size={13} /> Filters {(filterStatus || filterPriority) && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
              </button>
              <div className="relative">
                <button onClick={() => setShowSortMenu(!showSortMenu)}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:border-white/20 flex items-center gap-1.5 transition-all">
                  <SortAsc size={13} /> {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                </button>
                <AnimatePresence>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-11 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[160px]">
                        {SORT_OPTIONS.map(o => (
                          <button key={o.value} onClick={() => { setSortBy(o.value); setShowSortMenu(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${sortBy === o.value ? 'text-gold bg-gold/5' : 'text-zinc-400 hover:bg-white/5'}`}>
                            {sortBy === o.value && <CheckCircle2 size={12} />} {o.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-3 p-4 glass rounded-2xl border border-white/5">
                  <div className="space-y-1.5 w-full sm:w-auto">
                    <label className="text-[8px] font-black text-zinc-500 uppercase">Status</label>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setFilterStatus('')} className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${!filterStatus ? 'border-gold text-gold bg-gold/10' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}>All</button>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => setFilterStatus(s === filterStatus ? '' : s)}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${filterStatus === s ? 'border-gold text-gold bg-gold/10' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 w-full sm:w-auto">
                    <label className="text-[8px] font-black text-zinc-500 uppercase">Priority</label>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setFilterPriority('')} className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${!filterPriority ? 'border-gold text-gold bg-gold/10' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}>All</button>
                      {PRIORITIES.map(p => (
                        <button key={p} onClick={() => setFilterPriority(p === filterPriority ? '' : p)}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all capitalize ${filterPriority === p ? 'border-gold text-gold bg-gold/10' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(filterStatus || filterPriority) && (
                    <button onClick={() => { setFilterStatus(''); setFilterPriority(''); }} className="text-[9px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 self-end">
                      <X size={11} /> Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-12 border border-white/5 text-center">
              <div className="w-16 h-16 mx-auto bg-gold/10 rounded-2xl flex items-center justify-center mb-4">
                <Target size={28} className="text-gold" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">No Goals Yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">Create your first career goal or let AI generate personalized goals based on your profile.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={openCreate} className="premium-button py-2.5 px-6 text-xs font-bold"><Plus size={13} /> Create Goal</button>
                <button onClick={handleAIGenerate} disabled={aiLoading} className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5">
                  <Sparkles size={13} /> AI Generate
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {goals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} onEdit={openEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange} onProgressChange={handleProgressChange} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ─── TODAY'S GOALS TAB ─── */}
      {tab === 'today' && (
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                <h3 className="text-sm font-black text-white">Today's Focus Goals</h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-500">{todayCompleted.length}/{todayGoals.length} Done</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
              <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" animate={{ width: `${todayGoals.length ? (todayCompleted.length / todayGoals.length) * 100 : 0}%` }} />
            </div>
            <div className="space-y-3">
              {todayGoals.map((tg, i) => (
                <motion.div key={i} layout
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${todayCompleted.includes(i) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-gold/20'}`}
                  onClick={() => toggleTodayDone(i)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded-lg mt-0.5 transition-colors ${todayCompleted.includes(i) ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {todayCompleted.includes(i) ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${todayCompleted.includes(i) ? 'text-zinc-500 line-through' : 'text-white'}`}>{tg.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{tg.description}</div>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[9px] font-bold text-zinc-500"><Timer size={10} className="inline mr-0.5" />{tg.estimatedMinutes}m</span>
                        <span className={`text-[9px] font-bold capitalize ${PRIORITY_COLORS[tg.priority]}`}>{tg.priority}</span>
                        <span className="text-[9px] font-bold text-zinc-600 bg-white/5 px-1.5 rounded">{tg.category}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ANALYTICS TAB ─── */}
      {tab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Completion Rate Ring */}
          <div className="glass rounded-3xl p-8 border border-gold/20 bg-black/20 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent pointer-events-none" />
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" className="stroke-white/10" strokeWidth="6" fill="none" />
                <motion.circle cx="72" cy="72" r="62" className="stroke-gold" strokeWidth="6" fill="none" strokeLinecap="round"
                  initial={{ strokeDasharray: '0 390' }}
                  animate={{ strokeDasharray: `${completionRate * 3.9} 390` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{completionRate}%</span>
                <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Complete</span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Goal Completion Rate</h4>
            <p className="text-[10px] text-zinc-500 text-center mt-1">{completedCount} of {totalCount} goals completed</p>
          </div>

          {/* Status Breakdown */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-black/20 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><BarChart3 size={14} className="text-gold" /> Status Breakdown</h4>
            {analytics?.byStatus && Object.entries(analytics.byStatus).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">{STATUS_LABELS[key]}</span>
                  <span className="text-gold font-bold">{val}</span>
                </div>
                <ProgressBar value={totalCount ? (val / totalCount) * 100 : 0} height="h-1.5" color="from-gold to-yellow-500" />
              </div>
            ))}
          </div>

          {/* Priority Breakdown */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-black/20 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={14} className="text-gold" /> Priority Distribution</h4>
            {analytics?.byPriority && Object.entries(analytics.byPriority).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOTS[key]}`} />
                  <span className="text-xs font-bold text-zinc-300 capitalize">{key}</span>
                </div>
                <span className="text-sm font-black text-white">{val}</span>
              </div>
            ))}
          </div>

          {/* Readiness Score */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-black/20 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Award size={14} className="text-gold" /> Readiness Dimensions</h4>
            {score?.breakdown && Object.entries(score.breakdown).map(([key, item]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">{item.label} <span className="text-zinc-600">({item.weight}%)</span></span>
                  <span className="text-gold font-bold">{item.score}%</span>
                </div>
                <ProgressBar value={item.score} height="h-1.5" color="from-gold to-yellow-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TIMELINE TAB ─── */}
      {tab === 'timeline' && (
        <div className="grid xl:grid-cols-[1fr_380px] gap-6">
          {/* Goal Timeline */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-black/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-6">
              <Activity size={16} className="text-gold" /> Goal Timeline
            </h3>
            {goals.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">Create goals to see your timeline</p>
            ) : (
              <div className="relative pl-6 border-l border-white/10 space-y-6">
                {goals.map((goal, i) => {
                  const IconComp = ICON_MAP[goal.icon] || Target;
                  return (
                    <motion.div key={goal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-zinc-950"
                        style={{ backgroundColor: goal.status === 'completed' ? '#10B981' : goal.color }} />
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-all">
                        <div className="flex items-center gap-2">
                          <IconComp size={14} style={{ color: goal.color }} />
                          <span className={`text-xs font-bold ${goal.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>{goal.title}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[goal.status]}`}>{STATUS_LABELS[goal.status]}</span>
                        </div>
                        <div className="flex gap-3 mt-1.5 text-[9px] text-zinc-500 font-medium">
                          {goal.deadline && <span><Calendar size={9} className="inline mr-0.5" />{new Date(goal.deadline).toLocaleDateString()}</span>}
                          <span>{goal.progress}% done</span>
                          {goal.targetCompany && <span><Building size={9} className="inline mr-0.5" />{goal.targetCompany}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prediction sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6 border border-white/5 bg-black/20 space-y-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={16} className="text-blue-400" /> Career Projections
              </h3>
              <div className="relative pl-5 border-l border-white/10 space-y-6 text-xs">
                {[
                  { label: 'Internship Ready', date: prediction?.internshipDate || 'August 2026' },
                  { label: 'Campus Placement Ready', date: prediction?.placementDate || 'November 2026' },
                  { label: 'Professional Job Ready', date: prediction?.jobDate || 'January 2027', active: true },
                ].map((m, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${m.active ? 'bg-gold shadow-[0_0_10px_#D4AF37]' : 'bg-white/20'}`} />
                    <div className="font-bold text-white">{m.label}</div>
                    <div className="text-[10px] text-gold font-extrabold mt-0.5">{m.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Salary */}
            <div className="glass rounded-3xl p-6 border border-white/5 bg-black/20">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Salary Potential</h4>
              <div className="text-xl font-black text-green-400">{prediction?.expectedSalary?.average || '₹11.5 LPA'}</div>
              <div className="text-[10px] text-zinc-500 font-bold mt-1">({prediction?.expectedSalary?.min || '₹8 LPA'} – {prediction?.expectedSalary?.max || '₹15 LPA'})</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
