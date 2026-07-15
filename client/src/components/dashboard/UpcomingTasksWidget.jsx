import { Calendar, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData.js';
import WidgetShell from './WidgetShell.jsx';

export default function UpcomingTasksWidget() {
  const navigate = useNavigate();
  const { interviewScore, currentSkills } = useDashboardData();

  const tasks = [];
  let id = 1;

  if (currentSkills.length === 0) {
    tasks.push({
      id: id++,
      title: 'Configure Command Cockpit',
      desc: 'Add target role skills and projects to unlock readiness parameters.',
      due: 'Urgent',
      type: 'alert',
      link: '/command-center'
    });
  }

  if (interviewScore === 0) {
    tasks.push({
      id: id++,
      title: 'Schedule First Mock Tech Round',
      desc: 'Let AI test your coding, communication, and behavioral responses.',
      due: 'Pending',
      type: 'action',
      link: '/interview'
    });
  } else {
    tasks.push({
      id: id++,
      title: 'Practice Advanced coding round',
      desc: 'Review data structures and algorithms based on latest feedback.',
      due: 'Scheduled',
      type: 'meeting',
      link: '/interview'
    });
  }

  // General certification suggestions
  tasks.push({
    id: id++,
    title: 'Study target role core certificates',
    desc: 'Verify credentials to boost your hiring index by up to 22%.',
    due: 'This week',
    type: 'learning',
    link: '/certificates'
  });

  // Add Placement Drive and Exam schedules
  tasks.push({
    id: id++,
    title: 'CareerPilot Placement Drive 2026',
    desc: 'Mock placement tests and coding rounds open to all pro members.',
    due: 'July 24',
    type: 'drive',
    link: '/jobs'
  });

  return (
    <WidgetShell
      title="Upcoming Actions"
      icon={Calendar}
      badge="Schedule"
      badgeColor="gold"
      isEmpty={tasks.length === 0}
      emptyMessage="No upcoming tasks or meetings scheduled."
      footer={
        <>
          <span>Timeline calculated relative to target role</span>
          <button
            onClick={() => navigate('/roadmap')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Timeline Roadmaps</span>
            <ArrowRight size={12} />
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => navigate(task.link)}
            className="p-3.5 rounded-2xl bg-black/10 border border-white/5 hover:border-gold/30 hover:bg-white/[0.02] cursor-pointer transition-all flex justify-between items-center group"
          >
            <div className="flex gap-3 min-w-0 pr-2">
              <div className="mt-0.5 text-zinc-500 group-hover:text-gold transition-colors shrink-0">
                {task.type === 'alert' ? (
                  <ShieldAlert size={16} className="text-red-400" />
                ) : (
                  <Clock size={16} className="text-blue-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs leading-snug truncate">{task.title}</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug truncate-2-lines">{task.desc}</p>
              </div>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ml-3 ${
              task.due === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              task.due === 'Scheduled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              'bg-white/10 text-zinc-400'
            }`}>
              {task.due}
            </span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
