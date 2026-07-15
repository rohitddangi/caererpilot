import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, GitFork, Award, BarChart3, HelpCircle, ShieldCheck, 
  Flame, Compass, RefreshCw, Cpu, Target, Download, FileText,
  Printer, Share2, Settings, Plus, Sparkles, X, AlertTriangle, Play
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';
import { api } from '../services/api.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useDashboardData from '../hooks/useDashboardData.js';

// Child components
import GoalEngine from '../components/roadmap/GoalEngine.jsx';
import ProfileSummary from '../components/roadmap/ProfileSummary.jsx';
import SkillGapEngine from '../components/roadmap/SkillGapEngine.jsx';
import InteractiveSkillTree from '../components/roadmap/InteractiveSkillTree.jsx';
import TimeEstimator from '../components/roadmap/TimeEstimator.jsx';
import PlannerDashboard from '../components/roadmap/PlannerDashboard.jsx';
import QuizEngine from '../components/roadmap/QuizEngine.jsx';
import ProjectValSystem from '../components/roadmap/ProjectValSystem.jsx';
import RoadmapAnalytics from '../components/roadmap/RoadmapAnalytics.jsx';
import MentorChatPanel from '../components/roadmap/MentorChatPanel.jsx';

export default function Roadmap() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState({ current: 0, best: 0, lastActive: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null); // { topicName, questions }
  const [activeTab, setActiveTab] = useState('tree');

  // AI Generator Modal Form states
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [educationInput, setEducationInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('Beginner');
  const [skillsInput, setSkillsInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [hoursInput, setHoursInput] = useState('15');
  const [placementInput, setPlacementInput] = useState('');

  // Load active roadmap on mount
  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  async function fetchActiveRoadmap() {
    setLoading(true);
    try {
      const { data } = await api.get('/roadmap');
      setRoadmap(data.activeRoadmap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      
      // Pre-fill prompt inputs from current roadmap values if present
      if (data.activeRoadmap) {
        setTargetRoleInput(data.activeRoadmap.targetRole || '');
      }
    } catch {
      toast.error('Could not retrieve active career roadmap.');
    } finally {
      setLoading(false);
    }
  }

  // Generate a customized personalized roadmap via backend post
  async function handleGenerateCustomRoadmap(e) {
    if (e) e.preventDefault();
    if (!targetRoleInput.trim()) {
      toast.error('Dream Career Goal role is required.');
      return;
    }

    setGenerating(true);
    setIsGeneratorOpen(false);
    try {
      const payload = {
        targetRole: targetRoleInput.trim(),
        education: educationInput.trim(),
        currentSkills: skillsInput.trim(),
        experienceLevel: experienceInput,
        languages: languagesInput.trim(),
        techStack: techStackInput.trim(),
        studyHours: hoursInput,
        placementDate: placementInput.trim()
      };
      
      const { data } = await api.post('/roadmap/generate', payload);
      setRoadmap(data.activeRoadmap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      toast.success(`AI Roadmap successfully constructed for: ${targetRoleInput}!`);
    } catch (err) {
      console.error(err);
      toast.error('Custom roadmap generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  // Trigger basic preset role generation
  async function handleGeneratePresetRoadmap(roleName) {
    setGenerating(true);
    try {
      const { data } = await api.post('/roadmap/generate', { targetRole: roleName });
      setRoadmap(data.activeRoadmap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      toast.success(`Roadmap constructed for preset role: ${roleName}`);
    } catch (err) {
      toast.error('Roadmap generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  // Toggle Module Completion
  async function handleToggleModule(phaseIndex, topicIndex, moduleName) {
    try {
      const { data } = await api.patch('/roadmap/toggle-module', {
        phaseIndex,
        topicIndex,
        moduleName
      });
      setRoadmap(data.activeRoadmap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
    } catch {
      toast.error('Could not record module completion.');
    }
  }

  // Submit Quiz Answers
  async function handleQuizSubmit(score) {
    if (!activeQuiz) return;
    try {
      const { data } = await api.post('/roadmap/submit-quiz', {
        score,
        topicName: activeQuiz.topicName
      });
      setRoadmap(data.activeRoadmap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      toast.success(`Assessment scored! Correct answers: ${score}%. Claimed +${data.addedXp || 0} XP!`);
    } catch {
      toast.error('Quiz score submission failed.');
    }
  }

  // Submit Project Validation
  async function handleValidateProject(payload) {
    try {
      setProjectLoading(true);
      const { data } = await api.post('/roadmap/validate-project', payload);
      setRoadmap(data.activeRoadmap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      return data.evaluation;
    } catch {
      toast.error('Project evaluation failed.');
      return null;
    } finally {
      setProjectLoading(false);
    }
  }

  // Export handlers
  const handlePrintRoadmap = () => {
    window.print();
  };

  const handleDownloadRoadmap = () => {
    if (!roadmap) return;
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmap_${roadmap.targetRole || 'career'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Roadmap JSON downloaded!');
  };

  // Calculate global roadmap modules completion progress percentage
  const overallProgress = (() => {
    if (!roadmap?.skillTree || roadmap.skillTree.length === 0) return 0;
    let totalModules = 0;
    let completedModules = 0;
    roadmap.skillTree.forEach(phase => {
      phase.topics?.forEach(topic => {
        totalModules += topic.modules?.length || 0;
        completedModules += topic.completedModules?.length || 0;
      });
    });
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  })();

  const tabs = [
    { id: 'tree', label: 'Skill Path & Tree', icon: <GitFork size={14} /> },
    { id: 'analytics', label: 'Growth & Analytics', icon: <BarChart3 size={14} /> },
    { id: 'planner', label: 'Scheduler Planner', icon: <CalendarRangeWrapper size={14} /> },
    { id: 'projects', label: 'Mentorship & Projects', icon: <ShieldCheck size={14} /> }
  ];

  return (
    <div className="space-y-6">
      
      {/* ─── ROADMAP HEADER & CONTROL SECTION ────────────────────────────── */}
      <div className="glass rounded-[2rem] p-6 sm:p-8 bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
              AI Roadmap Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Target Track: <span className="text-gold">{roadmap?.targetRole || 'Full Stack Developer'}</span>
            </h2>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span>Goal Company: <strong className="text-zinc-300">{user?.careerGoals?.targetCompany || 'Google'}</strong></span>
              <span>•</span>
              <span>ETA: <strong className="text-zinc-300">{roadmap?.timeEstimation?.roadmapCompletion || '3 Months'}</strong></span>
              <span>•</span>
              <span>Progress: <strong className="text-zinc-300">{overallProgress}% Complete</strong></span>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl leading-normal italic mt-2.5">
              "{overallProgress >= 75 
                ? "Excellent progress! You're crossing hiring preparation boundaries. Polish projects." 
                : "Consistency is compounding! Completing 2 more modules in Phase 1 will boost skill alignment."
              }"
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="premium-button py-2.5 px-5 text-xs font-bold"
            >
              <Sparkles size={13} />
              <span>Personalize Roadmap</span>
            </button>
            <button
              onClick={handlePrintRoadmap}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
              title="Print Curriculum"
            >
              <Printer size={13} />
            </button>
            <button
              onClick={handleDownloadRoadmap}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
              title="Download JSON schema"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Global Progress bar */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold mb-1.5 uppercase">
              <span>Overall Roadmap Completion</span>
              <span>{overallProgress}%</span>
            </div>
            <ProgressBar
              value={overallProgress}
              height="h-2"
              color="from-gold to-champagne"
              glow={overallProgress >= 50}
            />
          </div>
        </div>
      </div>

      {loading || generating ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="h-10 w-10 rounded-full border-4 border-gold/20 border-t-gold mb-4"
          />
          <div className="text-sm font-bold text-zinc-400">
            {generating ? 'AI is architecting your personalized career path...' : 'Loading AI mentor configurations...'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gamified Profile overview */}
          <ProfileSummary level={level} xp={xp} streak={streak} />

          {/* Dynamic Tabs Navigation */}
          <div className="flex border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 focus:outline-none ${
                    activeTab === tab.id
                      ? 'border-gold text-gold bg-gold/[0.02]'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab View */}
          <div className="space-y-6">
            {activeTab === 'tree' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-start"
              >
                {roadmap && (
                  <InteractiveSkillTree
                    skillTree={roadmap.skillTree}
                    onToggleModule={handleToggleModule}
                    onLaunchQuiz={(name, q) => setActiveQuiz({ topicName: name, questions: q })}
                  />
                )}

                {/* Sidebar: Market Demand & Expected Trajectories */}
                {roadmap && (
                  <div className="space-y-6">
                    {/* Industry Demand Panel */}
                    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Compass className="text-gold" size={16} /> Market Trends & Salaries
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/[0.01] border border-white/5">
                          <span className="text-zinc-400">Target Role Range</span>
                          <span className="text-white font-bold">{roadmap.jobMarket?.salaryTrend || '₹8 – ₹15 LPA'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/[0.01] border border-white/5">
                          <span className="text-zinc-400">Hiring Velocity Index</span>
                          <span className="text-emerald-400 font-black">{roadmap.jobMarket?.hiringProbability || '90%'} Probability</span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/5 pt-4">
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-3">Skill Hiring Pressures</div>
                        <div className="grid gap-2">
                          {roadmap.jobMarket?.demand?.map((item) => (
                            <div key={item.name} className="flex justify-between items-center text-xs">
                              <span className="text-zinc-300 font-medium">{item.name}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                item.status === 'Very High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                item.status === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              }`}>
                                {item.status} Demand
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Certifications Recommendations */}
                    {roadmap.recommendedCertifications && roadmap.recommendedCertifications.length > 0 && (
                      <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <Award className="text-gold" size={16} /> Certified Badging Recommendations
                        </h4>
                        <div className="space-y-3">
                          {roadmap.recommendedCertifications.map((cert) => (
                            <div key={cert.name} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-white leading-tight block">{cert.name}</span>
                                <span className="text-[10px] text-zinc-500 mt-0.5 block">{cert.provider}</span>
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 flex-shrink-0 ml-2">
                                {cert.relevance}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {roadmap && <SkillGapEngine skillGap={roadmap.skillGap} targetRole={roadmap.targetRole} />}
                <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
                  <RoadmapAnalytics />
                  {roadmap && (
                    <TimeEstimator
                      timeEstimation={roadmap.timeEstimation}
                      careerPredictions={roadmap.careerPredictions}
                      jobMarket={roadmap.jobMarket}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'planner' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {roadmap && (
                  <PlannerDashboard
                    dailyPlan={roadmap.dailyPlan}
                    weeklyGoals={roadmap.weeklyGoals}
                    monthlyMilestones={roadmap.monthlyMilestones}
                    skillTree={roadmap.skillTree}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-start"
              >
                <ProjectValSystem onSubmit={handleValidateProject} loading={projectLoading} />
                <MentorChatPanel />
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ─── AI ROADMAP GENERATOR OVERLAY MODAL ───────────────────────────── */}
      <AnimatePresence>
        {isGeneratorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-gold animate-pulse" />
                  Personalize AI Learning Path
                </h3>
                <button
                  onClick={() => setIsGeneratorOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                  aria-label="Close generator modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleGenerateCustomRoadmap} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Dream Career Goal</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Engineer, Full Stack Developer"
                      value={targetRoleInput}
                      onChange={(e) => setTargetRoleInput(e.target.value)}
                      required
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Current Education</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science, Self-taught"
                      value={educationInput}
                      onChange={(e) => setEducationInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Experience Level</label>
                    <select
                      value={experienceInput}
                      onChange={(e) => setExperienceInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                    >
                      <option value="Beginner">Beginner (No coding background)</option>
                      <option value="Intermediate">Intermediate (Know syntax, built small apps)</option>
                      <option value="Advanced">Advanced (Experienced developer, seeking specialty)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Study Commitment (hrs/week)</label>
                    <input
                      type="number"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Current Skill Stack (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. HTML, CSS, JavaScript, Basic Python"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Preferred Languages</label>
                    <input
                      type="text"
                      placeholder="e.g. JavaScript, Python, Rust"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Target Placement Deadline</label>
                    <input
                      type="text"
                      placeholder="e.g. 6 Months, December 2026"
                      value={placementInput}
                      onChange={(e) => setPlacementInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="premium-button w-full justify-center py-3 text-xs font-bold"
                  >
                    <Sparkles size={14} />
                    <span>Generate Customized Path</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Modal Overlay */}
      <AnimatePresence>
        {activeQuiz && (
          <QuizEngine
            topicName={activeQuiz.topicName}
            questions={activeQuiz.questions}
            onSubmit={handleQuizSubmit}
            onClose={() => setActiveQuiz(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple internal icon wrapper
function CalendarRangeWrapper({ size = 14 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <path d="M17 14h-6"/>
      <path d="M13 18H7"/>
      <path d="M7 14h.01"/>
      <path d="M17 18h.01"/>
    </svg>
  );
}
