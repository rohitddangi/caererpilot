import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, Award, Zap, Code, ShieldCheck, Sparkles } from 'lucide-react';

export default function InteractiveSkillMap({ activeSkillGap, onUpdate }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedSkillForPath, setSelectedSkillForPath] = useState(null);

  const categories = activeSkillGap?.categories || [];
  const dependencies = activeSkillGap?.dependencies || [];
  const emergingTech = activeSkillGap?.emergingTech || [];

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Find prerequisite paths for a given skill
  const getPrereqsFor = (skillName) => {
    const dep = dependencies.find(d => d.skill.toLowerCase() === skillName.toLowerCase());
    return dep ? dep.prereqs : [];
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Expandable Category Tree & Sliders */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
          <h2 className="text-lg font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <Code className="h-5 w-5 text-gold" />
            Interactive Skill Grid
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Explore your technical strength distributions by category. Click on any skill to reveal its pre-requisite dependency paths.
          </p>

          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const isOpen = expandedCategories[cat.name] ?? idx === 0; // default expand first one
              return (
                <div key={cat.name} className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <Star className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{cat.name}</h3>
                        <span className="text-[10px] text-neutral-400 font-medium">{cat.skills.length} Skills Profiled</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gold" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-white/5 px-5 py-4 space-y-4 bg-black/20"
                      >
                        {cat.skills.map(skill => {
                          const isSelected = selectedSkillForPath?.toLowerCase() === skill.name.toLowerCase();
                          return (
                            <div
                              key={skill.name}
                              onClick={() => setSelectedSkillForPath(skill.name)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-gold/30 bg-gold/5 shadow-md shadow-gold/5' 
                                  : 'border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{skill.name}</span>
                                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    skill.level === 'Advanced' 
                                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                      : (skill.level === 'Intermediate' 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20')
                                  }`}>
                                    {skill.level}
                                  </span>
                                </div>
                                <span className="text-[10px] font-semibold text-neutral-400 uppercase">
                                  Relevance: <span className="text-gold font-bold">{skill.relevance}</span>
                                </span>
                              </div>

                              {/* Progress bar sliders */}
                              <div className="space-y-1.5">
                                <div>
                                  <div className="flex justify-between text-[9px] text-neutral-400 font-semibold">
                                    <span>Strength Rating</span>
                                    <span className="text-gold">{skill.strength}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-gold to-yellow-500 rounded-full"
                                      style={{ width: `${skill.strength}%` }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-[9px] text-neutral-400 font-semibold">
                                    <span>Confidence Interval</span>
                                    <span className="text-gold">{skill.confidence}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full"
                                      style={{ width: `${skill.confidence}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Dependency Maps & SVG Graphs */}
      <div className="space-y-6">
        {/* Dependency Map Graph */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 flex flex-col min-h-[300px]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-gold" />
            Active Dependency Mapping
          </h3>
          <p className="text-[10px] text-neutral-400 mb-6">
            Visualize technical prerequisite pathways to unlock target mastery pipelines. Click on any skill card to trace.
          </p>

          <div className="flex-1 flex flex-col justify-center items-center">
            {selectedSkillForPath ? (
              <div className="w-full space-y-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Target Skill Node</span>
                  <div className="mt-1 font-bold text-white border border-gold/40 bg-gold/10 px-4 py-2.5 rounded-xl text-xs inline-block">
                    {selectedSkillForPath}
                  </div>
                </div>

                {getPrereqsFor(selectedSkillForPath).length > 0 ? (
                  <div className="relative py-2">
                    {/* SVG Connector Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/40 to-transparent -translate-x-1/2" />
                    
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <div className="text-[9px] font-bold text-neutral-500 uppercase">requires</div>
                      
                      {getPrereqsFor(selectedSkillForPath).map((prereq, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[11px] text-neutral-300 font-semibold"
                        >
                          {prereq}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 rounded-xl border border-white/5 bg-white/5 text-[11px] text-neutral-400 font-medium">
                    No strict prerequisites mapped for this node. You can begin learning it directly!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl">
                <Code className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-semibold">Select a skill in the list to visualize its dependencies</p>
              </div>
            )}
          </div>
        </div>

        {/* Future Skill / Emerging Tools */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            AI Future Skills Radar
          </h3>
          <p className="text-[10px] text-neutral-400 mb-4">
            Emerging industry paradigms expected to grow in demand over the next 12-18 months.
          </p>

          <div className="space-y-3">
            {emergingTech.map((tech, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">{tech.name}</h4>
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase">Trend: <span className="text-green-400">{tech.demandTrend}</span></span>
                </div>
                <div className="text-right">
                  <span className="text-gold font-bold text-xs block">{tech.salaryImpact}</span>
                  <span className="text-[8px] text-neutral-500 uppercase font-semibold">Salary Growth</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
