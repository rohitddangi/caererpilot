import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, CheckCircle, Clock, Zap, Layers, Milestone, Calendar, ArrowRight } from 'lucide-react';

export default function PlannerDashboard({
  dailyPlan = {},
  weeklyGoals = [],
  monthlyMilestones = [],
  skillTree = []
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get current day of the week index (Mon=0, Tue=1, ..., Sun=6)
  const getTodayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };
  
  const todayIdx = getTodayIndex();
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx);
  const [completedTasks, setCompletedTasks] = useState({});

  // Compute active learning topic from skill tree (first uncompleted topic)
  let activeTopic = null;
  if (skillTree && skillTree.length > 0) {
    for (const phase of skillTree) {
      const uncompleted = phase.topics?.find(t => !t.completed);
      if (uncompleted) {
        activeTopic = uncompleted;
        break;
      }
    }
  }
  if (!activeTopic && skillTree && skillTree.length > 0) {
    activeTopic = skillTree[0]?.topics?.[0];
  }

  // Generate dynamic, competitive learning tasks based on the active topic's details
  const getTasksForDay = (dayIdx) => {
    const topicName = activeTopic?.name || 'Core Stack Spec';
    const modules = activeTopic?.modules || ['Syntax', 'Structure', 'APIs', 'Containerization'];
    const resources = activeTopic?.resources || [{ title: 'Reference Manual' }];
    
    const r1Title = resources[0]?.title || 'Core Resource Documentation';
    const r1Type = resources[0]?.type || 'Docs';
    const m1 = modules[0] || 'Core Syntax Rules';
    const m2 = modules[1] || 'State Handling';
    const m3 = modules[2] || 'Scaling pipelines';

    switch (dayIdx) {
      case 0: // Monday
        return [
          `Read official reference documentation: "${r1Title}" (${r1Type})`,
          `Understand fundamental architectural principles of ${topicName}`,
          `Solve 2 targeted coding challenges regarding language fundamentals`,
          `Set up project repository folder & dependencies on local environment`
        ];
      case 1: // Tuesday
        return [
          `Build hands-on code sandboxes practicing: "${m1}" and "${m2}"`,
          `Write isolated console tests validation handlers`,
          `Push initial configuration templates to your local workspace`,
          `Review memory usage & efficiency parameters of the module`
        ];
      case 2: // Wednesday
        return [
          `Deep dive into advanced topics: "${m3}"`,
          `Optimize runtime state transitions / data operations`,
          `Solve 2 intermediate algorithm questions on LeetCode`,
          `Integrate API endpoints / mock services with local client`
        ];
      case 3: // Thursday (Dynamic highlight today if Thursday)
        return [
          `Construct functional mini-app proof-of-concept for ${topicName}`,
          `Implement interactive elements (forms, event triggers, inputs)`,
          `Validate component encapsulation, props, and strict types`,
          `Push model layout & route structures to git repository`
        ];
      case 4: // Friday
        return [
          `Refactor and clean code formatting in the mini-app`,
          `Add validation layers (Pydantic / TS strict checks)`,
          `Include error boundaries / exception logs`,
          `Push fully functional project commits to GitHub repository`
        ];
      case 5: // Saturday
        return [
          `Start the topic validation quiz for "${topicName}"`,
          `Submit your mini-app repo link to the AI Project Validator`,
          `Refactor code based on the generated review score`,
          `Document structural improvements inside the project readme`
        ];
      case 6: // Sunday
        return [
          `Initiate contextual mentor conversation on target role gaps`,
          `Check readiness parameters against real-time market requirements`,
          `Review next week goals checklist`,
          `Rest day — charge mental focus for the next sprint`
        ];
      default:
        return [];
    }
  };

  const currentTasks = getTasksForDay(selectedDayIdx);
  const dayKey = days[selectedDayIdx];

  const toggleTask = (task) => {
    setCompletedTasks((prev) => {
      const dayTasks = prev[dayKey] || [];
      const updated = dayTasks.includes(task)
        ? dayTasks.filter((t) => t !== task)
        : [...dayTasks, task];
      return { ...prev, [dayKey]: updated };
    });
  };

  const doneCount = completedTasks[dayKey]?.length || 0;
  const progress = currentTasks.length > 0 ? (doneCount / currentTasks.length) * 100 : 0;
  const isSelectedToday = selectedDayIdx === todayIdx;

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarRange className="text-gold" size={20} /> Adaptive Scheduler & Study Planner
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Your dynamic learning roadmap synchronized with active skill nodes and the current day.
          </p>
        </div>
        
        {/* Dynamic status card */}
        <div className="px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
          <Calendar size={16} className="text-gold" />
          <div>
            <div className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Active Learning Node</div>
            <div className="text-xs font-bold text-white max-w-[200px] truncate">{activeTopic?.name || 'Loading Topic...'}</div>
          </div>
        </div>
      </div>

      {/* Day of the Week Switcher */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {days.map((day, idx) => {
          const isToday = idx === todayIdx;
          const isSelected = idx === selectedDayIdx;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 min-w-[50px] py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all relative border ${
                isSelected
                  ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(214,168,58,0.25)] font-black'
                  : isToday
                    ? 'bg-gold/10 text-gold border-gold/30 font-semibold'
                    : 'bg-white/[0.01] text-zinc-400 border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-extrabold">{day.slice(0, 3)}</span>
              {isToday && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-black' : 'bg-gold animate-pulse'}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Daily Learning Planner */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-gold animate-pulse" /> {dayKey} Schedule
              </h4>
              {isSelectedToday && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-gold/15 text-gold border border-gold/25 rounded-md">
                  Today
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {currentTasks.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No specific plans loaded.</p>
              ) : (
                currentTasks.map((task) => {
                  const isDone = completedTasks[dayKey]?.includes(task);
                  return (
                    <button
                      key={task}
                      onClick={() => toggleTask(task)}
                      className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.01] hover:bg-gold/5 border border-white/5 hover:border-gold/20 text-left transition-all"
                    >
                      <span className={`h-4.5 w-4.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-gold border-gold text-black'
                          : 'border-zinc-700 bg-zinc-950 text-transparent'
                      }`}>
                        {isDone && <CheckCircle size={13} className="stroke-[3]" />}
                      </span>
                      <span className={`text-[11px] leading-tight font-medium ${isDone ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                        {task}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4 mt-5">
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold mb-2">
              <span className="flex items-center gap-1"><Clock size={11} /> Est: 3 hrs</span>
              <span>{doneCount} / {currentTasks.length} Completed</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gold"
              />
            </div>
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Layers size={14} /> Weekly Milestones
          </h4>
          <div className="space-y-3.5">
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5">
                  <span className="flex-shrink-0 text-[10px] font-black text-sky-400 bg-sky-500/10 border border-sky-500/25 h-5.5 w-5.5 rounded-lg flex items-center justify-center">
                    W{idx + 1}
                  </span>
                  <span className="text-[11px] text-zinc-300 font-semibold leading-normal mt-0.5">{goal}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-xs italic">No weekly milestones configured.</p>
            )}
          </div>
        </div>

        {/* Monthly Checkpoints */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Milestone size={14} /> Monthly Checkpoints
          </h4>
          <div className="space-y-3.5">
            {monthlyMilestones.length > 0 ? (
              monthlyMilestones.map((milestone, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5">
                  <span className="flex-shrink-0 text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/25 h-5.5 w-5.5 rounded-lg flex items-center justify-center">
                    M{idx + 1}
                  </span>
                  <span className="text-[11px] text-zinc-300 font-semibold leading-normal mt-0.5">{milestone}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-xs italic">No monthly checkpoints configured.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
