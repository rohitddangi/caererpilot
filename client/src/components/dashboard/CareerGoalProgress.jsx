import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, Trophy, ArrowRight, ShieldCheck, Milestone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData.js';
import WidgetShell from './WidgetShell.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function CareerGoalProgress() {
  const navigate = useNavigate();

  const {
    targetRole,
    currentSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    estimatedMonths,
    readinessScore,
    user
  } = useDashboardData();

  const targetSalary = user?.careerGoals?.targetSalary || '₹12 LPA';
  const currentPosition = user?.title || 'Career Explorer';

  // Dynamic timeline items matching requirement: Show Current Position, Next Goal, Estimated Completion
  const timelineSteps = [
    { label: `Current Position: ${currentPosition}`, detail: 'Initializing CareerPilot profile', done: true },
    { label: `Target Track Selected: ${targetRole}`, detail: `Aiming for roles with average ${targetSalary}`, done: !!user?.profile?.targetRole },
    { label: `Required Core Skills: ${requiredSkills.length} Techs`, detail: `${matchedSkills.length} matches, ${missingSkills.length} gaps to resolve`, done: matchedSkills.length > 0 },
    { label: `Estimated Completion Timeline`, detail: `Targeting placement readiness within next ${estimatedMonths} months`, done: readinessScore >= 75 }
  ];

  const completedSteps = timelineSteps.filter(s => s.done).length;
  const progressPercent = Math.round((completedSteps / timelineSteps.length) * 100);

  return (
    <WidgetShell
      title="Career Target timeline"
      icon={Target}
      badge={targetSalary}
      badgeColor="blue"
      footer={
        <>
          <span className="flex items-center gap-1">
            <Trophy size={12} className="text-gold" />
            <span>Dynamic AI estimation active</span>
          </span>
          <button
            onClick={() => navigate('/goals')}
            className="text-xs font-bold text-gold hover:text-white transition-colors"
          >
            Manage Goals
          </button>
        </>
      }
    >
      {/* Target parameters summary */}
      <div className="mb-4 bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 font-semibold">Skills Progress</span>
          <span className="text-gold font-bold">{matchedSkills.length} / {requiredSkills.length} Met</span>
        </div>
        <ProgressBar
          value={matchedSkills.length}
          max={requiredSkills.length}
          height="h-1.5"
          color="from-gold to-champagne"
          glow={false}
        />
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-4 relative pl-3.5">
        {/* Connector line */}
        <div className="absolute left-[20px] top-2.5 bottom-2.5 w-px bg-zinc-800" />

        {timelineSteps.map((step, idx) => (
          <div key={idx} className="flex gap-4 items-start relative">
            {/* Dot indicator */}
            <span className={`mt-1 z-10 shrink-0 ${step.done ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {step.done ? (
                <CheckCircle2 size={15} className="bg-black rounded-full" />
              ) : (
                <Circle size={15} className="bg-black rounded-full" />
              )}
            </span>
            
            <div className="min-w-0">
              <h4 className={`text-xs sm:text-sm font-bold ${step.done ? 'text-white' : 'text-zinc-500'}`}>
                {step.label}
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
