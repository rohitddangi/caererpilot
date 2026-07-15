import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { 
  MessageSquare, Send, Sparkles, TrendingUp, Award, Briefcase, 
  Zap, Terminal, ShieldAlert, Search, Filter, ArrowUpDown, ChevronDown, 
  BookOpen, Star, AlertTriangle, Layers, ShieldCheck, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// Circular Progress Component
function CircularProgress({ value, label, subtitle, size = 110, strokeWidth = 7, glowColor = 'rgba(214, 168, 58, 0.3)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white/[0.01] border border-white/5 shadow-inner">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D76E" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-neutral-800 fill-none"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none"
            stroke="url(#goldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">{value}%</span>
          <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-neutral-500 mt-0.5">{label}</span>
        </div>
      </div>
      {subtitle && <p className="mt-2 text-[9px] font-black text-zinc-500 dark:text-neutral-400 uppercase tracking-wide">{subtitle}</p>}
    </div>
  );
}

export default function SkillGapDashboard({ activeSkillGap, xp, level, streak, onUpdate }) {
  const [messages, setMessages] = useState([
    {
      role: 'coach',
      content: `Hello! I am your AI Career Mentor. I've analyzed your skill gap for the ${activeSkillGap?.targetRole || 'Full Stack Developer'} role. Ask me anything about your current roadmap, missing skills, or interview preparation!`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Sorting & Filtering for Skill Match Matrix
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortKey, setSortKey] = useState('gap'); // gap, priority, difficulty
  const [sortOrder, setSortOrder] = useState('desc');

  // Keep chat container scrolled to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scores = activeSkillGap?.overallScores || {
    skillMatch: 68,
    projectMatch: 55,
    resumeMatch: 82,
    certificationMatch: 45,
    interviewMatch: 64,
    readiness: 58,
    hiringProbability: 'Medium-High',
    salaryPotential: '₹8 – ₹15 LPA'
  };

  const meters = activeSkillGap?.readinessMeters || {
    internship: 65,
    placement: 58,
    dsa: 72,
    core: 68,
    projects: 55,
    communication: 80
  };

  const categories = activeSkillGap?.categories || [];

  // Mapped list of skills for the Match Matrix table
  const allSkills = categories.flatMap(cat => 
    cat.skills.map(sk => ({
      name: sk.name,
      category: cat.name,
      strength: sk.strength || 0,
      confidence: sk.confidence || 0,
      relevance: sk.relevance || 'High',
      level: sk.level || 'Beginner',
      requiredLevel: sk.relevance === 'Very High' ? 85 : (sk.relevance === 'High' ? 70 : 50)
    }))
  );

  // Compute overall match score grid properties
  const scoreMetrics = [
    { label: 'Overall Score', val: scores.skillMatch, sub: 'Global index' },
    { label: 'Technical Skills', val: Math.round((meters.dsa + meters.core) / 2), sub: 'Core Engineering' },
    { label: 'Programming', val: allSkills.find(s => s.name === 'JavaScript' || s.name === 'Python')?.strength || 80, sub: 'Syntax & logic' },
    { label: 'Development', val: scores.projectMatch, sub: 'Framework matches' },
    { label: 'Problem Solving', val: meters.dsa, sub: 'Algorithmic DSA' },
    { label: 'Soft Skills', val: meters.communication, sub: 'HR alignment' },
    { label: 'Interview Fit', val: scores.interviewMatch || 65, sub: 'Verbal Readiness' },
    { label: 'Project Readiness', val: meters.projects, sub: 'Verified repos' },
    { label: 'Resume Score', val: scores.resumeMatch, sub: 'ATS Keywords' }
  ];

  const gapAnalysis = activeSkillGap?.gapAnalysis || {};
  const missingSkills = gapAnalysis.missingSkills || [];
  const strongSkills = gapAnalysis.strongSkills || [];
  const weakSkills = gapAnalysis.weakSkills || [];
  const blockers = gapAnalysis.blockers || [];

  // AI Improvement Plan Tasks
  const improvementPlan = {
    dailyTasks: [
      'Implement strict TypeScript schemas inside the user registration module',
      'Solve 2 medium algorithmic database challenges (indexing) on LeetCode'
    ],
    weeklyGoals: [
      'Configure connection pooling triggers using PostgreSQL and Prisma schemas',
      'Build localized mini-chat endpoints validating Redis cache TTL lifetimes'
    ],
    monthlyTargets: [
      'Assemble complete real-time dashboard microservices deploying Docker containers',
      'Validate full mock system design checks with AI Career Coach'
    ],
    completionDate: 'September 2026'
  };

  // Learning Recommendations
  const learningRecommendations = [
    { title: 'TypeScript Deep Dive Guide', provider: 'TypeScript Official', type: 'Documentation', relevance: 'TypeScript Gaps' },
    { title: 'Docker Complete Orchestration', provider: 'Traversy Media', type: 'YouTube Playlist', relevance: 'DevOps Gaps' },
    { title: 'Prisma Relational Migrations Manual', provider: 'Prisma Guides', type: 'Docs', relevance: 'Database Gaps' },
    { title: 'Redis Cache Strategies', provider: 'Redis University', type: 'Course', relevance: 'Caching Gaps' }
  ];

  // recommended projects
  const recommendedProjects = activeSkillGap?.projectGap?.missingProjects || [
    { name: 'SaaS Real-time Analytics Engine', tech: 'Next.js, Recharts, Redis, PostgreSQL', description: 'Interactive dashboard showing active users via WebSockets, connection pools, and Redis expire keys.', difficulty: 'Advanced', time: '20 hrs', value: 'High', ready: 'Yes', impact: 'Resume Star' }
  ];

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatLoading(true);

    try {
      const { data } = await api.post('/skillgap/coach-chat', { message: userText });
      setMessages(prev => [...prev, { role: 'coach', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'coach', content: "I'm having trouble matching your profile details right now. Complete a verification test or submit a repo link to continue." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Filtered skills list
  const filteredSkills = allSkills.filter(sk => {
    const matchesSearch = sk.name.toLowerCase().includes(searchQuery.toLowerCase()) || sk.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || sk.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorted skills list
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    
    if (sortKey === 'gap') {
      aVal = Math.max(0, a.requiredLevel - a.strength);
      bVal = Math.max(0, b.requiredLevel - b.strength);
    } else if (sortKey === 'strength') {
      aVal = a.strength;
      bVal = b.strength;
    } else if (sortKey === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const multiRole = activeSkillGap?.multiRoleMatch || [
    { role: 'Software Engineer', score: 72 },
    { role: 'Frontend Developer', score: 85 },
    { role: 'Backend Developer', score: 58 },
    { role: 'Full Stack Developer', score: 68 },
    { role: 'AI Engineer', score: 32 }
  ];

  const isDark = !document.documentElement.classList.contains('light');
  const tickColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      
      {/* ─── LEFT COLUMN: Metrics & Match Matrices ─── */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Animated Score indices grid */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-gold animate-pulse" />
            AI Overall Skill Match Scorecard
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {scoreMetrics.slice(0, 9).map((m, idx) => (
              <CircularProgress 
                key={idx} 
                value={m.val} 
                label={m.label} 
                subtitle={m.sub} 
                size={85} 
                strokeWidth={5} 
              />
            ))}
          </div>
        </div>

        {/* Skill Match Matrix Table */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-gold" />
              Interactive Skill Match Matrix
            </h3>
            
            {/* Search & filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={12} className="absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[38px] bg-slate-50 border border-slate-200 text-zinc-900 placeholder:text-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-zinc-500 rounded-xl pl-8 pr-3 text-[11px] focus:outline-none focus:border-gold/50"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="min-h-[38px] bg-slate-50 border border-slate-200 text-zinc-900 dark:bg-zinc-900 dark:border-white/10 rounded-xl px-3 text-[11px] dark:text-white focus:outline-none focus:border-gold/50"
              >
                <option value="All">All Categories</option>
                {Array.from(new Set(allSkills.map(s => s.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix table (Desktop View) */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-white/5 rounded-2xl">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 dark:border-white/5 select-none">
                  <th className="p-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => toggleSort('name')}>Skill</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => toggleSort('strength')}>Current</th>
                  <th className="p-3.5">Required</th>
                  <th className="p-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => toggleSort('gap')}>Gap %</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {sortedSkills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-zinc-500 italic">No matching skill metrics found.</td>
                  </tr>
                ) : (
                  sortedSkills.map((sk) => {
                    const gap = Math.max(0, sk.requiredLevel - sk.strength);
                    return (
                      <tr key={sk.name} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all">
                        <td className="p-3.5 font-bold text-zinc-900 dark:text-white">{sk.name}</td>
                        <td className="p-3.5 text-zinc-500 dark:text-zinc-400">{sk.category}</td>
                        <td className="p-3.5">
                          <span className="text-zinc-800 dark:text-zinc-300 font-bold">{sk.strength}%</span>
                          <span className="text-[9px] text-zinc-500 ml-1.5">({sk.level})</span>
                        </td>
                        <td className="p-3.5 text-zinc-500 dark:text-zinc-400">{sk.requiredLevel}%</td>
                        <td className="p-3.5 font-bold">
                          {gap > 0 ? (
                            <span className="text-red-500 dark:text-red-400">{gap}% deficient</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">Match met</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            gap === 0 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : (gap >= 40 ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20')
                          }`}>
                            {gap === 0 ? 'Verified' : (gap >= 40 ? 'Critical' : 'Pending')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Hidden on Desktop) */}
          <div className="block md:hidden space-y-3">
            {sortedSkills.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 italic">No matching skill metrics found.</div>
            ) : (
              sortedSkills.map((sk) => {
                const gap = Math.max(0, sk.requiredLevel - sk.strength);
                return (
                  <div key={sk.name} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-xs">{sk.name}</h4>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{sk.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        gap === 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : (gap >= 40 ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20')
                      }`}>
                        {gap === 0 ? 'Verified' : (gap >= 40 ? 'Critical' : 'Pending')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px]">
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block">Current</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{sk.strength}% ({sk.level})</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block">Required</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{sk.requiredLevel}%</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block">Gap</span>
                        <span className={`font-bold ${gap > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {gap > 0 ? `${gap}%` : 'Match met'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Missing Skills by Category */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
            Categorized Missing Skills Gaps
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((cat) => {
              // Find matching missing skills
              const missing = missingSkills.filter(ms => 
                cat.skills.find(s => s.name.toLowerCase().includes(ms.name.toLowerCase()) || ms.name.toLowerCase().includes(s.name.toLowerCase()))
              );

              return (
                <div key={cat.name} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">{cat.name}</span>
                  {missing.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic block">No missing skills in this category!</span>
                  ) : (
                    <div className="space-y-2">
                      {missing.map((ms) => (
                        <div key={ms.name} className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white">{ms.name}</span>
                            <span className="text-[9px] text-zinc-500 mt-0.5 block">Learning: {ms.time} • Difficulty: {ms.difficulty}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            ms.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gold/10 text-gold border border-gold/20'
                          }`}>
                            {ms.priority} Priority
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Strongest vs Weakest Skills highlight panel */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Strongest Skills */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
              Verified Core Strengths
            </h3>
            <div className="space-y-3">
              {strongSkills.map((sk) => (
                <div key={sk.name} className="p-3.5 rounded-2xl bg-emerald-500/[0.01] border border-emerald-500/15 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{sk.name}</span>
                    <span className="text-emerald-400 font-bold">{sk.strength}% Strength</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-normal">
                    Suggested topics: Complete advanced optimizations. Tracing placements looks highly recommended.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weakest Skills */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
              Key Stack Deficiencies
            </h3>
            <div className="space-y-3">
              {weakSkills.map((sk) => (
                <div key={sk.name} className="p-3.5 rounded-2xl bg-red-500/[0.01] border border-red-500/15 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{sk.name}</span>
                    <span className="text-red-400 font-bold">{sk.strength}% Score</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-normal">
                    Required target: 80%+. Complete verification quizzes and link validated GitHub repositories.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Actionable Improvement Plan */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-gold animate-bounce" />
            AI Actionable Improvement Plan
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Daily */}
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] font-black text-gold uppercase tracking-wider block">Daily Tasks</span>
              <ul className="space-y-2">
                {improvementPlan.dailyTasks.map((t, idx) => (
                  <li key={idx} className="text-[10px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                    <span className="text-gold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Weekly */}
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider block">Weekly Goals</span>
              <ul className="space-y-2">
                {improvementPlan.weeklyGoals.map((t, idx) => (
                  <li key={idx} className="text-[10px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                    <span className="text-sky-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Monthly */}
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">Monthly Targets</span>
              <ul className="space-y-2">
                {improvementPlan.monthlyTargets.map((t, idx) => (
                  <li key={idx} className="text-[10px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                    <span className="text-purple-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* ─── RIGHT COLUMN: Compatibility Charts & AI Coach ─── */}
      <div className="space-y-6">
        
        {/* Cross-Role Compatibility Radar & List */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-gold" />
            Cross-Role Compatibility Analysis
          </h3>
          
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={multiRole}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="role" tick={{ fill: tickColor, fontSize: 8 }} />
                <Radar name="Compatibility" dataKey="score" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-2 text-xs">
            {multiRole.slice(0, 5).map((role) => (
              <div key={role.role} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="text-zinc-300 font-semibold">{role.role}</span>
                <span className="text-gold font-bold">{role.score}% Match</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Learning & Project Recommendations */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-gold" />
            Closing Skill Gaps Recommendations
          </h3>
          <div className="space-y-3">
            {/* Project suggested */}
            <div className="p-3.5 rounded-2xl bg-gold/5 border border-gold/15 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase text-gold">
                <span>Capstone project suggestion</span>
                <span>{recommendedProjects[0]?.difficulty || 'Advanced'}</span>
              </div>
              <h4 className="font-bold text-white text-xs">{recommendedProjects[0]?.name}</h4>
              <p className="text-[10px] text-zinc-400 leading-normal">{recommendedProjects[0]?.description}</p>
            </div>

            {/* Courses list */}
            {learningRecommendations.map((res) => (
              <div key={res.title} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white leading-tight block">{res.title}</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">{res.provider}</span>
                </div>
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/25 shrink-0 ml-2">
                  {res.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Career Coach Chat Panel */}
        <div className="glass-panel rounded-3xl bg-black/40 border border-gold/10 p-6 flex flex-col h-[400px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-gold/20">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI Mentor Coach
              </h3>
              <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Active Coach Session
              </span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-gold to-yellow-600 text-black font-semibold rounded-br-none shadow-md shadow-gold/5'
                      : 'bg-white/5 text-neutral-200 border border-white/5 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-neutral-400 border border-white/5 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 animate-spin text-gold" />
                  Coach analyzing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your coach anything..."
              disabled={chatLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-gold to-yellow-600 text-black hover:opacity-90 disabled:opacity-50 transition-all h-8 w-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
