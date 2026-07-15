import { motion } from 'framer-motion';
import { Target, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData.js';
import WidgetShell from './WidgetShell.jsx';

export default function SkillGapSnapshot() {
  const navigate = useNavigate();
  const {
    targetRole,
    currentSkills,
    missingSkills
  } = useDashboardData();

  const missingSkillsFormatted = missingSkills.map((name, idx) => ({
    name,
    priority: idx < 3 ? 'high' : idx < 6 ? 'medium' : 'low',
    hours: 10 + (idx * 5)
  }));

  const recommendedPath = missingSkills.slice(0, 4).map(name => `${name} Path`);

  return (
    <WidgetShell
      title="Skill Gap Snapshot"
      icon={Target}
      badge={`Target: ${targetRole}`}
      badgeColor="gold"
      footer={
        <>
          <span>Defines tech stack requirements.</span>
          <button 
            onClick={() => navigate('/skill-gap')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            Skill Gap Cockpit <ArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {/* Current Skills */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex justify-between">
            <span>Current Stack</span>
            <span>{currentSkills.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
            {currentSkills.slice(0, 8).map(skill => (
              <span key={skill} className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> {skill}
              </span>
            ))}
            {currentSkills.length === 0 && (
              <span className="text-xs text-zinc-500 italic py-2">No skills configured.</span>
            )}
            {currentSkills.length > 8 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-zinc-400">+{currentSkills.length - 8}</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full" />
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex justify-between relative z-10">
            <span>Missing Skills</span>
            <span className="text-red-400">{missingSkills.length}</span>
          </div>
          <div className="flex flex-col gap-2 relative z-10 max-h-[120px] overflow-y-auto pr-1">
            {missingSkillsFormatted.slice(0, 4).map(skill => (
              <div key={skill.name} className="flex items-center justify-between group">
                <span className="text-xs sm:text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{skill.name}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                  skill.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                  skill.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                  'bg-white/10 text-zinc-400'
                }`}>
                  {skill.priority}
                </span>
              </div>
            ))}
            {missingSkills.length === 0 && (
              <span className="text-xs text-emerald-400 italic py-2">All required skills met!</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Path */}
      {recommendedPath.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap size={14} className="text-gold" /> AI Recommended Path
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedPath.map((course, idx) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={course} 
                onClick={() => navigate('/learning')}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-gradient-to-r from-gold/10 to-champagne/5 border border-gold/20 text-gold flex items-center gap-1.5 cursor-pointer hover:bg-gold/20 transition-colors"
              >
                {course}
                {idx < recommendedPath.length - 1 && <ArrowRight size={12} className="opacity-50 ml-1" />}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
