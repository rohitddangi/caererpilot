import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, LayoutDashboard, Briefcase, Compass, History, Star, 
  Target, RefreshCw, Flame, Award, ShieldCheck, X, Play, 
  Printer, Download, PlayCircle, HelpCircle, Code, ShieldAlert, Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Import sub-widgets
import InterviewDashboard from '../components/interview/InterviewDashboard';
import MockInterviewSession from '../components/interview/MockInterviewSession';
import CodingWorkspace from '../components/interview/CodingWorkspace';
import CompanyPrepHub from '../components/interview/CompanyPrepHub';
import GDAndAptitudePrep from '../components/interview/GDAndAptitudePrep';
import InterviewHistory from '../components/interview/InterviewHistory';

export default function InterviewPrep() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  
  // Database mock states
  const [activeInterview, setActiveInterview] = useState(null);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState({ current: 0, best: 0, lastActive: '' });

  // Custom configurations Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState('Full Stack Developer');
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [company, setCompany] = useState('General');
  const [resumeSummary, setResumeSummary] = useState('');
  const [languagePreference, setLanguagePreference] = useState('JavaScript');

  useEffect(() => {
    fetchInterviewData();
  }, []);

  const fetchInterviewData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/interview');
      setActiveInterview(data.activeInterview);
      setCompletedInterviews(data.completedInterviews || []);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      
      // Auto-pre-fill user configurations if present
      if (data.activeInterview) {
        setRole(data.activeInterview.role || 'Full Stack Developer');
        setCompany(data.activeInterview.company || 'General');
      } else if (user?.profile?.targetRole) {
        setRole(user.profile.targetRole);
      }
    } catch (err) {
      toast.error('Failed to load interview preparation metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMock = async (customConfig = null) => {
    setStartingSession(true);
    setIsModalOpen(false);
    
    const startParams = customConfig || {
      role,
      type,
      difficulty,
      company,
      resumeContext: resumeSummary.trim(),
      language: languagePreference
    };

    try {
      const { data } = await api.post('/interview/start', startParams);
      setActiveInterview(data.activeInterview);
      setXp(data.xp);
      setLevel(data.level);
      setStreak(data.streak);
      toast.success(`Mock Interview initialized for ${startParams.role}!`);
    } catch (err) {
      toast.error('Failed to configure mock interview session');
    } finally {
      setStartingSession(false);
    }
  };

  const handleStateUpdate = (newData) => {
    if (newData.activeInterview !== undefined) setActiveInterview(newData.activeInterview);
    if (newData.completedInterviews !== undefined) setCompletedInterviews(newData.completedInterviews);
    if (newData.xp !== undefined) setXp(newData.xp);
    if (newData.level !== undefined) setLevel(newData.level);
    if (newData.streak !== undefined) setStreak(newData.streak);
  };

  const handleCancelSession = () => {
    if (window.confirm('Are you sure you want to quit this mock interview? Progress will not be saved.')) {
      api.post('/interview/clear-history')
        .then(() => {
          setActiveInterview(null);
          toast.success('Interview session cancelled.');
          fetchInterviewData();
        })
        .catch(() => toast.error('Failed to reset active session.'));
    }
  };

  // Launch a random interview preset instantly
  const handleRandomMock = () => {
    const roles = ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI Engineer'];
    const types = ['Technical', 'HR', 'Behavioral', 'Coding'];
    const diffs = ['Beginner', 'Intermediate', 'Advanced'];
    
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomDiff = diffs[Math.floor(Math.random() * diffs.length)];
    
    handleStartMock({
      role: randomRole,
      type: randomType,
      difficulty: randomDiff,
      company: 'General'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-300">
        <RefreshCw className="h-8 w-8 text-gold animate-spin mb-3" />
        <span className="text-xs font-bold uppercase tracking-widest text-gold">Loading AI Interview Coach...</span>
      </div>
    );
  }

  // XP level progression
  const xpInCurrentLevel = xp % 1000;
  const levelNames = ['', 'Beginner', 'Learner', 'Developer', 'Advanced Developer', 'Industry Ready', 'Job Ready', 'Professional'];
  const levelName = levelNames[level] || 'Professional';

  // Derived Header Scorecard values
  const mockCompletedCount = completedInterviews.length;
  const totalQuestionsSolved = completedInterviews.reduce((acc, c) => acc + (c.answers?.length || 0), 0);
  
  const latestMock = completedInterviews[mockCompletedCount - 1] || null;
  const overallPrepPercent = latestMock?.score || 66;
  const interviewReadinessScore = latestMock?.hiringProbability || 68;
  const aiConfidenceScore = latestMock?.breakdown?.confidence || 70;
  const lastPracticeDateStr = latestMock?.timestamp 
    ? new Date(latestMock.timestamp).toLocaleDateString()
    : 'Not practiced yet';

  const isCodingRound = activeInterview?.type === 'Coding' || activeInterview?.questions?.[activeInterview?.currentIndex || 0]?.category === 'Coding';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* ─── PREMIUM INTERVIEW SCOREBOARD HEADER ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        {/* Background glow blobbing */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                AI Interview Coach
              </span>
              {streak.current > 0 && (
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-yellow-500" />
                  {streak.current} Day Streak
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Target Track: <span className="text-gold">{role}</span>
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span>Goal Company: <strong className="text-zinc-300">{company}</strong></span>
              <span>•</span>
              <span>Readiness Score: <strong className="text-zinc-300">{interviewReadinessScore}%</strong></span>
              <span>•</span>
              <span>Overall Preparation: <strong className="text-zinc-300">{overallPrepPercent}%</strong></span>
              <span>•</span>
              <span>AI Confidence: <strong className="text-zinc-300">{aiConfidenceScore}%</strong></span>
            </div>

            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 uppercase mt-1">
              <span>Mocks Solved: {mockCompletedCount}</span>
              <span>Questions answered: {totalQuestionsSolved}</span>
              <span>Last Practiced: {lastPracticeDateStr}</span>
            </div>
          </div>

          {/* Header Action buttons */}
          <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
            {activeInterview ? (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-black py-2.5 px-5 rounded-full text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
              >
                <Play size={13} className="fill-black" />
                <span>Resume Interview</span>
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="premium-button py-2.5 px-5 text-xs font-bold"
              >
                <Sparkles size={13} />
                <span>Start AI Interview</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('companies')}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Briefcase size={13} />
              <span>Company Practice</span>
            </button>

            <button
              onClick={handleRandomMock}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Random Round</span>
            </button>
          </div>
        </div>

        {/* Level Progression */}
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

      {/* RENDER SIMULATOR SPACE IF ACTIVE MOCK SPREAD */}
      {activeInterview ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gold/5 border border-gold/15 flex items-center justify-between text-xs text-white">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              Interview Session Active: {activeInterview.role} ({activeInterview.type} Round)
            </span>
            <button
              onClick={handleCancelSession}
              className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/10 px-3 py-1 rounded-xl transition-all"
            >
              Quit Round
            </button>
          </div>

          {isCodingRound ? (
            <CodingWorkspace
              activeInterview={activeInterview}
              onUpdate={handleStateUpdate}
              onCancel={handleCancelSession}
            />
          ) : (
            <MockInterviewSession
              activeInterview={activeInterview}
              onUpdate={handleStateUpdate}
              onCancel={handleCancelSession}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Tabs switch panel */}
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
                onClick={() => setActiveTab('companies')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'companies'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Briefcase size={14} />
                <span>Company Prep Hub</span>
              </button>

              <button
                onClick={() => setActiveTab('aptitude')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'aptitude'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Compass size={14} />
                <span>Cognitive Aptitude & GD</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === 'history'
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <History size={14} />
                <span>Dialogue Logs</span>
              </button>
            </div>
          </div>

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
                  <InterviewDashboard
                    completedInterviews={completedInterviews}
                    activeInterview={activeInterview}
                    xp={xp}
                    level={level}
                    onStartMock={handleStartMock}
                  />
                )}
                {activeTab === 'companies' && (
                  <CompanyPrepHub
                    onStartMock={handleStartMock}
                  />
                )}
                {activeTab === 'aptitude' && (
                  <GDAndAptitudePrep />
                )}
                {activeTab === 'history' && (
                  <InterviewHistory
                    completedInterviews={completedInterviews}
                    onClearHistory={handleStateUpdate}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* ─── START AI INTERVIEW PREPARATION FORM MODAL ─── */}
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
                  Calibrate AI Interview Simulation
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleStartMock(); }} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Target Role / Career Goal</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer, AI Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Target Recruiter Company</label>
                    <select
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                    >
                      <option value="General">General Practice Round</option>
                      <option value="Google">Google</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Meta">Meta</option>
                      <option value="Netflix">Netflix</option>
                      <option value="Salesforce">Salesforce</option>
                      <option value="TCS">TCS</option>
                      <option value="Infosys">Infosys</option>
                      <option value="Wipro">Wipro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Round Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                    >
                      <option value="Technical">Technical Interview</option>
                      <option value="HR">HR Fit Round</option>
                      <option value="Behavioral">Behavioral (STAR Method)</option>
                      <option value="Coding">Coding / DSA Round</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Preferred Language</label>
                    <input
                      type="text"
                      placeholder="e.g. JavaScript, Python, C++"
                      value={languagePreference}
                      onChange={(e) => setLanguagePreference(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">Resume Summary Text Context</label>
                    <textarea
                      placeholder="Paste resume qualifications to generate customized resume-based questions..."
                      value={resumeSummary}
                      onChange={(e) => setResumeSummary(e.target.value)}
                      rows={4}
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
                    <span>Launch AI Practice Round</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg className="hidden">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
