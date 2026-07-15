import { useEffect, useState } from 'react';

/**
 * AnimatedCounter — renders a number that counts up from 0 to `value`.
 * Extracted from MetricCard for reuse across all dashboard stats.
 */
export default function AnimatedCounter({
  value = 0,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const [count, setCount] = useState(0);
  const target = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (target === 0) { setCount(0); return; }

    let start = 0;
    const totalSteps = Math.ceil(duration / 16);
    const step = target / totalSteps;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      start += step;
      if (frame >= totalSteps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.round(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, decimals]);

  const display = decimals > 0 ? count.toFixed(decimals) : count;

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
