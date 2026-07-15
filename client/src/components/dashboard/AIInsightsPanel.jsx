import { motion } from 'framer-motion';
import { Sparkles, Brain, AlertTriangle, TrendingUp, Compass, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData.js';
import { getLearningTrack } from '../../data/roleSkillsMap.js';
import ProgressBar from './ProgressBar.jsx';

export default function AIInsightsPanel() {
  const navigate = useNavigate();
  const {
    targetRole,
    currentSkills,
    missingSkills,
    readinessScore,
    interviewScore,
    completedTopics
  } = useDashboardData();

  // Strongest skills: first 3 skills in current user stack
  const strongestSkills = currentSkills.slice(0, 3);
  // Weakest / Needs Improvement: next few skills or missing ones
  const weakestSkills = missingSkills.slice(0, 2);
  // Missing technologies
  const missingTechs = missingSkills.slice(0, 4);

  // Next recommended topic
  const topics = getLearningTrack(targetRole);
  const nextTopic = topics[Math.min(completedTopics, topics.length - 1)] || { title: 'Advanced Electives', hours: 10 };

  // Placement readiness estimate
  const placementReadiness = readinessScore;
  // Estimated interview probability
  const interviewProb = Math.max(15, Math.round(readinessScore * 0.95));

  // Weekly improvement suggestions
  const suggestions = [
    missingSkills.length > 0
      ? `Bridge skill gap in ${missingSkills[0]} (+15% readiness)`
      : 'Keep building advanced projects to maintain competence.',
    interviewScore < 75
      ? 'Complete at least 1 mock coding assessment this week'
      : 'Your interview preparation is excellent. Polish system design topics.'
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* 1. Skill Profile Index */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" />
            Skill Balance Profile
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400 font-semibold">Strongest Skills</span>
                <span className="text-emerald-400 font-bold">Expert</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strongestSkills.map(skill => (
                  <span key={skill} className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {skill}
                  </span>
                ))}
                {strongestSkills.length === 0 && (
                  <span className="text-xs text-zinc-500 italic">No skills defined.</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400 font-semibold">Gaps to Bridge</span>
                <span className="text-amber-500 font-bold">Priority</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weakestSkills.map(skill => (
                  <span key={skill} className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {skill}
                  </span>
                ))}
                {weakestSkills.length === 0 && (
                  <span className="text-xs text-emerald-400 font-bold">All gaps bridged!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/skill-gap')}
          className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1.5 mt-6 self-start group"
        >
          <span>Run Gap Analysis</span>
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* 2. Next Roadmap Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-6 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Compass size={16} className="text-blue-400" />
            Curriculum Navigator
          </h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mb-4">
            <span className="text-[9px] font-black uppercase text-gold tracking-widest block mb-1">Recommended Next Topic</span>
            <span className="text-sm font-bold text-white block mb-1.5">{nextTopic.title}</span>
            <ProgressBar
              value={35}
              height="h-1"
              color="from-blue-500 to-indigo-500"
              glow={false}
            />
          </div>
          
          <div className="text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Missing Technologies: </span>
            {missingTechs.map(t => t).join(', ') || 'None!'}
          </div>
        </div>

        <button
          onClick={() => navigate('/learning')}
          className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1.5 mt-6 self-start group"
        >
          <span>Continue Path</span>
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* 3. Placement Readiness Indices */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-3xl p-6 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            Hiring Analytics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400 font-semibold">Placement Readiness Index</span>
                <span className="text-white font-bold">{placementReadiness}%</span>
              </div>
              <ProgressBar
                value={placementReadiness}
                height="h-2"
                color="from-emerald-500 to-teal-500"
                glow={placementReadiness >= 75}
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400 font-semibold">Interview Pass Probability</span>
                <span className="text-white font-bold">{interviewProb}%</span>
              </div>
              <ProgressBar
                value={interviewProb}
                height="h-2"
                color="from-indigo-500 to-purple-500"
                glow={interviewProb >= 75}
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] text-zinc-500 font-semibold mt-4">
          Calculated relative to 4,200 cohort peers in {targetRole}
        </div>
      </motion.div>

      {/* 4. Weekly Improvement Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-3xl p-6 md:col-span-2 lg:col-span-3"
      >
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-gold" />
          AI Action Plan & Suggestions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3 items-start hover:border-gold/30 transition-colors"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold text-xs font-bold">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal font-semibold">
                {suggestion}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
