import { useEffect, useState } from 'react';
import {
  Target, TrendingUp, Flame, CheckCircle2, Layout, ShieldCheck,
  BookOpen, Briefcase, Award, Zap, Sparkles, Navigation, Calendar,
  ArrowRight, FileText, CheckCircle, GraduationCap, Trophy, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Core Dashboard Hooks & Helpers
import useDashboardData from '../hooks/useDashboardData.js';
import useLiveTime from '../hooks/useLiveTime.js';

// Core Dashboard Sub-Components
import HeroSection from '../components/dashboard/HeroSection.jsx';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel.jsx';
import ActionCenter from '../components/dashboard/ActionCenter.jsx';
import ActivityTimeline from '../components/dashboard/ActivityTimeline.jsx';
import NotificationsPanel from '../components/dashboard/NotificationsPanel.jsx';
import MetricCard from '../components/MetricCard.jsx';
import CircularProgress from '../components/dashboard/CircularProgress.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';

// Secondary Tab Components
import CommandCenterCard from '../components/dashboard/CommandCenterCard.jsx';
import CareerGoalProgress from '../components/dashboard/CareerGoalProgress.jsx';
import JobReadinessMeter from '../components/dashboard/JobReadinessMeter.jsx';
import ProjectStrength from '../components/dashboard/ProjectStrength.jsx';
import SkillsProgressTracker from '../components/dashboard/SkillsProgressTracker.jsx';
import LearningProgressWidget from '../components/dashboard/LearningProgressWidget.jsx';
import CertificationsOverview from '../components/dashboard/CertificationsOverview.jsx';
import SkillGapSnapshot from '../components/dashboard/SkillGapSnapshot.jsx';
import RecommendedJobsWidget from '../components/dashboard/RecommendedJobsWidget.jsx';
import UpcomingTasksWidget from '../components/dashboard/UpcomingTasksWidget.jsx';

// Chart components
import { WeeklyGrowthChart, CareerRadarChart } from '../components/ChartPanel.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { dateStr, timeStr } = useLiveTime();
  
  const {
    targetRole,
    currentSkills,
    requiredSkills,
    missingSkills,
    skillProgress,
    profileCompletion,
    actionsCompleted,
    resumeScore,
    interviewScore,
    projectsCount,
    certsCount,
    readinessScore,
    streakCurrent,
    learningHours,
    completedTopics,
    careerHealthScore,
    user
  } = useDashboardData();

  // Scroll to top on tab transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Command Overview', icon: Layout },
    { id: 'readiness', label: 'Career Readiness', icon: ShieldCheck },
    { id: 'learning', label: 'Learning & Skills', icon: BookOpen },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase }
  ];

  // Quick Action Buttons definitions
  const quickActions = [
    { label: 'Analyze Resume', icon: FileText, path: '/command-center', color: 'text-gold hover:bg-gold/10' },
    { label: 'Generate Roadmap', icon: Target, path: '/roadmap', color: 'text-emerald-400 hover:bg-emerald-500/10' },
    { label: 'Skill Gap Analysis', icon: Sparkles, path: '/skill-gap', color: 'text-purple-400 hover:bg-purple-500/10' },
    { label: 'Start Interview', icon: ShieldCheck, path: '/interview', color: 'text-blue-400 hover:bg-blue-500/10' },
    { label: 'Ask AI', icon: Zap, path: '/chatbot', color: 'text-amber-400 hover:bg-amber-500/10' },
    { label: 'Find Jobs', icon: Briefcase, path: '/jobs', color: 'text-indigo-400 hover:bg-indigo-500/10' },
    { label: 'Continue Learning', icon: BookOpen, path: '/learning', color: 'text-pink-400 hover:bg-pink-500/10' },
    { label: 'Generate Resume', icon: FileText, path: '/command-center', color: 'text-cyan-400 hover:bg-cyan-500/10' }
  ];

  // AI recommendations cards data calculated dynamically based on target role
  const recommendations = [
    { title: 'Recommended Course', category: 'Courses', detail: `Advanced ${targetRole} path on Next.js/Vite`, relevance: '96%' },
    { title: 'Portfolio Project', category: 'Projects', detail: 'Real-time collaborative analytics dashboard', relevance: '92%' },
    { title: 'Technical Skill Gap', category: 'Skills', detail: missingSkills[0] ? `Bridge ${missingSkills[0]} using interactive sandbox` : 'System Design & Scalability patterns', relevance: '89%' },
    { title: 'Mock Interview Topic', category: 'Interview Topics', detail: `Advanced Coding Round for ${targetRole}`, relevance: '85%' },
    { title: 'Resume Improvement', category: 'Resume Improvements', detail: 'Format action verbs and metrics in bio section', relevance: 'ATS Optimization' },
    { title: 'Strategic Career Advice', category: 'Career Advice', detail: 'Deploy projects live on Vercel to increase visibility by 24%', relevance: 'Job Ready' }
  ];

  // Upcoming Events list
  const upcomingEvents = [
    { title: 'Mock Tech Assessment', type: 'Mock Interview', time: 'Tomorrow, 3:00 PM', urgency: 'high' },
    { title: 'Portfolio Project Deployment', type: 'Assignment Deadlines', time: 'Thursday, 11:59 PM', urgency: 'medium' },
    { title: 'CareerPilot Mega Drive 2026', type: 'Placement Drive', time: 'July 24, 10:00 AM', urgency: 'high' },
    { title: 'AWS Cloud Practitioner Exam', type: 'Certification Exam', time: 'July 28, 2:00 PM', urgency: 'low' },
    { title: 'Solve 15 DSA Questions', type: 'Study Goals', time: 'This week', urgency: 'medium' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Cockpit Banner */}
      <HeroSection />

      {/* Navigation Tabs bar */}
      <div className="flex border-b border-white/10 overflow-x-auto pb-px scrollbar-none mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-gold text-gold bg-gold/[0.02]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tabs view container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 1. Grid of 8 Modern Overview Cards */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 rounded-full bg-gold" />
                  <h2 className="text-xl font-black text-white">Console Overview Metrics</h2>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  <MetricCard
                    icon={CheckCircle}
                    label="Skills Completed"
                    value={currentSkills.length}
                    percentChange="+12%"
                    hint="Active stack"
                    accentColor="gold"
                    delay={0}
                  />
                  <MetricCard
                    icon={Target}
                    label="Roadmap Progress"
                    value={skillProgress}
                    suffix="%"
                    percentChange="+8%"
                    hint="Role alignment"
                    accentColor="emerald"
                    delay={0.05}
                  />
                  <MetricCard
                    icon={FileText}
                    label="Resume Score"
                    value={resumeScore}
                    suffix="%"
                    percentChange="+5%"
                    hint="ATS verification"
                    accentColor="blue"
                    delay={0.1}
                  />
                  <MetricCard
                    icon={ShieldCheck}
                    label="Interview Pass Probability"
                    value={Math.max(15, Math.round(readinessScore * 0.95))}
                    suffix="%"
                    percentChange="+15%"
                    hint="Prep simulator"
                    accentColor="amber"
                    delay={0.15}
                  />
                  <MetricCard
                    icon={BookOpen}
                    label="Active Learning Hours"
                    value={learningHours}
                    suffix=" hrs"
                    percentChange="+20%"
                    hint="Curriculum time"
                    accentColor="purple"
                    delay={0.2}
                  />
                  <MetricCard
                    icon={Briefcase}
                    label="Applied Jobs"
                    value={user?.jobApplications?.length || 0}
                    percentChange="+2%"
                    hint="Job tracking status"
                    accentColor="gold"
                    delay={0.25}
                  />
                  <MetricCard
                    icon={Sparkles}
                    label="AI Recommendations"
                    value={recommendations.length}
                    percentChange="+10%"
                    hint="Tailored suggestions"
                    accentColor="emerald"
                    delay={0.3}
                  />
                  <MetricCard
                    icon={Award}
                    label="Certificates Earned"
                    value={certsCount}
                    percentChange="+25%"
                    hint="Credentials cabinet"
                    accentColor="blue"
                    delay={0.35}
                  />
                </div>
              </div>

              {/* 2. Quick Actions bar */}
              <div className="glass rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="text-gold" size={20} />
                  <h3 className="text-lg font-black text-white">Cockpit Quick Actions</h3>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  {quickActions.map((action, i) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] hover:border-gold/30 hover:text-white ${action.color}`}
                      >
                        <ActionIcon size={16} />
                        <span className="truncate">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Career Health Score & Radar Graph Panel */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Composite Health Score */}
                <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between items-center text-center">
                  <div className="w-full flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Trophy size={16} className="text-gold" />
                      Career Health Index
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">Overall Score</span>
                  </div>

                  <div className="my-4">
                    <CircularProgress
                      value={careerHealthScore}
                      size={160}
                      strokeWidth={12}
                      color={careerHealthScore >= 75 ? 'text-emerald-400' : careerHealthScore >= 50 ? 'text-gold' : 'text-amber-500'}
                      glowColor={careerHealthScore >= 75 ? 'rgba(52,211,153,0.3)' : 'rgba(214,168,58,0.3)'}
                      label="Career Health"
                      sublabel="Index"
                    />
                  </div>

                  <p className="text-xs text-zinc-400 leading-normal px-2 mt-4">
                    Composite score computed using ATS resume metrics, active credentials cabinet, completed interview loops, profile completeness index, and daily momentum streak.
                  </p>
                </div>

                {/* Growth DNA Radar Chart */}
                <div className="glass rounded-3xl p-6 border border-white/5 lg:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap size={16} className="text-gold" />
                      Growth DNA Matrix
                    </h3>
                    <div className="text-[9px] font-bold px-2 py-1 bg-gold/10 text-gold rounded uppercase tracking-wider border border-gold/20">Peer Comparison</div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <CareerRadarChart />
                  </div>
                </div>
              </div>

              {/* 4. AI Career Intelligence & Recommendations Panel */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 rounded-full bg-gold" />
                  <h2 className="text-xl font-black text-white">AI Intelligence Cabinet</h2>
                </div>
                <AIInsightsPanel />
              </div>

              {/* 5. Custom Tailored Recommendations cards */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 rounded-full bg-gold" />
                  <h2 className="text-xl font-black text-white">Tailored Career Recommendations</h2>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="glass rounded-3xl p-5 border border-white/5 hover:border-gold/20 transition-all flex flex-col justify-between group cursor-pointer"
                      onClick={() => {
                        if (rec.category === 'Courses') navigate('/learning');
                        else if (rec.category === 'Projects') navigate('/roadmap');
                        else if (rec.category === 'Skills') navigate('/skill-gap');
                        else if (rec.category === 'Interview Topics') navigate('/interview');
                        else if (rec.category === 'Resume Improvements') navigate('/command-center');
                        else navigate('/goals');
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                            {rec.category}
                          </span>
                          <span className="text-xs font-black text-emerald-400">{rec.relevance}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                        <p className="text-xs text-zinc-400 leading-normal">{rec.detail}</p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-semibold group-hover:text-gold transition-colors">
                        <span>Activate Recommendation</span>
                        <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Tasks, Events and Timelines block */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Daily Action Plan */}
                <div className="lg:col-span-2">
                  <ActionCenter />
                </div>

                {/* Upcoming Events */}
                <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={16} className="text-gold" />
                        Upcoming Events
                      </h3>
                      <span className="text-[9px] font-black uppercase text-zinc-500">Live Schedule</span>
                    </div>

                    <div className="space-y-3">
                      {upcomingEvents.map((evt, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center hover:bg-white/[0.04] transition-colors cursor-pointer"
                          onClick={() => {
                            if (evt.type === 'Mock Interview') navigate('/interview');
                            else if (evt.type === 'Certification Exam') navigate('/certificates');
                            else navigate('/roadmap');
                          }}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-[9px] font-black uppercase text-gold/80 block mb-0.5">{evt.type}</span>
                            <h4 className="text-xs font-bold text-white leading-tight truncate">{evt.title}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">{evt.time}</p>
                          </div>
                          
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                            evt.urgency === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                            evt.urgency === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-white/10 text-zinc-400 border border-white/10'
                          }`}>
                            {evt.urgency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-6 text-[10px] text-zinc-500 font-semibold flex justify-between items-center">
                    <span>Events sync automatically</span>
                    <button onClick={() => navigate('/roadmap')} className="text-xs font-bold text-gold hover:text-white transition-colors">
                      Calendar Path
                    </button>
                  </div>
                </div>
              </div>

              {/* 7. Recharts Analytics graphs block */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 rounded-full bg-gold" />
                  <h2 className="text-xl font-black text-white">Cohort Growth Analytics</h2>
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="glass rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black text-white">Weekly Study & Application Trends</h2>
                      <div className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded text-zinc-400 uppercase tracking-wider border border-white/10">Last 7 Days</div>
                    </div>
                    <WeeklyGrowthChart />
                  </div>
                  
                  <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black text-white">Recent Activities</h2>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Live Log</span>
                    </div>
                    <ActivityTimeline />
                  </div>
                </div>
              </div>

              {/* 8. Notifications section */}
              <div className="grid gap-6 md:grid-cols-2">
                <NotificationsPanel />
                <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <HelpCircle size={16} className="text-gold" />
                      Quick Tips & Help
                    </h3>
                    <ul className="space-y-3 text-xs sm:text-sm text-zinc-400">
                      <li className="flex gap-2 items-start leading-normal">
                        <span className="text-gold mt-0.5">•</span>
                        <span>Complete your daily checklist to increase your Streak and earn XP.</span>
                      </li>
                      <li className="flex gap-2 items-start leading-normal">
                        <span className="text-gold mt-0.5">•</span>
                        <span>Upload updated versions of your resume in the Analyzer whenever you add a major project.</span>
                      </li>
                      <li className="flex gap-2 items-start leading-normal">
                        <span className="text-gold mt-0.5">•</span>
                        <span>Take mock coding rounds regularly to polish problem-solving under pressure.</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate('/chatbot')}
                    className="premium-button w-full text-xs font-bold py-2.5 mt-6"
                  >
                    Discuss Gaps with AI Mentor
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Tab: Readiness */}
          {activeTab === 'readiness' && (
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              <CommandCenterCard />
              <CareerGoalProgress user={user} />
              <JobReadinessMeter />
              <ProjectStrength />
            </div>
          )}

          {/* Secondary Tab: Learning */}
          {activeTab === 'learning' && (
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              <SkillsProgressTracker />
              <LearningProgressWidget user={user} />
              <CertificationsOverview user={user} />
              <SkillGapSnapshot />
            </div>
          )}

          {/* Secondary Tab: Opportunities */}
          {activeTab === 'opportunities' && (
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              <RecommendedJobsWidget />
              <UpcomingTasksWidget user={user} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
