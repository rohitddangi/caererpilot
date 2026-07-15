import { motion } from 'framer-motion';

/**
 * ProgressBar — reusable animated horizontal progress bar.
 * Replaces inline progress bars used in 6+ dashboard components.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  height = 'h-2',
  color = 'from-gold to-champagne',
  trackColor = 'bg-white/5',
  glow = true,
  label,
  showPercent = false,
  animated = true,
  className = '',
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={className} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-gold">{percent}%</span>}
        </div>
      )}
      <div className={`${height} w-full ${trackColor} rounded-full overflow-hidden`}>
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${color} rounded-full ${glow ? 'shadow-[0_0_10px_rgba(214,168,58,0.4)]' : ''}`}
          />
        ) : (
          <div
            className={`h-full bg-gradient-to-r ${color} rounded-full ${glow ? 'shadow-[0_0_10px_rgba(214,168,58,0.4)]' : ''}`}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}
