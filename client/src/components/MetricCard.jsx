import { motion } from 'framer-motion';
import AnimatedCounter from './dashboard/AnimatedCounter.jsx';

/**
 * MetricCard — displays key stats with animation and indicator colors.
 * Upgraded with animated counter, percentChange metric, and unit suffixes.
 */
export default function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  trendValue,
  percentChange,
  suffix = '',
  accentColor = 'gold',
  delay = 0,
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  const accentMap = {
    gold:    { bg: 'bg-gold/10',    text: 'text-gold',    ring: 'ring-gold/30',    glow: 'shadow-[0_0_30px_rgba(214,168,58,0.15)]' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/30', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
    blue:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',    ring: 'ring-blue-500/30',    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
    amber:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',   ring: 'ring-amber-500/30',   glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
    purple:  { bg: 'bg-purple-500/10', text: 'text-purple-400',  ring: 'ring-purple-500/30',  glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]' },
  };
  
  const acc = accentMap[accentColor] || accentMap.gold;
  const trendUp = trendValue > 0 || (percentChange && parseFloat(percentChange) > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass rounded-3xl p-5 flex flex-col gap-3 ${acc.glow} transition-all duration-300 hover:border-gold/30`}
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${acc.bg} ring-1 ${acc.ring}`}>
          <Icon size={20} className={acc.text} />
        </div>
        
        {/* Trend / Percent change badge */}
        {(trendValue !== undefined || percentChange !== undefined) && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            trendUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {trendUp ? '↑' : '↓'} {percentChange ? `${Math.abs(parseFloat(percentChange))}%` : Math.abs(trendValue)}
          </span>
        )}
      </div>
      <div>
        <div className={`text-3xl font-black ${acc.text} tabular-nums flex items-baseline`}>
          <AnimatedCounter value={numericValue} suffix={suffix} />
        </div>
        <div className="mt-1 text-sm font-semibold text-white/80">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-zinc-500">{hint}</div>}
      </div>
    </motion.div>
  );
}
