import { useNavigate } from 'react-router-dom';
import { Medal, Award, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import useDashboardData from '../../hooks/useDashboardData.js';
import { getCertRecommendations } from '../../data/roleSkillsMap.js';
import WidgetShell from './WidgetShell.jsx';

export default function CertificationsOverview() {
  const navigate = useNavigate();
  const { targetRole, certsCount } = useDashboardData();

  const recommended = getCertRecommendations(targetRole);

  return (
    <WidgetShell
      title="Certifications Overview"
      icon={Medal}
      badge={`${certsCount} Earned`}
      badgeColor="emerald"
      footer={
        <>
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-gold" />
            <span>Badges automatically verified</span>
          </span>
          <button
            onClick={() => navigate('/certificates')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            <span>Manage Badges</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      {/* Cert stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-black text-white">{certsCount}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Verified Badges</div>
        </div>
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-black text-gold">{recommended.length}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Recommended</div>
        </div>
      </div>

      {/* Recommendations list */}
      <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-gold" /> Suggested Credentials
        </h3>
        <div className="space-y-2">
          {recommended.map((rec) => (
            <div
              key={rec.name}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs"
            >
              <div className="min-w-0 pr-2">
                <span className="font-bold text-white leading-tight block truncate">{rec.name}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">{rec.provider}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 flex-shrink-0 ml-2">
                {rec.relevance}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
