import { motion } from 'framer-motion';
import { Target, CheckCircle2, XCircle, Star } from 'lucide-react';

export default function SkillGapEngine({ skillGap = {}, targetRole = '' }) {
  const {
    currentSkills = [],
    requiredSkills = [],
    missingSkills = [],
    learningPriorities = []
  } = skillGap;

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <Target className="text-gold" size={20} /> Skill Requirements gap Analysis
      </h3>
      <p className="text-xs text-zinc-400 mb-6">
        Comparing your parsed credentials against standard expectations for the <strong className="text-gold">{targetRole}</strong> role.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Acquired Skills */}
        <div className="p-4.5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/15">
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Acquired Credentials ({currentSkills.length})
          </h4>
          {currentSkills.length === 0 ? (
            <p className="text-zinc-500 text-xs italic">No matching skills identified.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills */}
        <div className="p-4.5 rounded-2xl bg-red-500/[0.02] border border-red-500/15">
          <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <XCircle size={14} /> Deficient Skills ({missingSkills.length})
          </h4>
          {missingSkills.length === 0 ? (
            <p className="text-zinc-500 text-xs italic">You match all standard core skill targets! No missing items.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Priorities */}
      {learningPriorities.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="text-[10px] font-black text-gold uppercase tracking-wider mb-3 flex items-center gap-1">
            <Star size={10} className="text-gold animate-pulse" /> AI Learning Path Priorities
          </div>
          <div className="grid gap-2">
            {learningPriorities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300 leading-normal">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
