import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, TrendingDown, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import useApiWidget from '../../hooks/useApiWidget.js';
import CircularProgress from './CircularProgress.jsx';
import WidgetShell from './WidgetShell.jsx';

export default function JobReadinessMeter() {
  const navigate = useNavigate();

  const {
    data: readiness,
    loading,
    error,
    retry
  } = useApiWidget('/ai/job-readiness', {
    fallback: { readinessPercentage: 0, breakdown: {}, missingRequirements: [] }
  });

  const prob = readiness?.readinessPercentage || 0;

  // Compile dynamic factors
  const factors = [];
  if (readiness?.breakdown) {
    const { skills, projects, interview } = readiness.breakdown;
    
    factors.push({
      label: `Skills Alignment (${skills || 0}%)`,
      impact: (skills || 0) >= 70 ? 'positive' : 'negative'
    });
    factors.push({
      label: `Projects Portfolio (${projects || 0}%)`,
      impact: (projects || 0) >= 60 ? 'positive' : 'negative'
    });
    factors.push({
      label: `Mock Interview loops (${interview || 0}%)`,
      impact: (interview || 0) >= 70 ? 'positive' : 'negative'
    });
  }

  return (
    <WidgetShell
      title="Job Readiness Meter"
      icon={Briefcase}
      loading={loading}
      error={error}
      onRetry={retry}
      headerRight={
        <button
          onClick={retry}
          disabled={loading}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          aria-label="Recalibrate readiness factors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      }
      footer={
        <>
          <span>Data derived from standard hiring patterns.</span>
          <button 
            onClick={() => navigate('/command-center')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            Launch Cockpit <ArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
        <CircularProgress
          value={prob}
          size={120}
          strokeWidth={8}
          color={prob >= 75 ? 'text-emerald-400' : prob >= 50 ? 'text-gold' : 'text-amber-500'}
          glowColor={prob >= 75 ? 'rgba(52,211,153,0.2)' : 'rgba(214,168,58,0.2)'}
          label="Job Readiness"
          sublabel="Score"
        />

        <div className="flex-1 w-full">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-3">Core Calibration</div>
          <div className="space-y-2.5">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                {factor.impact === 'positive' ? 
                  <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" /> : 
                  <TrendingDown size={14} className="text-amber-500 flex-shrink-0" />
                }
                <span className={factor.impact === 'positive' ? 'text-white/90' : 'text-white/60'}>{factor.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Priority Improvement</div>
        <ul className="space-y-1.5">
          {readiness?.missingRequirements?.length > 0 ? (
            readiness.missingRequirements.slice(0, 2).map((imp, i) => (
              <li key={i} className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
                <ArrowRight size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span>{imp.name || imp}</span>
              </li>
            ))
          ) : (
            <li className="text-xs sm:text-sm text-emerald-400 flex items-center gap-2 font-bold">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Profile optimized for target role metrics!</span>
            </li>
          )}
        </ul>
      </div>
    </WidgetShell>
  );
}
