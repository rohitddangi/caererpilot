import { motion } from 'framer-motion';

/**
 * SkeletonLoader — multi-variant loading skeleton.
 * Variants: card, metric, chart, list, timeline, default (profile).
 */

function ShimmerBar({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-zinc-800 ${className}`}>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
      />
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="glass rounded-3xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <ShimmerBar className="h-11 w-11 !rounded-2xl" />
        <ShimmerBar className="h-6 w-16 !rounded-full" />
      </div>
      <ShimmerBar className="h-8 w-20" />
      <ShimmerBar className="h-4 w-32" />
      <ShimmerBar className="h-3 w-24" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShimmerBar className="h-6 w-6 !rounded-lg" />
          <ShimmerBar className="h-5 w-36" />
        </div>
        <ShimmerBar className="h-6 w-20 !rounded-full" />
      </div>
      <ShimmerBar className="h-16 w-full !rounded-2xl" />
      <div className="space-y-2">
        <ShimmerBar className="h-4 w-full" />
        <ShimmerBar className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <ShimmerBar className="h-6 w-40" />
        <ShimmerBar className="h-5 w-20 !rounded-full" />
      </div>
      <div className="flex items-end gap-2 h-[200px]">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <ShimmerBar key={i} className="flex-1 !rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function ListSkeleton({ count = 3 }) {
  return (
    <div className="glass rounded-3xl p-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <ShimmerBar className="h-6 w-40" />
        <ShimmerBar className="h-5 w-16 !rounded-full" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <ShimmerBar className="h-8 w-8 !rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBar className="h-4 w-3/4" />
            <ShimmerBar className="h-3 w-1/2" />
          </div>
          <ShimmerBar className="h-5 w-16 !rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function TimelineSkeleton({ count = 4 }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <ShimmerBar className="h-6 w-40" />
        <ShimmerBar className="h-4 w-16" />
      </div>
      <div className="relative space-y-6">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-zinc-800" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="relative pl-12">
            <ShimmerBar className="absolute left-[7px] top-1 h-5 w-5 !rounded-full" />
            <div className="p-3 rounded-2xl bg-white/[0.02] space-y-2">
              <ShimmerBar className="h-4 w-full" />
              <ShimmerBar className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 p-6 bg-white/[0.02] border border-white/[0.08] rounded-[2rem] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <ShimmerBar className="w-16 h-16 !rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5">
          <ShimmerBar className="h-4 w-1/3" />
          <ShimmerBar className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3 pt-5 border-t border-white/5">
        {[1, 2, 3].map(i => (
          <ShimmerBar key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoader({ variant = 'default', count = 1 }) {
  const variants = {
    metric: MetricSkeleton,
    card: CardSkeleton,
    chart: ChartSkeleton,
    list: ListSkeleton,
    timeline: TimelineSkeleton,
    default: DefaultSkeleton,
  };

  const Component = variants[variant] || DefaultSkeleton;

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <Component key={i} count={3} />
        ))}
      </>
    );
  }

  return <Component count={3} />;
}
