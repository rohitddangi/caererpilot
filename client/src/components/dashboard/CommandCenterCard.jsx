import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, ShieldCheck, Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import useApiWidget from '../../hooks/useApiWidget.js';
import WidgetShell from './WidgetShell.jsx';

export default function CommandCenterCard() {
  const navigate = useNavigate();

  // Load readiness data with useApiWidget hook (independent fetching, caching, loading, errors)
  const {
    data: readiness,
    loading,
    error,
    retry
  } = useApiWidget('/ai/job-readiness', {
    fallback: { readinessPercentage: 0, breakdown: { skills: 0, interview: 0 } }
  });

  const score = readiness?.readinessPercentage || 0;

  return (
    <WidgetShell
      title="Command Center"
      icon={Compass}
      loading={loading}
      error={error}
      onRetry={retry}
      headerRight={
        <button
          onClick={retry}
          disabled={loading}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Recalibrate score"
          aria-label="Recalibrate readiness score"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      }
      footer={
        <>
          <span className="flex items-center gap-1">
            <Sparkles size={10} className="text-gold animate-pulse" /> AI Powered Console
          </span>
          <button
            onClick={() => navigate('/command-center')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            <span>Launch Cockpit</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      <div className="flex items-center gap-6 mb-6">
        <div className="relative shrink-0 w-20 h-20 flex items-center justify-center bg-white/[0.02] rounded-2xl border border-white/5">
          <span className={`text-3xl font-black tracking-tight ${
            score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-gold' : 'text-amber-500'
          }`}>{score}%</span>
          <span className="absolute bottom-1.5 text-[8px] font-black uppercase tracking-wider text-zinc-500">Readiness</span>
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Job Readiness Score</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-normal">
            {score >= 75 
              ? 'Your profile matches standard hiring metrics. Keep polishing projects.'
              : score >= 50
              ? 'Intermediate level. Bridge key skill gaps and add certifications.'
              : 'Add target role skills and build custom projects to raise your indices.'
            }
          </p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2">
        <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu size={10} className="text-gold" /> Skills Match
          </div>
          <span className="text-sm font-bold text-white mt-1.5">{readiness?.breakdown?.skills || 0}%</span>
        </div>
        <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-400" /> Prep Loops
          </div>
          <span className="text-sm font-bold text-white mt-1.5">{readiness?.breakdown?.interview || 0}%</span>
        </div>
      </div>
    </WidgetShell>
  );
}
