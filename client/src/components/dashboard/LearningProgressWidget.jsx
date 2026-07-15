import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Play, BookOpen, Clock, Trophy } from 'lucide-react';
import useDashboardData from '../../hooks/useDashboardData.js';
import { getLearningTrack } from '../../data/roleSkillsMap.js';
import WidgetShell from './WidgetShell.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function LearningProgressWidget() {
  const navigate = useNavigate();
  const { targetRole, completedTopics } = useDashboardData();

  const topics = getLearningTrack(targetRole);
  const total = topics.length;

  // Calculate completed topics matching current track
  const matchedCompleted = Math.min(total, completedTopics);
  const percent = total > 0 ? Math.round((matchedCompleted / total) * 100) : 0;

  // Next topic to study
  const nextTopic = topics.find((t, idx) => idx >= matchedCompleted) || topics[total - 1] || { title: 'Advanced Electives', hours: 12 };

  return (
    <WidgetShell
      title="Learning Tracks"
      icon={GraduationCap}
      badge={`${percent}% Completed`}
      badgeColor={percent >= 75 ? 'emerald' : 'gold'}
      footer={
        <>
          <span>Continuous AI curriculum active</span>
          <button
            onClick={() => navigate('/learning')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            <span>Continue Learning</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      {/* Progress details */}
      <div className="flex items-center gap-4 mb-6 bg-black/20 rounded-2xl p-4 border border-white/5">
        <div className="relative shrink-0 w-16 h-16 flex items-center justify-center bg-gold/10 rounded-2xl border border-gold/20">
          <Trophy size={20} className="text-gold" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm leading-tight">{targetRole} Hub</h3>
          <p className="text-xs text-zinc-400 mt-1.5">
            {matchedCompleted} of {total} core topics completed.
          </p>
        </div>
      </div>

      {/* Next Topic Widget */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <BookOpen size={12} /> Next Topic Up
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <h4 className="font-bold text-white text-sm truncate">{nextTopic.title}</h4>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <Clock size={12} /> {nextTopic.hours} hours estimated
            </p>
          </div>
          <button
            onClick={() => navigate('/learning')}
            className="p-2.5 rounded-full bg-gold hover:bg-yellow-500 text-black transition-colors shrink-0"
            aria-label={`Study ${nextTopic.title}`}
          >
            <Play size={12} className="fill-black ml-0.5" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}
