import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { CheckCircle2, Circle, Clock, Play, Zap, Sparkles } from 'lucide-react';
import useDashboardData from '../../hooks/useDashboardData.js';
import { DAILY_TASK_TEMPLATES } from '../../data/dashboardData.jsx';
import ProgressBar from './ProgressBar.jsx';
import WidgetShell from './WidgetShell.jsx';

export default function ActionCenter() {
  const { user } = useAuth();
  const { targetRole } = useDashboardData();
  const [tasks, setTasks] = useState([]);
  const [completedAnimationId, setCompletedAnimationId] = useState(null);

  useEffect(() => {
    // Generate tasks dynamically based on target role
    const templates = DAILY_TASK_TEMPLATES[targetRole] || DAILY_TASK_TEMPLATES['Full Stack Developer'];
    
    // Check if user has progress already saved in localStorage for today
    const today = new Date().toDateString();
    const storageKey = `cp_tasks_${user?.id || 'guest'}_${today}`;
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      try {
        setTasks(JSON.parse(cached));
      } catch (e) {
        setTasks(templates);
      }
    } else {
      setTasks(templates);
    }
  }, [targetRole, user?.id]);

  const saveTasks = (newTasks) => {
    const today = new Date().toDateString();
    const storageKey = `cp_tasks_${user?.id || 'guest'}_${today}`;
    localStorage.setItem(storageKey, JSON.stringify(newTasks));
  };

  const toggleTask = (id) => {
    const updated = tasks.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) {
          // Trigger completion animation
          setCompletedAnimationId(id);
          setTimeout(() => setCompletedAnimationId(null), 800);
        }
        return { ...task, completed: nextCompleted };
      }
      return task;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <WidgetShell
      title="Today's Action Plan"
      icon={Zap}
      badge={`${completedCount}/${totalCount} Completed`}
      badgeColor={completedCount === totalCount && totalCount > 0 ? 'emerald' : 'gold'}
      isEmpty={tasks.length === 0}
      emptyMessage="No tasks generated for today yet."
      headerRight={
        <div className="w-40 hidden sm:block">
          <ProgressBar
            value={progressPercent}
            height="h-2"
            color="from-gold to-champagne"
            showPercent={true}
          />
        </div>
      }
      footer={
        <>
          <span>AI-generated tasks prioritized for maximum career impact.</span>
          <span className="text-gold font-bold flex items-center gap-1">
            <Sparkles size={10} className="animate-pulse" /> Focus Active
          </span>
        </>
      }
    >
      {/* Progress header for mobile */}
      <div className="w-full sm:hidden mb-4">
        <ProgressBar
          value={progressPercent}
          height="h-2"
          color="from-gold to-champagne"
          showPercent={true}
          label="Progress"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {tasks.map((task) => {
            const isHigh = task.priority === 'high';
            const isAnimating = completedAnimationId === task.id;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: isAnimating ? [1, 1.05, 1] : 1,
                  borderColor: isAnimating ? 'rgba(52,211,153,0.5)' : ''
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleTask(task.id)}
                className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer select-none ${
                  task.completed 
                    ? 'bg-white/5 border-white/5 opacity-60' 
                    : isHigh 
                      ? 'bg-gradient-to-br from-gold/10 to-transparent border-gold/20 hover:border-gold/40' 
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                }`}
              >
                {/* High Priority Bar Indicator */}
                {!task.completed && isHigh && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-2xl" />
                )}

                {/* Confetti celebration overlay */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center z-10"
                    >
                      <Sparkles size={24} className="text-emerald-400 animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="p-4 flex gap-3.5 items-start h-full">
                  <div className={`mt-0.5 transition-all flex-shrink-0 ${
                    task.completed ? 'text-emerald-400 scale-110' : 'text-zinc-500 group-hover:text-white'
                  }`}>
                    {task.completed ? (
                      <CheckCircle2 size={20} className="fill-emerald-400/10" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          task.completed ? 'bg-zinc-800 text-zinc-500' :
                          task.category === 'DSA' ? 'bg-purple-500/20 text-purple-400' :
                          task.category === 'Learning' ? 'bg-blue-500/20 text-blue-400' :
                          task.category === 'Project' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-white/10 text-zinc-300'
                        }`}>
                          {task.category}
                        </span>
                        {isHigh && !task.completed && (
                          <span className="text-[9px] font-black text-gold flex items-center gap-0.5 uppercase tracking-wider">
                            ⚡ High
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold leading-snug truncate-2-lines ${
                        task.completed ? 'text-zinc-500 line-through' : 'text-white/90'
                      }`}>
                        {task.text}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${
                        task.completed ? 'text-zinc-600' : 'text-zinc-500'
                      }`}>
                        <Clock size={12} /> {task.time}
                      </span>
                      {!task.completed && (
                        <button className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-gold hover:text-white transition-colors bg-gold/10 px-2.5 py-1 rounded">
                          <Play size={8} className="fill-gold" /> Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </WidgetShell>
  );
}
