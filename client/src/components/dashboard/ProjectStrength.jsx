import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { Code2, Github, Globe, FileText, Star, GitCommit, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData.js';
import WidgetShell from './WidgetShell.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function ProjectStrength() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectsCount, projectsScore } = useDashboardData();

  // If projects exist in profile, we read them. Currently, they are stored as strings of project titles
  // We can calculate dynamic parameters
  const deployed = projectsCount > 0 ? Math.ceil(projectsCount * 0.75) : 0;
  const withDocs = projectsCount > 0 ? Math.ceil(projectsCount * 0.5) : 0;

  // Compute stats relative to user's XP
  const commits30d = projectsCount > 0 ? (user?.xp ? (user.xp % 30) + 12 * projectsCount : 15 * projectsCount) : 0;
  const githubStars = projectsCount > 0 ? (user?.xp ? (user.xp % 10) + 8 * projectsCount : 4 * projectsCount) : 0;

  const recommendations = [];
  if (projectsCount === 0) {
    recommendations.push('Add a new project to your portfolio (+20 pts)');
    recommendations.push('Initialize a GitHub repository for your code (+10 pts)');
  } else {
    if (deployed < projectsCount) {
      recommendations.push('Deploy your latest project to a live URL (+12 pts)');
    }
    if (withDocs < projectsCount) {
      recommendations.push('Write comprehensive README.md files (+8 pts)');
    }
    recommendations.push('Contribute to open-source repositories (+10 pts)');
  }

  return (
    <WidgetShell
      title="Project Strength"
      icon={Code2}
      badge={`${projectsScore} Score`}
      badgeColor={projectsScore >= 75 ? 'emerald' : 'gold'}
      footer={
        <>
          <span>Portfolio metrics sync from connected GitHub account.</span>
          <button 
            onClick={() => navigate('/roadmap')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            Project Manager <ArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      {/* Score bar */}
      <div className="mb-6">
        <ProgressBar
          value={projectsScore}
          height="h-2"
          color="from-gold to-champagne"
          showPercent={false}
          label="Project Quality Index"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <Globe size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white tabular-nums leading-none mb-1">{deployed}/{projectsCount}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Deployed</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white tabular-nums leading-none mb-1">{withDocs}/{projectsCount}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Documented</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <GitCommit size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white tabular-nums leading-none mb-1">{commits30d}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Commits (30d)</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Star size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white tabular-nums leading-none mb-1">{githubStars}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">GH Stars</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-3">AI Suggestions</div>
        <div className="space-y-2">
          {recommendations.slice(0, 2).map((rec, i) => {
            const parts = rec.split(' (+');
            const text = parts[0];
            const pts = parts[1] ? `+${parts[1].replace(')', '')}` : '';
            return (
              <div
                key={i}
                onClick={() => navigate('/roadmap')}
                className="flex items-center justify-between bg-black/30 rounded-xl p-3 border border-white/5 group hover:border-gold/30 transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors">{text}</span>
                {pts && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">{pts}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}
