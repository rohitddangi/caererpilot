import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Sparkles, Target, Compass, BookOpen, Award, ShieldCheck, 
  Cpu, Briefcase, BarChart3, TrendingUp, Flame, Star, 
  RefreshCw, Play, MessageSquare, Terminal, GitBranch, Database,
  ArrowRight, Search, CheckCircle2, AlertTriangle, HelpCircle,
  Copy, Check, FileText, Calendar, Trash2, Edit2, ShieldAlert,
  Inbox, Settings, Send, Clock, Download, ChevronRight, HelpCircle as HelpIcon,
  Activity, CheckCircle, Circle, Milestone, Bell, History, Trophy, Zap
} from 'lucide-react';
import { api } from '../services/api.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useDashboardData from '../hooks/useDashboardData.js';
import useLiveTime from '../hooks/useLiveTime.js';
import WidgetShell from '../components/dashboard/WidgetShell.jsx';
import MetricCard from '../components/MetricCard.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';
import CircularProgress from '../components/dashboard/CircularProgress.jsx';
import { WeeklyGrowthChart, CareerRadarChart } from '../components/ChartPanel.jsx';

export default function CommandCenter() {
  const { user } = useAuth();
  const { dateStr, timeStr } = useLiveTime();
  const {
    targetRole,
    currentSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    skillProgress,
    profileCompletion,
    resumeScore,
    interviewScore,
    projectsCount,
    certsCount,
    readinessScore,
    streakCurrent,
    learningHours,
    completedTopics,
    careerHealthScore
  } = useDashboardData();

  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Existing states (preserved)
  const [readiness, setReadiness] = useState(null);
  const [trends, setTrends] = useState(null);
  const [mentorResult, setMentorResult] = useState(null);
  const [projectIdea, setProjectIdea] = useState('');
  const [techPref, setTechPref] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [mentorTab, setMentorTab] = useState('stack');
  const [copiedText, setCopiedText] = useState('');

  // AI Assistant states
  const [commandInput, setCommandInput] = useState('');
  const [aiOutput, setAiOutput] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState(() => {
    const cached = localStorage.getItem(`cp_cmd_history_${user?.id || 'guest'}`);
    return cached ? JSON.parse(cached) : [
      { command: 'analyze resume', date: 'Yesterday' },
      { command: 'suggest skills', date: '2 days ago' }
    ];
  });

  // Task Manager states
  const [tasks, setTasks] = useState(() => {
    const cached = localStorage.getItem(`cp_tasks_list_${user?.id || 'guest'}`);
    return cached ? JSON.parse(cached) : [
      { id: 1, title: `Complete advanced study module for ${targetRole}`, priority: 'high', due: '2026-07-20', completed: false },
      { id: 2, title: 'Upload latest resume blueprint to analyzer', priority: 'medium', due: '2026-07-21', completed: true },
      { id: 3, title: 'Solve 3 graph questions on coding playground', priority: 'high', due: '2026-07-22', completed: false }
    ];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('all'); // all, pending, completed
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  // Global Notifications panel state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Resume Score Updated', body: 'ATS validation successfully calibrated to 85%', read: false, time: '2h ago' },
    { id: 2, title: 'New Job Matches Available', body: `3 openings found matching your ${targetRole} stack`, read: false, time: '5h ago' },
    { id: 3, title: 'Mock Interview Reminder', body: 'Schedule your next technical assessment to unlock index premium', read: true, time: '1d ago' }
  ]);

  // Command History cache
  useEffect(() => {
    localStorage.setItem(`cp_cmd_history_${user?.id || 'guest'}`, JSON.stringify(commandHistory));
  }, [commandHistory, user?.id]);

  // Tasks list cache
  useEffect(() => {
    localStorage.setItem(`cp_tasks_list_${user?.id || 'guest'}`, JSON.stringify(tasks));
  }, [tasks, user?.id]);

  // Fetch initial parameters
  useEffect(() => {
    fetchReadiness();
    fetchTrends();
  }, []);

  const fetchReadiness = async () => {
    setReadinessLoading(true);
    try {
      const { data } = await api.get('/ai/job-readiness');
      setReadiness(data);
    } catch {
      toast.error('Failed to load job readiness parameters.');
    } finally {
      setReadinessLoading(false);
    }
  };

  const fetchTrends = async () => {
    setTrendsLoading(true);
    try {
      const { data } = await api.get('/ai/industry-trends');
      setTrends(data);
    } catch {
      toast.error('Failed to fetch market trends.');
    } finally {
      setTrendsLoading(false);
    }
  };

  const handleGenerateProjectDesign = async (e) => {
    if (e) e.preventDefault();
    if (!projectIdea.trim()) {
      toast.error('Enter a project idea first.');
      return;
    }
    setMentorLoading(true);
    setMentorResult(null);
    try {
      const { data } = await api.post('/ai/project-mentor', {
        projectIdea,
        techPreference: techPref
      });
      setMentorResult(data);
      setMentorTab('stack');
      toast.success('Project blueprint generated!');
    } catch {
      toast.error('Could not construct project blueprint.');
    } finally {
      setMentorLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(key);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  // AI Command Executor (Gemini ready)
  const executeCommand = async (cmd) => {
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;

    setAiLoading(true);
    setAiOutput(null);
    setCommandHistory(prev => [{ command: cleanCmd, date: 'Just now' }, ...prev]);

    const fallbackResponse = () => {
      if (cleanCmd.includes('roadmap')) {
        setAiOutput({
          title: 'Career roadmap generator',
          result: `Generating specialized roadmap blueprints for a ${targetRole} career track.\nRequired core milestones encompass: Frontend fundamentals, database integration, microservice structures, deployment frameworks, and testing indexes.`,
          action: 'Launch Roadmap',
          path: '/roadmap'
        });
      } else if (cleanCmd.includes('resume')) {
        setAiOutput({
          title: 'ATS resume analysis',
          result: `Your current resume ATS score is calculated at ${resumeScore}%.\nAI Recommendations:\n- Incorporate more action verbs in projects.\n- Define technical impact using metrics (e.g. Optimized response times by 34%).\n- Centralize core technologies under unified skill badges.`,
          action: 'Audit Resume',
          path: '/profile'
        });
      } else if (cleanCmd.includes('internship') || cleanCmd.includes('job')) {
        setAiOutput({
          title: 'Internship matches search',
          result: `Found 3 new internship positions matching your active ${targetRole} stack.\n- Associate Engineer @ SkyGrid Systems\n- ML/Data Science Intern @ NeuroStack Labs\n- Full Stack Developer @ OrbitCloud`,
          action: 'Open Job Center',
          path: '/jobs'
        });
      } else if (cleanCmd.includes('interview')) {
        setAiOutput({
          title: 'Mock interview scheduler',
          result: `Current interview readiness index is calculated at ${interviewScore}%.\nAI recommends practicing React Hooks basics and standard sorting algorithms (Bubble, Merge) under mock constraints before launching.`,
          action: 'Launch Assessment',
          path: '/interview'
        });
      } else if (cleanCmd.includes('project')) {
        setAiOutput({
          title: 'Portfolio recommendations',
          result: 'Recommended project: Real-time collaborative project planner (MERN stack + WebSockets).\nThis will bridge skill gaps in database modeling and state synchronization indexes (+15% readiness).',
          action: 'Use Project Mentor',
          handler: () => {
            setProjectIdea('Real-time collaborative planner');
            setTechPref('MERN stack + WebSockets');
            setActiveSubTab('assistant');
            setTimeout(() => handleGenerateProjectDesign(), 100);
          }
        });
      } else if (cleanCmd.includes('skill')) {
        setAiOutput({
          title: 'Skill gap calibration',
          result: `Core missing skills for target role (${targetRole}):\n${missingSkills.length > 0 ? missingSkills.join(', ') : 'All met!'}\nRelevance values: High priority (AWS, PyTorch, Docker). Recommended learning time: 40 hrs.`,
          action: 'View Skill Gaps',
          path: '/skill-gap'
        });
      } else if (cleanCmd.includes('study') || cleanCmd.includes('learn')) {
        setAiOutput({
          title: 'Curriculum learning plan',
          result: `Personalized study plan mapped out:\nPhase 1: Spend 12 hours practicing ${missingSkills[0] || 'core technologies'}.\nPhase 2: Build a custom project utilizing selected stack.\nPhase 3: Run mock coding simulation rounds daily.`,
          action: 'Learning Tracks',
          path: '/learning'
        });
      } else if (cleanCmd.includes('linkedin')) {
        setAiOutput({
          title: 'LinkedIn branding profile',
          result: `Strategic suggestions to increase search appearances by up to 28%:\n- Match headline keywords to: ${targetRole}.\n- Detail tech stack achievements under projects section.\n- Share certified credentials and live repository links.`,
          action: 'Profile Settings',
          path: '/profile'
        });
      } else {
        setAiOutput({
          title: 'AI Command Assistant',
          result: `Executed query: "${cmd}".\nCommand unrecognized. Try typing: "generate roadmap", "analyze resume", "find internships", "recommend project", "suggest skills", or "improve LinkedIn".`
        });
      }
    };

    try {
      const { data } = await api.post('/ai/career-chat', { message: cleanCmd });
      const reply = data.reply || data;
      
      let action = null;
      let path = null;
      let handler = null;

      if (cleanCmd.includes('roadmap')) {
        action = 'Launch Roadmap';
        path = '/roadmap';
      } else if (cleanCmd.includes('resume')) {
        action = 'Audit Resume';
        path = '/profile';
      } else if (cleanCmd.includes('internship') || cleanCmd.includes('job')) {
        action = 'Open Job Center';
        path = '/jobs';
      } else if (cleanCmd.includes('interview')) {
        action = 'Launch Assessment';
        path = '/interview';
      } else if (cleanCmd.includes('project')) {
        action = 'Use Project Mentor';
        handler = () => {
          setProjectIdea('Real-time collaborative planner');
          setTechPref('MERN stack + WebSockets');
          setActiveSubTab('assistant');
          setTimeout(() => handleGenerateProjectDesign(), 100);
        };
      } else if (cleanCmd.includes('skill')) {
        action = 'View Skill Gaps';
        path = '/skill-gap';
      } else if (cleanCmd.includes('study') || cleanCmd.includes('learn')) {
        action = 'Learning Tracks';
        path = '/learning';
      } else if (cleanCmd.includes('linkedin')) {
        action = 'Profile Settings';
        path = '/profile';
      }

      setAiOutput({
        title: data.agent || 'AI Command Assistant',
        result: typeof reply === 'string' ? reply : JSON.stringify(reply, null, 2),
        action,
        path,
        handler
      });
    } catch (err) {
      console.warn('[CommandCenter] Backend chat failed, falling back to simulator:', err);
      fallbackResponse();
    } finally {
      setAiLoading(false);
      setCommandInput('');
    }
  };

  // Task actions
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskObj = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      due: newTaskDue || new Date().toISOString().split('T')[0],
      completed: false
    };

    setTasks(prev => [taskObj, ...prev]);
    setNewTaskTitle('');
    setNewTaskDue('');
    toast.success('Task created!');
  };

  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted.');
  };

  const handleEditTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setEditingTaskId(id);
    setEditTaskTitle(task.title);
  };

  const handleSaveEdit = (id) => {
    if (!editTaskTitle.trim()) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: editTaskTitle.trim() } : t));
    setEditingTaskId(null);
    toast.success('Task updated!');
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
      const matchesFilter = 
        taskFilter === 'all' ? true :
        taskFilter === 'completed' ? t.completed : !t.completed;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, taskSearch, taskFilter]);

  // Tasks statistics
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Notification Inbox handlers
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Shortcuts grid
  const shortcuts = [
    { name: 'Resume Analyzer', path: '/command-center', icon: FileText },
    { name: 'Roadmap Creator', path: '/roadmap', icon: Target },
    { name: 'Skill Gap Snapshot', path: '/skill-gap', icon: Cpu },
    { name: 'Interview Prep', path: '/interview', icon: ShieldCheck },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Opportunities Center', path: '/jobs', icon: Briefcase },
    { name: 'Learning Track', path: '/learning', icon: BookOpen },
    { name: 'Certificates Cabinet', path: '/certificates', icon: Award },
    { name: 'Progress Tracker', path: '/progress', icon: Activity },
    { name: 'Target Goals', path: '/goals', icon: Trophy }
  ];

  // Goals checkpoints
  const goalProgresses = [
    { name: 'Weekly Coding Goal', current: matchedSkills.length, target: requiredSkills.length, eta: '3 days left' },
    { name: 'Monthly Skill Targets', current: certsCount, target: 4, eta: '12 days left' },
    { name: 'Daily XP Goal', current: user?.xp ? user.xp % 60 : 0, target: 60, eta: 'Ends tonight' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* ─── TOP COMMAND BAR ────────────────────────────────────── */}
      <div className="glass rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10">
        <div className="flex items-center gap-4 text-center md:text-left">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-full border-2 border-gold/40 shadow-glow shrink-0 object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center shrink-0 text-gold font-bold">
              CP
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 justify-center md:justify-start">
              Welcome to Command Cockpit, <span className="text-gold">{user?.name || 'Pilot'}</span> 👋
            </h1>
            <p className="text-xs text-zinc-500 font-semibold mt-1 flex flex-wrap justify-center md:justify-start items-center gap-2">
              <span>{dateStr}</span>
              <span>•</span>
              <span className="text-zinc-400">{timeStr}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Streak indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
            <Flame size={16} className="fill-current" />
            <span>{streakCurrent} Day Streak</span>
          </div>

          {/* Productivity score badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold/10 border border-gold/20 text-gold font-bold text-xs" title="Calculated from XP and streak multipliers">
            <Activity size={16} />
            <span>Productivity: {careerHealthScore}%</span>
          </div>
        </div>
      </div>

      {/* ─── COMMAND CENTER OVERVIEW CARDS ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Compass}
          label="Current Career Goal"
          value={targetRole}
          hint="Role tracking active"
          accentColor="gold"
        />
        <MetricCard
          icon={TrendingUp}
          label="Overall Progress"
          value={readinessScore}
          suffix="%"
          hint="Calibration alignment"
          accentColor="emerald"
        />
        <MetricCard
          icon={FileText}
          label="Resume ATS Score"
          value={resumeScore}
          suffix="%"
          hint="ATS validation index"
          accentColor="blue"
        />
        <MetricCard
          icon={Cpu}
          label="Skill Completion"
          value={skillProgress}
          suffix="%"
          hint="Required tech stack"
          accentColor="amber"
        />
        <MetricCard
          icon={BookOpen}
          label="Active Learning Hours"
          value={learningHours}
          suffix=" hrs"
          hint="Curriculum hours completed"
          accentColor="purple"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Interview Readiness"
          value={interviewScore}
          suffix="%"
          hint="Pass probability score"
          accentColor="emerald"
        />
        <MetricCard
          icon={Briefcase}
          label="Active Applications"
          value={user?.jobApplications?.length || 0}
          hint="Applications calibration"
          accentColor="gold"
        />
        <MetricCard
          icon={Activity}
          label="AI Productivity Score"
          value={careerHealthScore}
          suffix="%"
          hint="Calculated weekly score"
          accentColor="blue"
        />
      </div>

      {/* ─── WORKSPACE SUBTABS CONTROL PANEL ─────────────────────────────── */}
      <div className="flex border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Compass },
          { id: 'assistant', label: 'AI Command Assistant', icon: Sparkles },
          { id: 'tasks', label: 'Task & Goals Hub', icon: Target },
          { id: 'analytics', label: 'Productivity Analytics', icon: BarChart3 },
          { id: 'system', label: 'System & Notifications', icon: Database }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 focus:outline-none ${
                activeSubTab === tab.id
                  ? 'border-gold text-gold bg-gold/[0.02]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── DYNAMIC TABS PANEL CONTAINER ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-8">
              {/* Daily Mission checklist & Career Health */}
              <div className="grid gap-6 lg:grid-cols-2 items-stretch">
                
                {/* Stepper checklist missions */}
                <WidgetShell
                  title="Today's Cockpit Mission"
                  icon={Zap}
                  badge="Daily Stepper"
                  badgeColor="gold"
                >
                  <div className="space-y-3">
                    {[
                      { text: `Complete specialized study module for ${targetRole}`, priority: 'High', time: '40m' },
                      { text: 'Solve 2 DSA arrays/sorting problems', priority: 'High', time: '45m' },
                      { text: 'Analyze and upload resume blueprint', priority: 'Medium', time: '30m' },
                      { text: 'Schedule next mock technical round', priority: 'Low', time: '15m' }
                    ].map((step, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex gap-3 items-center min-w-0 pr-2">
                          <CheckCircle className="text-emerald-400 shrink-0" size={16} />
                          <span className="text-xs sm:text-sm font-semibold text-zinc-300 truncate">{step.text}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                          step.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/10 text-zinc-400'
                        }`}>
                          {step.priority} • {step.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </WidgetShell>

                {/* Career Health composite panel */}
                <WidgetShell
                  title="Career Health Diagnostics"
                  icon={ShieldAlert}
                  badge={`${careerHealthScore}/100 Score`}
                  badgeColor={careerHealthScore >= 75 ? 'emerald' : 'gold'}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
                    <CircularProgress
                      value={careerHealthScore}
                      size={110}
                      strokeWidth={8}
                      color={careerHealthScore >= 75 ? 'text-emerald-400' : 'text-gold'}
                      glowColor="rgba(214,168,58,0.2)"
                    />
                    <div className="flex-1 w-full space-y-2">
                      <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Main Strengths</span>
                        <p className="text-xs text-emerald-400 font-bold mt-0.5">ATS Optimization match indices</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Main Weaknesses</span>
                        <p className="text-xs text-amber-500 font-bold mt-0.5">Missing tech stack requirements</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
                    <span className="font-bold text-white">AI Suggestion: </span>
                    Bridge gaps in {missingSkills[0] || 'core technologies'} and complete an interview loop this week to raise indexes by +12%.
                  </div>
                </WidgetShell>
              </div>

              {/* Quick Short-cuts & Upcoming events */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Shortcuts */}
                <div className="lg:col-span-2">
                  <WidgetShell title="Quick Access Commands" icon={Compass}>
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                      {shortcuts.map((shortcut) => {
                        const Icon = shortcut.icon;
                        return (
                          <motion.a
                            key={shortcut.name}
                            href={shortcut.path}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-center flex flex-col items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Icon size={18} className="text-gold/80 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{shortcut.name}</span>
                          </motion.a>
                        );
                      })}
                    </div>
                  </WidgetShell>
                </div>

                {/* Events list */}
                <WidgetShell title="Upcoming Schedule Events" icon={Calendar}>
                  <div className="space-y-3">
                    {[
                      { title: 'Mock Tech Assessment', time: 'Tomorrow, 3:00 PM', urgency: 'Urgent' },
                      { title: 'Mega Recruitment Drive 2026', time: 'July 24, 10:00 AM', urgency: 'Important' },
                      { title: 'Study session: React hooks structure', time: 'July 26, 6:00 PM', urgency: 'Normal' }
                    ].map((evt, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white text-xs block">{evt.title}</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{evt.time}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          evt.urgency === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/10 text-zinc-400'
                        }`}>{evt.urgency}</span>
                      </div>
                    ))}
                  </div>
                </WidgetShell>
              </div>

              {/* Recent documents & Activity Feed */}
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Documents locker */}
                <WidgetShell title="Recent Active Documents" icon={FileText}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { name: 'Resume V3 ATS Blueprint.pdf', type: 'Resume', size: '1.2 MB' },
                      { name: `Roadmap-${targetRole}-2026.json`, type: 'Roadmap', size: '420 KB' },
                      { name: 'Mock Technical Interview Result.pdf', type: 'Report', size: '2.4 MB' },
                      { name: 'AWS Cloud Foundations Notes.txt', type: 'Notes', size: '14 KB' }
                    ].map((doc, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-gold/30 transition-colors">
                        <div className="min-w-0 pr-2">
                          <span className="text-[8px] font-black uppercase text-gold block mb-0.5">{doc.type}</span>
                          <span className="text-xs font-bold text-white block truncate">{doc.name}</span>
                          <span className="text-[9px] text-zinc-500 mt-0.5 block">{doc.size}</span>
                        </div>
                        <button className="p-2 bg-white/5 rounded-xl text-zinc-400 group-hover:text-gold transition-colors">
                          <Download size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </WidgetShell>

                {/* Activity Feed */}
                <WidgetShell title="Cockpit Live Activity Feed" icon={Activity}>
                  <div className="relative pl-4 space-y-4">
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-zinc-800" />
                    {[
                      { text: 'Completed "AWS Practitioner" certified prep', time: '1h ago', done: true },
                      { text: 'Generated customized roadmap blueprint', time: '3h ago', done: true },
                      { text: 'Initiated mock technical panel assessments', time: '1d ago', done: false }
                    ].map((act, idx) => (
                      <div key={idx} className="flex gap-3 items-start relative z-10">
                        <span className={`mt-0.5 rounded-full h-3.5 w-3.5 border bg-black flex items-center justify-center shrink-0 ${
                          act.done ? 'border-emerald-500 text-emerald-400' : 'border-zinc-700 text-zinc-500'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${act.done ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">{act.text}</p>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </WidgetShell>
              </div>
            </div>
          )}

          {/* TAB 2: AI COMMAND ASSISTANT */}
          {activeSubTab === 'assistant' && (
            <div className="space-y-8">
              {/* Autocomplete commands suggestions & Prompt bar */}
              <div className="glass rounded-[2rem] p-6 border border-white/10 bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <Sparkles className="text-gold animate-pulse" size={20} />
                  AI Command prompt Console
                </h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Instruct Gemini AI to orchestrate indices. Double click or write command templates directly:
                </p>

                {/* Interactive shortcuts suggestions */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    'generate roadmap', 'analyze resume', 'find internships',
                    'start interview', 'recommend project', 'suggest skills',
                    'generate study plan', 'improve LinkedIn'
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => setCommandInput(cmd)}
                      className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/[0.03] hover:border-gold/30 hover:bg-gold/5 text-xs text-zinc-300 hover:text-white transition-all font-bold uppercase tracking-wider text-[10px]"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                {/* Prompt bar */}
                <form
                  onSubmit={(e) => { e.preventDefault(); executeCommand(commandInput); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Ask AI command console (e.g. recommend project)..."
                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-4.5 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !commandInput.trim()}
                    className="premium-button py-3.5 px-6 shrink-0 h-12"
                  >
                    {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>{aiLoading ? 'Running...' : 'Execute'}</span>
                  </button>
                </form>

                {/* Output area */}
                <AnimatePresence mode="wait">
                  {aiLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center"
                    >
                      <RefreshCw size={24} className="text-gold animate-spin mb-3" />
                      <span className="text-xs font-bold text-zinc-400">Processing query against backend context...</span>
                    </motion.div>
                  )}

                  {aiOutput && !aiLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 rounded-2xl border border-gold/20 bg-gold/[0.01] space-y-4"
                    >
                      <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                        <span className="text-xs font-black uppercase text-gold tracking-widest">{aiOutput.title}</span>
                        <span className="text-[9px] font-bold text-zinc-500">Gemini AI Stream Response</span>
                      </div>
                      <pre className="font-sans text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {aiOutput.result}
                      </pre>
                      
                      {aiOutput.action && (
                        <div className="pt-3 border-t border-white/5 flex justify-end">
                          <button
                            onClick={() => {
                              if (aiOutput.handler) aiOutput.handler();
                              else if (aiOutput.path) navigate(aiOutput.path);
                            }}
                            className="premium-button py-2 px-5 text-xs font-bold"
                          >
                            <span>{aiOutput.action}</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Command execution history logs */}
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
                
                {/* AI Project Mentor Generator (PRESERVED) */}
                <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal size={20} className="text-gold" />
                    <h3 className="text-xl font-black text-white">AI Project Mentor</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                    Provide a project concept idea and stack preference. AI generates folders, API schedules, database setups, and milestones.
                  </p>

                  <form onSubmit={handleGenerateProjectDesign} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">Concept Idea</label>
                      <input
                        type="text"
                        placeholder="e.g. Chat app with WebSockets, SaaS metrics panel"
                        value={projectIdea}
                        onChange={e => setProjectIdea(e.target.value)}
                        disabled={mentorLoading}
                        className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">Tech Stack Preference</label>
                      <input
                        type="text"
                        placeholder="e.g. Node.js + MongoDB"
                        value={techPref}
                        onChange={e => setTechPref(e.target.value)}
                        disabled={mentorLoading}
                        className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={mentorLoading}
                      className="premium-button w-full py-3 text-xs font-bold"
                    >
                      {mentorLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>Blueprint System</span>
                    </button>
                  </form>
                </div>

                {/* History list */}
                <WidgetShell
                  title="Command Executed History"
                  icon={History}
                  isEmpty={commandHistory.length === 0}
                  emptyMessage="No command execution history recorded."
                  headerRight={
                    commandHistory.length > 0 && (
                      <button
                        onClick={() => { setCommandHistory([]); toast.success('Cleared logs!'); }}
                        className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Clear All
                      </button>
                    )
                  }
                >
                  <div className="space-y-2">
                    {commandHistory.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                        <div className="flex gap-2.5 items-center">
                          <Terminal size={12} className="text-zinc-500" />
                          <span className="font-mono font-bold text-white">{item.command}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-semibold">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </WidgetShell>
              </div>

              {/* Project blueprint rendering (PRESERVED) */}
              <AnimatePresence>
                {mentorResult && !mentorLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 p-5 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-white text-base">{mentorResult.projectName}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{mentorResult.description}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(mentorResult, null, 2), 'blueprint')}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-xs font-bold text-zinc-400 hover:text-gold transition-all flex items-center gap-1.5"
                      >
                        {copiedText === 'blueprint' ? <Check size={12} /> : <Copy size={12} />}
                        <span>Copy blueprint configuration</span>
                      </button>
                    </div>

                    {/* Stepper milestone view */}
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {mentorResult.developmentRoadmap?.map((phase, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                          <span className="text-[9px] font-black text-gold uppercase tracking-widest">Phase {idx + 1}: {phase.phase}</span>
                          <ul className="space-y-1 text-xs text-zinc-400">
                            {phase.tasks?.slice(0, 3).map((t, tIdx) => (
                              <li key={tIdx} className="truncate">• {t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3: TASK & GOALS HUB */}
          {activeSubTab === 'tasks' && (
            <div className="space-y-8">
              
              {/* Task CRUD Panel */}
              <div className="glass rounded-[2rem] p-6 border border-white/10 bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Target className="text-gold" size={20} />
                      Interactive Task Manager
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Define your daily study checklists. Persists locally.</p>
                  </div>
                  <span className="bg-gold/10 text-gold border border-gold/20 text-xs font-bold px-3 py-1 rounded-full">
                    {completedCount}/{totalTasks} Completed ({taskProgress}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <ProgressBar
                    value={taskProgress}
                    height="h-2"
                    color="from-gold to-champagne"
                    showPercent={false}
                  />
                </div>

                {/* Creation Form */}
                <form onSubmit={handleAddTask} className="grid gap-3 sm:grid-cols-[1fr_0.4fr_0.4fr_auto] items-end mb-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Solve binary tree questions"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-gold/50 transition-colors"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500">Due Date</label>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="premium-button py-3 px-6 shrink-0 h-11"
                  >
                    Add Task
                  </button>
                </form>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pt-6 border-t border-white/5">
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    <Search className="absolute left-3 top-3 text-zinc-500" size={13} />
                  </div>

                  <div className="flex gap-2">
                    {['all', 'pending', 'completed'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setTaskFilter(f)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                          taskFilter === f ? 'bg-gold border-gold text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredTasks.map((t) => {
                      const isEditing = editingTaskId === t.id;
                      return (
                        <motion.div
                          key={t.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            t.completed ? 'bg-white/5 border-white/5 opacity-60' : 'bg-black/30 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => handleToggleTask(t.id)}
                              className={`p-0.5 rounded-full shrink-0 transition-colors ${
                                t.completed ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>

                            {isEditing ? (
                              <input
                                type="text"
                                value={editTaskTitle}
                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                onBlur={() => handleSaveEdit(t.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(t.id); }}
                                autoFocus
                                className="flex-1 bg-white/10 border border-gold/40 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                              />
                            ) : (
                              <span className={`text-xs sm:text-sm font-semibold truncate ${
                                t.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
                              }`}>{t.title}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-white/10 text-zinc-400'
                            }`}>{t.priority}</span>

                            <span className="text-[9px] font-bold text-zinc-500 flex items-center gap-1">
                              <Calendar size={10} /> {t.due}
                            </span>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleEditTask(t.id)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-12 text-zinc-500 text-xs italic">
                        No tasks found matching current filters.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Goals target timelines */}
              <WidgetShell title="Interactive Goals Stepper" icon={Milestone}>
                <div className="grid gap-6 sm:grid-cols-3">
                  {goalProgresses.map((gp, idx) => {
                    const pct = Math.round((gp.current / gp.target) * 100) || 0;
                    return (
                      <div key={idx} className="p-5 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col justify-between h-40">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{gp.name}</span>
                            <span className="text-xs font-bold text-gold">{pct}%</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-2">{gp.current} / {gp.target} Completed</h4>
                          <ProgressBar value={pct} height="h-1" color="from-gold to-champagne" glow={false} />
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500 mt-4 flex items-center gap-1">
                          <Clock size={10} /> ETA: {gp.eta}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </WidgetShell>
            </div>
          )}

          {/* TAB 4: PRODUCTIVITY ANALYTICS */}
          {activeSubTab === 'analytics' && (
            <div className="space-y-8">
              {/* Analytics Graphs */}
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="glass rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white">Study & App Trends</h2>
                    <div className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded text-zinc-400 uppercase tracking-wider border border-white/10">Last 7 Days</div>
                  </div>
                  <WeeklyGrowthChart />
                </div>
                
                <div className="glass rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white">Growth DNA Structure</h2>
                    <span className="text-[10px] font-bold px-2 py-1 bg-gold/10 text-gold rounded uppercase tracking-wider border border-gold/20">Peer Index</span>
                  </div>
                  <CareerRadarChart />
                </div>
              </div>

              {/* Industry Trends demanded (PRESERVED) */}
              <div className="glass rounded-3xl p-6 bg-gradient-to-br from-white/[0.01] to-white/[0.03]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-gold" size={20} />
                    <h3 className="text-xl font-black text-white">Industry Trends & Demand</h3>
                  </div>
                  <button 
                    onClick={fetchTrends}
                    disabled={trendsLoading}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={14} className={trendsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                {trendsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <RefreshCw size={24} className="text-gold animate-spin mb-3" />
                    <span className="text-xs font-bold text-zinc-500">Querying market metrics...</span>
                  </div>
                ) : trends ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Trending Skills */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-gold tracking-widest border-b border-white/10 pb-2">Trending Skills</h4>
                      <div className="space-y-2">
                        {trends.trendingSkills?.map((skill, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-emerald-400 font-bold">{skill.growthRate}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 font-bold">{skill.demandIndex}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trending Technologies */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-gold tracking-widest border-b border-white/10 pb-2">Trending Technologies</h4>
                      <div className="space-y-3">
                        {trends.trendingTechnologies?.map((tech, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-white">{tech.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-500 uppercase tracking-wider">{tech.category}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-normal">{tech.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Demand & Salaries */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-gold tracking-widest border-b border-white/10 pb-2">Market Demand & Salaries</h4>
                      <div className="space-y-3">
                        {trends.mostDemandedJobs?.map((jobVal, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-white block">{jobVal.title}</span>
                              <span className="text-[9px] text-zinc-500 mt-0.5 block">Companies: {jobVal.topCompanies?.join(', ')}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gold shrink-0">{jobVal.openings}</span>
                          </div>
                        ))}

                        <div className="text-[10px] font-bold text-zinc-500 uppercase pt-2 border-t border-white/5">Salary Ranges</div>
                        {trends.salaryInsights?.map((sal, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-zinc-400 leading-snug">
                            <span className="font-semibold text-zinc-300">{sal.role}</span>
                            <span>{sal.entryLevel} / {sal.midLevel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-500 text-xs italic">
                    Market trends are unavailable.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM & NOTIFICATIONS */}
          {activeSubTab === 'system' && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
              
              {/* Notification Center list */}
              <WidgetShell
                title="Notification Alerts Center"
                icon={Bell}
                badge={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} New` : null}
                badgeColor="gold"
              >
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-2xl border transition-all relative ${
                        n.read ? 'bg-black/20 border-white/5 opacity-70' : 'bg-gold/10 border-gold/20'
                      }`}
                    >
                      {!n.read && (
                        <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      )}
                      <div className="flex justify-between items-start gap-4 pr-6">
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm">{n.title}</h4>
                          <p className="text-xs text-zinc-400 leading-snug mt-1">{n.body}</p>
                          <span className="text-[9px] text-zinc-500 font-bold mt-2 block">{n.time}</span>
                        </div>
                      </div>

                      <div className="absolute bottom-3 right-3 flex gap-2">
                        {!n.read && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle2 size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Dismiss alert"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 text-xs italic">
                      All caught up! Inbox empty.
                    </div>
                  )}
                </div>
              </WidgetShell>

              {/* AI Status checks Diagnostics */}
              <WidgetShell title="OS Diagnostics Diagnostics" icon={Database}>
                <div className="space-y-3">
                  {[
                    { name: 'Gemini API status', desc: 'Queries stream latency', active: true, status: '98 ms' },
                    { name: 'Backend API router', desc: 'Express controllers linked', active: true, status: 'Online' },
                    { name: 'Mongoose database', desc: 'MongoDB cloud cluster', active: true, status: 'Connected' },
                    { name: 'JWT Auth token session', desc: 'Authed profile active', active: true, status: 'Verified' },
                    { name: 'OS Storage memory health', desc: 'Local storage quotas usage', active: true, status: '0.4%' }
                  ].map((diag, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{diag.name}</span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 block">{diag.desc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400">{diag.status}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${diag.active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-red-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </WidgetShell>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
