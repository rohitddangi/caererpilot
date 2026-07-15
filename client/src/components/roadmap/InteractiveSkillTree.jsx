import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, ChevronRight, CheckSquare, Square, ExternalLink, 
  HelpCircle, Trophy, BookOpen, Star, Clock, AlertTriangle,
  FolderOpen, ShieldAlert, Cpu, Database, Cloud, Terminal, CheckCircle2
} from 'lucide-react';
import ProgressBar from '../dashboard/ProgressBar.jsx';
import WidgetShell from '../dashboard/WidgetShell.jsx';

export default function InteractiveSkillTree({ skillTree = [], onToggleModule, onLaunchQuiz }) {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [expandedTopicIdx, setExpandedTopicIdx] = useState(null); // index of expanded topic inside the selected phase

  if (skillTree.length === 0) {
    return (
      <div className="glass rounded-3xl p-6 text-center text-zinc-500 italic text-xs col-span-2">
        No learning paths defined. Select your career target goal above to generate a path.
      </div>
    );
  }

  const activePhase = skillTree[selectedPhaseIdx] || skillTree[0];

  // Calculate phase completions
  const phasesMetadata = skillTree.map((phase, idx) => {
    let total = 0;
    let completed = 0;
    phase.topics?.forEach(topic => {
      total += topic.modules?.length || 0;
      completed += topic.completedModules?.length || 0;
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Assign dynamic difficulty & duration based on phase index
    const duration = idx === 0 ? '4 Weeks' : idx === 1 ? '5 Weeks' : '6 Weeks';
    const difficulty = idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced';
    
    return {
      name: phase.phase,
      percent,
      duration,
      difficulty,
      isCurrent: idx === selectedPhaseIdx,
      isCompleted: percent === 100
    };
  });

  // Calculate skill category mappings for the entire tree
  const skillsMapping = (() => {
    const categories = {
      'Programming': { completed: [], remaining: [] },
      'Web Development': { completed: [], remaining: [] },
      'Backend': { completed: [], remaining: [] },
      'Frontend': { completed: [], remaining: [] },
      'Database': { completed: [], remaining: [] },
      'Cloud & DevOps': { completed: [], remaining: [] }
    };

    skillTree.forEach(phase => {
      phase.topics?.forEach(topic => {
        const name = topic.name;
        const done = topic.completed;

        // Categorize topics dynamically based on keywords
        let cat = 'Programming';
        if (name.includes('Router') || name.includes('Frontend') || name.includes('React') || name.includes('Tailwind')) {
          cat = 'Frontend';
        } else if (name.includes('ORM') || name.includes('Database') || name.includes('SQL') || name.includes('Prisma') || name.includes('Postgres')) {
          cat = 'Database';
        } else if (name.includes('Redis') || name.includes('API') || name.includes('Backend') || name.includes('Express')) {
          cat = 'Backend';
        } else if (name.includes('Docker') || name.includes('Cloud') || name.includes('AWS') || name.includes('Deployment')) {
          cat = 'Cloud & DevOps';
        } else if (name.includes('TypeScript') || name.includes('Python') || name.includes('Java')) {
          cat = 'Programming';
        } else {
          cat = 'Web Development';
        }

        if (done) {
          categories[cat].completed.push(name);
        } else {
          categories[cat].remaining.push(name);
        }
      });
    });

    return categories;
  })();

  // Recommended project for the active phase
  const recommendedProject = (() => {
    const projects = [
      { name: 'Interactive UI Library', diff: 'Beginner', tech: 'React, Tailwind CSS', time: '12 hrs', val: 'High', ready: 'Yes', impact: 'Resume Ready' },
      { name: 'Scalable Microservices Gateway', diff: 'Advanced', tech: 'Node.js, Redis, Docker', time: '25 hrs', val: 'Very High', ready: 'Yes', impact: 'ATS Optimized' },
      { name: 'E-Commerce Database Schema', diff: 'Intermediate', tech: 'PostgreSQL, Prisma ORM', time: '18 hrs', val: 'High', ready: 'Yes', impact: 'Interview Star' }
    ];
    return projects[selectedPhaseIdx % projects.length];
  })();

  // Milestones checker
  const milestones = skillTree.map((phase, idx) => {
    const isDone = phasesMetadata[idx].isCompleted;
    return {
      title: `Finish ${phase.phase.split(':')[1] || phase.phase}`,
      badge: isDone ? 'Earned' : 'Locked',
      date: `Week ${(idx + 1) * 4}`,
      progress: phasesMetadata[idx].percent
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] col-span-2">
      
      {/* LEFT COLUMN: Modern vertical timeline connecting phases */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 px-2">
          <BookOpen className="text-gold" size={20} />
          <h3 className="text-lg font-black text-white">Curriculum Timeline Roadmap</h3>
        </div>

        <div className="relative pl-6 space-y-6">
          {/* Animated vertical timeline line */}
          <div className="absolute left-[37px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-gold via-white/10 to-transparent" />

          {skillTree.map((phase, idx) => {
            const meta = phasesMetadata[idx];
            
            return (
              <motion.div
                key={phase.phase}
                onClick={() => { setSelectedPhaseIdx(idx); setExpandedTopicIdx(null); }}
                whileHover={{ scale: 1.01 }}
                className={`relative p-5 rounded-3xl border transition-all cursor-pointer select-none flex justify-between items-center ${
                  meta.isCurrent 
                    ? 'bg-gold/10 border-gold/40 shadow-[0_0_25px_rgba(214,168,58,0.15)] text-white' 
                    : meta.isCompleted 
                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 opacity-90' 
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Timeline node dot indicator */}
                <div className={`absolute left-[-26px] top-7.5 h-4 w-4 rounded-full border-2 bg-black flex items-center justify-center z-10 transition-all ${
                  meta.isCurrent 
                    ? 'border-gold shadow-[0_0_10px_rgba(214,168,58,0.6)]' 
                    : meta.isCompleted 
                      ? 'border-emerald-400' 
                      : 'border-zinc-700'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    meta.isCurrent ? 'bg-gold' : meta.isCompleted ? 'bg-emerald-400' : 'bg-zinc-700'
                  }`} />
                </div>

                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider mb-1">
                    <span className={meta.isCurrent ? 'text-gold' : 'text-zinc-500'}>Phase {idx + 1}</span>
                    <span>•</span>
                    <span className="text-zinc-400">{meta.duration} ({meta.difficulty})</span>
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">{phase.phase}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-xs font-black block ${meta.isCompleted ? 'text-emerald-400' : 'text-gold'}`}>
                      {meta.percent}%
                    </span>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">Completed</span>
                  </div>
                  <ChevronRight size={14} className={meta.isCurrent ? 'text-gold' : 'text-zinc-500'} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Phase details panel */}
      <div className="space-y-6">
        <WidgetShell
          title={`Phase details: Phase ${selectedPhaseIdx + 1}`}
          icon={FolderOpen}
          badge={phasesMetadata[selectedPhaseIdx]?.difficulty}
          badgeColor="gold"
          headerRight={
            <span className="text-xs font-bold text-zinc-400">
              Duration: {phasesMetadata[selectedPhaseIdx]?.duration}
            </span>
          }
        >
          <div className="space-y-5">
            {/* Phase description */}
            <p className="text-xs text-zinc-400 leading-relaxed italic border-b border-white/5 pb-3">
              Learn structured frameworks and complete interactive study guides corresponding to Phase {selectedPhaseIdx + 1}.
            </p>

            {/* Topics checklist */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Topic Milestones</span>
              {activePhase.topics?.map((topic, topicIdx) => {
                const isOpen = expandedTopicIdx === topicIdx;
                const totalMod = topic.modules?.length || 0;
                const doneMod = topic.completedModules?.length || 0;
                const percent = totalMod > 0 ? Math.round((doneMod / totalMod) * 100) : 0;

                return (
                  <div key={topic.name} className="border border-white/5 rounded-2xl bg-black/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedTopicIdx(isOpen ? null : topicIdx)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:bg-white/[0.01] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <CheckCircle2 size={16} className={topic.completed ? 'text-emerald-400 shrink-0' : 'text-zinc-600 shrink-0'} />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{topic.name}</h5>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{doneMod}/{totalMod} Modules complete ({percent}%)</span>
                        </div>
                      </div>
                      <ChevronRight size={12} className={`text-zinc-500 transform transition-transform ${isOpen ? 'rotate-95' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-white/5 bg-black/40 overflow-hidden p-4 space-y-4"
                        >
                          <p className="text-[11px] text-zinc-400 leading-normal">{topic.description}</p>

                          {/* Task details checklists */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-gold uppercase tracking-wider block">Phase Tasks</span>
                            {topic.modules?.map((mod) => {
                              const isCompleted = topic.completedModules?.includes(mod);
                              return (
                                <button
                                  key={mod}
                                  onClick={() => onToggleModule(selectedPhaseIdx, topicIdx, mod)}
                                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.01] hover:bg-gold/5 border border-white/5 hover:border-gold/20 text-left transition-all text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <span className="text-gold shrink-0">
                                      {isCompleted ? <CheckSquare size={13} /> : <Square size={13} />}
                                    </span>
                                    <span className={`font-semibold truncate ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                                      {mod}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-bold text-zinc-500 uppercase shrink-0">Est: 2h</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Resources */}
                          {topic.resources?.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-black text-gold uppercase tracking-wider block">Recommended Guides</span>
                              <div className="grid gap-2">
                                {topic.resources.map((res) => (
                                  <a
                                    key={res.title}
                                    href={res.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between text-[11px] hover:border-white/20 transition-all text-zinc-300 hover:text-white"
                                  >
                                    <span className="truncate pr-2">{res.title}</span>
                                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{res.type}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quiz */}
                          {topic.quiz?.length > 0 && (
                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                              <button
                                onClick={() => onLaunchQuiz(topic.name, topic.quiz)}
                                className="flex items-center gap-1 bg-gold hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                              >
                                <Play size={10} className="fill-black" /> Start Assessment Quiz
                              </button>
                              {topic.quizScore !== undefined && (
                                <span className="text-[9px] font-bold text-zinc-400">Score: {topic.quizScore}% accuracy</span>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Recommended projects */}
            <div className="border-t border-white/5 pt-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Phase Capstone Project</span>
              <div className="p-4 rounded-2xl bg-gold/5 border border-gold/15 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-xs">{recommendedProject.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Technologies: {recommendedProject.tech}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                    {recommendedProject.diff}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase pt-1.5 border-t border-white/5">
                  <span>Hours: {recommendedProject.time}</span>
                  <span>Portfolio value: {recommendedProject.val}</span>
                  <span className="text-emerald-400">{recommendedProject.impact}</span>
                </div>
              </div>
            </div>
          </div>
        </WidgetShell>
      </div>

      {/* BOTTOM ROW: Skill mapping categorized & Milestones cabinet */}
      <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
        {/* Categorized Skills Mapping */}
        <WidgetShell title="Categories Technical Skill Map" icon={Cpu}>
          <div className="grid gap-4 grid-cols-2">
            {Object.entries(skillsMapping).map(([cat, val]) => {
              const total = val.completed.length + val.remaining.length;
              const percent = total > 0 ? Math.round((val.completed.length / total) * 100) : 0;
              return (
                <div key={cat} className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase">
                    <span className="truncate pr-1">{cat}</span>
                    <span className="text-gold">{percent}%</span>
                  </div>
                  <ProgressBar value={percent} height="h-1" color="from-gold to-champagne" glow={false} />
                  <div className="text-[9px] text-zinc-500 font-bold uppercase flex justify-between">
                    <span>Met: {val.completed.length}</span>
                    <span>Gap: {val.remaining.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </WidgetShell>

        {/* Milestones cabinet */}
        <WidgetShell title="Milestones Progress Checklist" icon={Trophy}>
          <div className="space-y-3">
            {milestones.slice(0, 3).map((ms, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white leading-tight">{ms.title}</h4>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Expected complete date: {ms.date}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    ms.badge === 'Earned' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-zinc-400'
                  }`}>{ms.badge}</span>
                  <span className="text-[10px] font-bold text-gold block mt-1">{ms.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>

    </div>
  );
}
