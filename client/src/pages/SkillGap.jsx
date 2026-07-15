import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, LayoutDashboard, Compass, BookOpen, FileSpreadsheet, 
  LineChart, Target, Flame, Star, ShieldCheck, RefreshCw, X, 
  Download, Printer, FileText, Share2, Clipboard, GraduationCap,
  Briefcase, CheckSquare, Settings
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// Import sub-widgets
import SkillGapDashboard from '../components/skillgap/SkillGapDashboard';
import InteractiveSkillMap from '../components/skillgap/InteractiveSkillMap';
import PreparationSuite from '../components/skillgap/PreparationSuite';
import JobDescriptionAnal from '../components/skillgap/JobDescriptionAnal';
import MarketTrendsPanel from '../components/skillgap/MarketTrendsPanel';

export default function SkillGap() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeSkillGap, setActiveSkillGap] = useState(null);
  
  // XP & Level details
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState({ current: 0, best: 0, lastActive: '' });

  // Custom Selector fields
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [currentSkillsInput, setCurrentSkillsInput] = useState('React, JavaScript, Python, SQL, Git');

  // Generator Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eduInput, setEduInput] = useState('');
  const [semesterInput, setSemesterInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [projectsInput, setProjectsInput] = useState('');
  const [certsInput, setCertsInput] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [stackInput, setStackInput] = useState('');

  // Fetch initial profile alignment on mount
  useEffect(() => {
    fetchSkillGap();
  }, []);

  const fetchSkillGap = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/skillgap');
      setActiveSkillGap(data.activeSkillGap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      if (data.activeSkillGap) {
        setTargetRole(data.activeSkillGap.targetRole || 'Full Stack Developer');
        setGoalInput(data.activeSkillGap.targetRole || 'Full Stack Developer');
        const skillList = data.activeSkillGap.categories?.flatMap(c => c.skills.map(s => s.name)) || [];
        if (skillList.length > 0) {
          setCurrentSkillsInput(skillList.join(', '));
        }
      }
    } catch (err) {
      toast.error('Failed to load skill gap parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAnalyze = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    setIsModalOpen(false);
    try {
      const skillsArray = currentSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        targetRole: goalInput.trim() || targetRole,
        currentSkills: skillsArray,
        education: eduInput,
        semester: semesterInput,
        resumeText: resumeInput,
        projects: projectsInput,
        certifications: certsInput,
        learningProgress: progressInput,
        careerGoal: goalInput.trim(),
        targetCompany: companyInput,
        techStack: stackInput
      };

      const { data } = await api.post('/skillgap/analyze', payload);
      setActiveSkillGap(data.activeSkillGap);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      setTargetRole(data.activeSkillGap.targetRole || goalInput);
      toast.success(`AI Skill Gap Analysis loaded for ${data.activeSkillGap.targetRole || goalInput}!`);
    } catch (err) {
      toast.error('Error generating deep skill gap analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper when child component updates user state (like quizzes & projects)
  const handleStateUpdate = (newData) => {
    if (newData.activeSkillGap) setActiveSkillGap(newData.activeSkillGap);
    if (newData.xp !== undefined) setXp(newData.xp);
    if (newData.level !== undefined) setLevel(newData.level);
    if (newData.streak !== undefined) setStreak(newData.streak);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    if (!activeSkillGap) return;
    const blob = new Blob([JSON.stringify(activeSkillGap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillgap_report_${activeSkillGap.targetRole || 'career'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Career Report schema downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-300">
        <RefreshCw className="h-8 w-8 text-gold animate-spin mb-3" />
        <span className="text-xs font-bold uppercase tracking-widest text-gold">Loading Career Intelligence Engine...</span>
      </div>
    );
  }

  // Calculate XP values for progression bar
  const xpInCurrentLevel = xp % 1000;
  const levelNames = ['', 'Beginner', 'Learner', 'Developer', 'Advanced Developer', 'Industry Ready', 'Job Ready', 'Professional'];
  const levelName = levelNames[level] || 'Professional';

  // Overall Match score calculations
  const overallSkillMatch = activeSkillGap?.overallScores?.skillMatch || 60;
  const careerReadinessIndex = activeSkillGap?.overallScores?.readiness || 55;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* ─── PREMIUM COCKPIT HEADER BLOCK ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        {/* Background glow filters */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                AI Career Intelligence
              </span>
              {streak.current > 0 && (
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-yellow-500" />
                  {streak.current} Day Streak
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Role Match Checklist: <span className="text-gold">{targetRole}</span>
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span>Goal Target: <strong className="text-zinc-300">{activeSkillGap?.companyReadiness?.[0]?.company || 'Google'}</strong></span>
              <span>•</span>
              <span>Skill Match: <strong className="text-zinc-300">{overallSkillMatch}% Fit</strong></span>
              <span>•</span>
              <span>Prep Score: <strong className="text-zinc-300">{careerReadinessIndex}%</strong></span>
              <span>•</span>
              <span>Evaluated: <strong className="text-zinc-300">Today</strong></span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="premium-button py-2.5 px-5 text-xs font-bold"
            >
              <Sparkles size={13} />
              <span>Personalize Analysis</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
              title="Print report"
            >
              <Printer size={13} />
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
              title="Download analysis report"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Level progressions */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-gold fill-gold" />
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Mentor Grade</div>
              <div className="text-xs font-extrabold text-white">Level {level} · <span className="text-gold">{levelName}</span></div>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-gold to-yellow-500 rounded-full" style={{ width: `${xpInCurrentLevel / 10}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase mt-1">
              <span>{xpInCurrentLevel} XP Earned</span>
              <span>{1000 - xpInCurrentLevel} XP to Level {level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {analyzing ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="h-10 w-10 rounded-full border-4 border-gold/20 border-t-gold mb-4"
          />
          <div className="text-sm font-bold text-zinc-400">AI is compiling technical skill parameters & parsing credentials...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'map'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Compass size={14} />
                <span>Interactive Skill Map</span>
              </button>

              <button
                onClick={() => setActiveTab('prep')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'prep'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BookOpen size={14} />
                <span>Preparation Suite</span>
              </button>

              <button
                onClick={() => setActiveTab('analyzer')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'analyzer'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>JD Analyzer</span>
              </button>

              <button
                onClick={() => setActiveTab('trends')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'trends'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LineChart size={14} />
                <span>Market Trends</span>
              </button>
            </div>
          </div>

          {/* RENDER CURRENT TAB COMPONENT */}
          <div className="mt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'dashboard' && (
                  <SkillGapDashboard
                    activeSkillGap={activeSkillGap}
                    xp={xp}
                    level={level}
                    streak={streak}
                    onUpdate={handleStateUpdate}
                  />
                )}
                {activeTab === 'map' && (
                  <InteractiveSkillMap
                    activeSkillGap={activeSkillGap}
                    onUpdate={handleStateUpdate}
                  />
                )}
                {activeTab === 'prep' && (
                  <PreparationSuite
                    activeSkillGap={activeSkillGap}
                    xp={xp}
                    level={level}
                    streak={streak}
                    onUpdate={handleStateUpdate}
                  />
                )}
                {activeTab === 'analyzer' && (
                  <JobDescriptionAnal
                    activeSkillGap={activeSkillGap}
                    onUpdate={handleStateUpdate}
                  />
                )}
                {activeTab === 'trends' && (
                  <MarketTrendsPanel
                    activeSkillGap={activeSkillGap}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ─── CUSTOM AI SKILL ANALYZER MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
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
                  Personalize AI Skill Gap Evaluation
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCustomAnalyze} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Target Role / Career Goal</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer, AI Engineer"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      required
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Target Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Meta, Stripe, NeuroStack"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Education / Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science, Self-taught"
                      value={eduInput}
                      onChange={(e) => setEduInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Current Semester / Phase</label>
                    <input
                      type="text"
                      placeholder="e.g. 6th Semester, Graduated"
                      value={semesterInput}
                      onChange={(e) => setSemesterInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Current Skills (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, JavaScript, HTML, CSS, Git"
                      value={currentSkillsInput}
                      onChange={(e) => setCurrentSkillsInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Active Projects Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. Weather Dashboard (React), Simple E-Commerce (Node/SQL)"
                      value={projectsInput}
                      onChange={(e) => setProjectsInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Certifications</label>
                    <input
                      type="text"
                      placeholder="e.g. Meta Front-End Developer Badge"
                      value={certsInput}
                      onChange={(e) => setCertsInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Preferred Tech Stack</label>
                    <input
                      type="text"
                      placeholder="e.g. MERN Stack, PyTorch & FastAPI"
                      value={stackInput}
                      onChange={(e) => setStackInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Resume Summary Text</label>
                    <textarea
                      placeholder="Paste main details of your resume to compare ATS strengths..."
                      value={resumeInput}
                      onChange={(e) => setResumeInput(e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="premium-button w-full justify-center py-3 text-xs font-bold"
                  >
                    <Sparkles size={14} />
                    <span>Run Deep AI Evaluation</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
