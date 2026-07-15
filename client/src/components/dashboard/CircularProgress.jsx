import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter.jsx';

/**
 * CircularProgress — reusable SVG circular gauge with animation.
 * Extracted from HeroSection and JobReadinessMeter to avoid duplication.
 */
export default function CircularProgress({
  value = 0,
  size = 144,
  strokeWidth = 12,
  color = 'text-gold',
  trackColor = 'text-white/5',
  glowColor = 'rgba(214,168,58,0.4)',
  label,
  sublabel,
  className = '',
}) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        role="img"
        aria-label={`${label || 'Progress'}: ${value}%`}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackColor}
        />
        {/* Progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={color}
          style={{ filter: `drop-shadow(0 0 15px ${glowColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={value}
          className="text-4xl font-black text-white tabular-nums tracking-tighter"
        />
        {sublabel && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold mt-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
