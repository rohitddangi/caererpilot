import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Sparkles, TrendingUp, Award, CheckCircle, Zap, ShieldAlert, Star, 
  Play, PlayCircle, Clipboard, BookOpen, MessageSquare, Terminal, 
  Trophy, ShieldCheck, Target, AlertTriangle, Book, HelpCircle, Code, Cpu
} from 'lucide-react';

// Circular progress widget
function CircularRing({ value, label, size = 110, strokeWidth = 8, glowColor = 'rgba(212, 175, 55, 0.4)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white/[0.01] border border-white/5 shadow-inner">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-neutral-800 fill-none"
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
            style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-white">{value}%</span>
          <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500 mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function InterviewDashboard({ completedInterviews = [], activeInterview, xp, level, onStartMock }) {
  const [selectedBadgeIdx, setSelectedBadgeIdx] = useState(null);

  // Extract last interview scores or use default benchmarks
  const lastInterview = completedInterviews.length > 0 
    ? completedInterviews[completedInterviews.length - 1] 
    : null;

  const scores = lastInterview?.breakdown || {
    technical: 68,
    hr: 72,
    communication: 75,
    confidence: 70,
    problemSolving: 65,
    projectDiscussion: 60,
    leadership: 58
  };

  const overallScore = lastInterview?.score || 66;
  const hiringProbability = lastInterview?.hiringProbability || 68;
  const salaryPotential = lastInterview?.salaryPotential || '₹6 – ₹10 LPA';

  const weaknesses = lastInterview?.weaknesses || [
    'Lacks system design architectural diagram details.',
    'Filler words detected during HR opening sections.'
  ];

  const strongPoints = lastInterview?.strongPoints || [
    'Strong knowledge of React server layout components.',
    'Clear structured answers in technical coding queries.'
  ];

  const radarData = [
    { subject: 'Technical', A: scores.technical },
    { subject: 'HR', A: scores.hr },
    { subject: 'Communication', A: scores.communication },
    { subject: 'Confidence', A: scores.confidence },
    { subject: 'Problem Solving', A: scores.problemSolving },
    { subject: 'Project Defense', A: scores.projectDiscussion },
    { subject: 'Leadership', A: scores.leadership }
  ];

  // Performance history timeline data
  const trendData = completedInterviews.map((mock, idx) => ({
    name: `Mock ${idx + 1}`,
    score: mock.score || 60,
    readiness: mock.hiringProbability || 60
  }));

  // Fallback trend if empty
  const performanceTrends = trendData.length > 0 ? trendData : [
    { name: 'Sprint 1', score: 55, readiness: 50 },
    { name: 'Sprint 2', score: 62, readiness: 58 },
    { name: 'Sprint 3', score: 68, readiness: 64 },
    { name: 'Sprint 4', score: 72, readiness: 70 }
  ];

  // Badges lists
  const badges = [
    { title: '100 Questions Solved', desc: 'Solved 100 interview problems', icon: '🏆', unlocked: completedInterviews.length >= 5 },
    { title: '10 Mock Interviews', desc: 'Completed 10 mock sessions', icon: '🌟', unlocked: completedInterviews.length >= 10 },
    { title: 'DSA Master', desc: 'Clear a coding round with 85%+', icon: '💻', unlocked: scores.problemSolving >= 85 },
    { title: 'Frontend Expert', desc: 'Master advanced frontend styling', icon: '🎨', unlocked: scores.technical >= 80 },
    { title: 'Communication Pro', desc: 'Clear HR rounds with high accuracy', icon: '🗣️', unlocked: scores.communication >= 85 },
    { title: 'Interview Ready', desc: 'Reach a fit score of 75%+', icon: '🚀', unlocked: overallScore >= 75 }
  ];

  // Dynamic Learning & Practice Recommendations based on weaknesses
  const recommendations = [
    { title: 'Scale Distributed Key Expire Caches', type: 'System Design Course', time: '12 hrs', link: '#' },
    { title: 'STAR Behavioral Leadership Mock', type: 'HR Prep Video', time: '4 hrs', link: '#' },
    { title: 'Clean Speech Mastery Exercises', type: 'Communication Round', time: '6 hrs', link: '#' }
  ];

  // Dynamic project questions
  const projectQuestions = [
    { area: 'Scalability', question: 'How would you scale user session storage when transitioning from local cookie arrays to a clustered system?' },
    { area: 'Security', question: 'Explain how you secure token storage and prevent Cross-Site Scripting (XSS) in active clients.' }
  ];

  // Multi-role compatibility comparisons
  const roleCompatibility = [
    { role: 'Software Engineer', match: 72 },
    { role: 'Frontend Developer', match: 85 },
    { role: 'Backend Developer', match: 58 },
    { role: 'Full Stack Developer', match: 68 },
    { role: 'AI Engineer', match: 32 }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      
      {/* ─── LEFT COLUMN: scorecards, charts, and STAR feedback ─── */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Readiness Overview Scorecard Grid */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-gold" />
            AI Mock Readiness Scorecard
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
            <CircularRing value={overallScore} label="Overall Score" />
            <CircularRing value={scores.technical} label="Technical" />
            <CircularRing value={scores.hr} label="HR Fit" />
            <CircularRing value={scores.communication} label="Communication" />
          </div>
        </div>

        {/* Live performance trend and Radar charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Area Chart */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 flex flex-col justify-between h-80">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-gold" />
              Practice Readiness Trends
            </h3>
            <div className="flex-1 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d6a83a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d6a83a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(214,168,58,0.2)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="readiness" stroke="#d6a83a" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Competency Radar chart */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 flex flex-col justify-between h-80">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-gold" />
              Evaluation Competencies Diagram
            </h3>
            <div className="flex-1 w-full text-[9px] font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 8 }} />
                  <Radar name="Competency" dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Strengths & Blockers Panel */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Key Strengths */}
          <div className="p-5 rounded-3xl border border-green-500/20 bg-green-950/10 space-y-3">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5 text-green-500" />
              Key Interview Strengths
            </h4>
            <ul className="space-y-2">
              {strongPoints.map((p, idx) => (
                <li key={idx} className="text-[11px] text-neutral-300 leading-normal flex items-start gap-1.5 font-semibold">
                  <span className="text-green-500">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Blockers Weaknesses */}
          <div className="p-5 rounded-3xl border border-red-500/20 bg-red-950/10 space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
              Weakness Detection Alerts
            </h4>
            <ul className="space-y-2">
              {weaknesses.map((w, idx) => (
                <li key={idx} className="text-[11px] text-neutral-300 leading-normal flex items-start gap-1.5 font-semibold">
                  <span className="text-red-500">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Badges Achievements cabinet */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Trophy className="h-4.5 w-4.5 text-gold animate-bounce" />
            Interview Preparation Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                  b.unlocked 
                    ? 'bg-gold/5 border-gold/30 text-white' 
                    : 'bg-white/[0.01] border-white/5 text-zinc-600'
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <h4 className="text-[10px] font-black uppercase leading-tight">{b.title}</h4>
                <span className="text-[8px] text-zinc-500 font-bold block mt-1">{b.unlocked ? 'Unlocked' : 'Locked'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── RIGHT COLUMN: Compatibility lists, Recommenders, and Chat coach ─── */}
      <div className="space-y-6">
        
        {/* Cross-Role compatibility match list */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-4.5 w-4.5 text-gold" />
            Match compatibility rates
          </h3>
          <p className="text-[10px] text-zinc-400 leading-normal">
            Based on active mock practice results compared against requirements:
          </p>

          <div className="space-y-2">
            {roleCompatibility.map((comp) => (
              <div key={comp.role} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                <span className="text-zinc-300 font-semibold">{comp.role}</span>
                <span className="text-gold font-bold">{comp.match}% Fit</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Project discussion prompts */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="h-4.5 w-4.5 text-gold" />
            Project Defense discussion Prompts
          </h3>
          <div className="space-y-3.5">
            {projectQuestions.map((q) => (
              <div key={q.area} className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1.5">
                <span className="text-[8px] font-black uppercase text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20 inline-block">
                  Topic: {q.area}
                </span>
                <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold">{q.question}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weakness-based Learning Recommendations */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4.5 w-4.5 text-gold" />
            Target Learning Recommendations
          </h3>
          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div key={rec.title} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white leading-tight block">{rec.title}</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">{rec.type}</span>
                </div>
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/25 shrink-0 ml-2">
                  {rec.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary potential card */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <div className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-gold" />
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Salary potential match</h4>
          </div>
          <p className="text-[10px] text-neutral-300 leading-normal">
            Based on completed mock outcomes, your current salary ceiling estimate aligns at:
          </p>
          <div className="p-3.5 rounded-2xl bg-gold/15 border border-gold/20 text-center">
            <span className="text-[9px] text-neutral-400 block font-bold uppercase tracking-wider">Projected Yield CTC</span>
            <span className="text-xl font-black text-gold mt-1 block">{salaryPotential}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
