import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Info, Flame, Calendar, Clock } from 'lucide-react';
import useDashboardData from '../../hooks/useDashboardData.js';
import useLiveTime from '../../hooks/useLiveTime.js';
import CircularProgress from './CircularProgress.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function HeroSection() {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { dateStr, timeStr } = useLiveTime();
  const {
    targetRole,
    readinessScore,
    readinessStatus,
    estimatedMonths,
    streakCurrent,
    motivationalMessage,
    breakdown,
    user
  } = useDashboardData();

  // Daily goal progress calculation
  const dailyGoalProgress = user?.xp ? Math.min(100, Math.round((user.xp % 60) / 60 * 100)) : 0;

  const statusConfig = {
    ready: { text: 'Job Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    improving: { text: 'Improving', color: 'text-gold', bg: 'bg-gold/20' },
    gap: { text: 'Skill Gap Detected', color: 'text-red-400', bg: 'bg-red-500/20' }
  };
  const status = statusConfig[readinessStatus] || statusConfig.improving;

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8 md:p-10 mb-6 border border-white/10 bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Score Ring */}
        <CircularProgress
          value={readinessScore}
          size={144}
          strokeWidth={10}
          color={readinessScore >= 75 ? 'text-emerald-400' : readinessScore >= 40 ? 'text-gold' : 'text-amber-500'}
          glowColor={readinessScore >= 75 ? 'rgba(52,211,153,0.3)' : 'rgba(214,168,58,0.3)'}
          label="Job Readiness"
          sublabel="Score"
        />

        {/* Content */}
        <div className="flex-1 text-center lg:text-left w-full">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-3">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt=""
                className="w-12 h-12 rounded-full border-2 border-gold/40 shadow-[0_0_10px_rgba(214,168,58,0.2)] flex-shrink-0 object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Welcome back, <span className="text-gold">{user?.name?.split(' ')[0] || 'Pilot'}</span> 👋
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${status.color} ${status.bg} border border-current/20`}>
                <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                {status.text}
              </span>
              
              {streakCurrent > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame size={12} className="mr-1 fill-current" /> {streakCurrent} Day Streak
                </span>
              )}
            </div>
          </div>

          {/* DateTime Banner */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-zinc-500 font-semibold mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-zinc-400"><Clock size={12} /> {timeStr}</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-8 mt-4 text-sm">
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold mb-1">Target Role</div>
              <div className="font-semibold text-white">{targetRole}</div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden lg:block" />
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold mb-1">Estimated Timeline</div>
              <div className="font-semibold text-white">{estimatedMonths} Month{estimatedMonths !== 1 ? 's' : ''}</div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden lg:block" />
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold mb-1">Daily Task Progress</div>
              <div className="flex items-center gap-2 mt-0.5">
                <ProgressBar
                  value={dailyGoalProgress}
                  height="h-1.5"
                  className="w-24 sm:w-32"
                  color="from-gold to-champagne"
                  glow={false}
                  animated={true}
                />
                <span className="text-xs font-bold text-gold">{dailyGoalProgress}%</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden lg:block" />
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none"
              aria-expanded={showBreakdown}
            >
              <span>{showBreakdown ? 'Hide Breakdown' : 'Show Score Breakdown'}</span>
              {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
 
          <div className="mt-6 flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 max-w-2xl">
            <Sparkles className="text-gold flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {motivationalMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Breakdown Panel */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-8 pt-6 border-t border-white/10 relative z-10"
          >
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Info size={16} className="text-gold" />
              Weight Calculation Formula (Total 100%)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {breakdown.map((item) => (
                <div key={item.label} className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-300">{item.label}</span>
                    <span className="text-gold">
                      {item.score}% <span className="text-[10px] text-zinc-500 font-normal">({item.weight}% weight)</span>
                    </span>
                  </div>
                  <ProgressBar
                    value={item.score}
                    height="h-1.5"
                    color="from-gold to-champagne"
                    glow={false}
                  />
                  <p className="text-[10px] text-zinc-500 leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
