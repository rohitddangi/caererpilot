import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

/**
 * WidgetShell — reusable card wrapper providing consistent:
 * - Glass card styling with header (icon + title + badge)
 * - Loading skeleton state
 * - Error state with retry button
 * - Empty state with message
 * - Optional footer
 * - Framer Motion entrance animation
 */
export default function WidgetShell({
  title,
  icon: Icon,
  badge,
  badgeColor = 'gold',
  loading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyMessage = 'No data available yet.',
  emptyIcon: EmptyIcon = Inbox,
  footer,
  headerRight,
  children,
  className = '',
  delay = 0,
}) {
  const badgeColors = {
    gold: 'bg-gold/10 text-gold border-gold/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`glass rounded-3xl p-6 h-full flex flex-col ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            {Icon && <Icon className="text-gold" size={24} aria-hidden="true" />}
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColors[badgeColor] || badgeColors.gold}`}>
                {badge}
              </span>
            )}
            {headerRight}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex flex-col gap-4" role="status" aria-label="Loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4">
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-2/3 shimmer" />
                <div className="h-3 bg-white/10 rounded w-1/2 shimmer" />
                <div className="h-8 bg-white/10 rounded w-full shimmer" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading content...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Something went wrong</p>
          <p className="text-xs text-zinc-500 mb-4 max-w-xs">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 text-xs font-bold text-gold hover:text-white bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-xl border border-gold/20 transition-all"
              aria-label="Retry loading"
            >
              <RefreshCw size={12} />
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <EmptyIcon size={24} className="text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">{emptyMessage}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && !isEmpty && (
        <div className="flex-1 flex flex-col">{children}</div>
      )}

      {/* Footer */}
      {footer && !loading && (
        <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] text-zinc-500 font-semibold">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
