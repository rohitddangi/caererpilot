import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Brain, TrendingUp, Zap, Target, Medal, AlertCircle, Award, 
  Clock, Calendar, Cpu, Compass, FileText, CheckCircle2, X, Sparkles, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../services/api.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';

function CircularRingProgress({ value, label, size = 95, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white/[0.01] border border-white/5 shadow-inner">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-slate-200 dark:stroke-neutral-800 fill-none" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none"
            stroke="url(#goldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{value}%</span>
          <span className="text-[7px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function Progress() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI predictions modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [sumRes, insRes] = await Promise.all([
        api.get('/progress/summary'),
        api.post('/progress/insights')
      ]);
      setSummary(sumRes.data);
      setInsights(insRes.data || []);
    } catch (err) {
      toast.error('Failed to load progress analytics');
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateReport = () => {
    setIsReportOpen(true);
    setReportLoading(true);
    // Simulate compilation of placement predictions
    setTimeout(() => {
      setReportData({
        placementDate: 'September 2026',
        probability: '84%',
        interviewSuccess: '78%',
        expectedSalary: '₹10 – ₹15 LPA',
        nextSkill: 'Docker & Kubernetes',
        growthPotential: 'High'
      });
      setReportLoading(false);
      toast.success('AI Placement prediction compiled!');
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-300">
        <Loader />
        <span className="text-xs font-bold uppercase tracking-widest text-gold mt-4 animate-pulse">Syncing Analytics Center...</span>
      </div>
    );
  }

  // Radar Data for the 10 modules
  const radarData = summary ? [
    { subject: 'Skills', A: summary.modules.skills },
    { subject: 'Projects', A: summary.modules.projects },
    { subject: 'Resume', A: summary.modules.resume },
    { subject: 'Certs', A: summary.modules.certifications },
    { subject: 'GitHub', A: summary.modules.github },
    { subject: 'LinkedIn', A: summary.modules.linkedin },
    { subject: 'Interviews', A: summary.modules.interview },
    { subject: 'Jobs', A: summary.modules.jobs },
    { subject: 'Learning', A: summary.modules.learning },
    { subject: 'Roadmap', A: summary.modules.roadmap },
  ] : [];

  const streaks = summary?.streak?.current || 3;
  const targetGoalRole = user?.profile?.targetRole || 'Full Stack Developer';
  const latestCompletedTopic = user?.completedTopics?.[user.completedTopics.length - 1] || 'None yet';
  const isDark = !document.documentElement.classList.contains('light');
  const tickColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const tooltipStyle = isDark 
    ? { backgroundColor: '#111827', border: '1px solid rgba(214, 168, 58, 0.35)', borderRadius: '14px', color: '#F8FAFC' }
    : { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', color: '#1E293B', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* ─── PREMIUM PROGRESS SCOREBOARD HEADER ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
              Career analytics dashboard
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Target Track: <span className="text-gold">{targetGoalRole}</span>
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span>Hiring Probability: <strong className="text-zinc-300">82% Average</strong></span>
              <span>•</span>
              <span>Overall Progress: <strong className="text-zinc-300">Level {summary?.level || 1}</strong></span>
              <span>•</span>
              <span>Learning Streak: <strong className="text-zinc-300">{streaks} Days Active</strong></span>
            </div>

            <div className="text-[10px] font-bold text-zinc-500 uppercase mt-1">
              Last Completed Activity: <span className="text-gold font-extrabold">{latestCompletedTopic}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
            <button
              onClick={handleGenerateReport}
              className="premium-button py-2.5 px-5 text-xs font-bold"
            >
              <Sparkles size={13} />
              <span>Generate AI Predictions Report</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Circular Progress Rings Grid */}
      <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
          <Cpu className="h-4.5 w-4.5 text-gold" />
          Dimension Readiness Scores
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-items-center">
          <CircularRingProgress value={summary?.modules?.skills || 60} label="Skills Mastery" />
          <CircularRingProgress value={summary?.modules?.roadmap || 45} label="Roadmap Complete" />
          <CircularRingProgress value={summary?.modules?.learning || 65} label="Learning Hub" />
          <CircularRingProgress value={summary?.modules?.interview || 50} label="Interview Prep" />
          <CircularRingProgress value={summary?.modules?.resume || 85} label="Resume Score" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        
        {/* Left Column: Recharts Area and Radar charts */}
        <div className="space-y-6">
          
          {/* Weekly activity chart */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-gold" />
              Weekly studied activity
            </h3>
            <div className="h-[250px] w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.weeklyData}>
                  <defs>
                    <linearGradient id="colorLearning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d6a83a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d6a83a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke={tickColor} tick={{ fill: tickColor, fontSize: 10 }} />
                  <YAxis stroke={tickColor} tick={{ fill: tickColor, fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: isDark ? '#fff' : '#111', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="learning" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorLearning)" />
                  <Area type="monotone" dataKey="interviews" stroke="#60a5fa" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module Mastery Radar chart */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-gold" />
              Evaluation competence radar
            </h3>
            <p className="text-[10px] text-zinc-500 mb-6">Your competency spread across the 10 career dimensions.</p>
            <div className="h-[350px] w-full flex justify-center text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#D4AF37" strokeWidth={2} fill="#D4AF37" fillOpacity={0.15} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: AI Insights & Badges Achievements */}
        <div className="space-y-6">
          
          {/* AI Career Insights */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5 text-gold" />
              AI Career Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${
                  insight.type === 'strength' ? 'bg-green-500/5 border-green-500/20' :
                  insight.type === 'weakness' ? 'bg-red-500/5 border-red-500/20' :
                  insight.type === 'action' ? 'bg-gold/5 border-gold/20' : 'bg-blue-500/5 border-blue-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {insight.type === 'strength' ? <TrendingUp size={14} className="text-green-400" /> :
                     insight.type === 'weakness' ? <AlertCircle size={14} className="text-red-400" /> :
                     insight.type === 'action' ? <Zap size={14} className="text-gold" /> : <Medal size={14} className="text-blue-400" />}
                    <span className="font-extrabold text-xs text-white">{insight.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Achievements cabinet */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-gold" />
              Achievements drawer
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {summary?.badges?.length > 0 ? summary.badges.map(b => (
                <div key={b.id} className="aspect-square rounded-2xl bg-gradient-to-br from-gold/10 to-black border border-gold/20 flex items-center justify-center" title={b.name}>
                  <Medal className="text-gold drop-shadow-md" size={24} />
                </div>
              )) : (
                <div className="col-span-4 text-center py-6 text-[10px] text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                  Earn certificates or solve quizzes to unlock badges!
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* AI Predictions report modal */}
      <AnimatePresence>
        {isReportOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-gold animate-pulse" />
                  AI Placement Report Predictions
                </h3>
                <button onClick={() => setIsReportOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-zinc-300 font-semibold leading-relaxed">
                {reportLoading ? (
                  <div className="py-10 text-center text-zinc-400">
                    <Loader />
                    <p className="mt-4 text-[10px] text-gold font-bold uppercase tracking-wider animate-pulse">Running projection algorithms...</p>
                  </div>
                ) : reportData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-zinc-400">Estimated Placement Date</span>
                      <span className="text-white font-bold">{reportData.placementDate}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-zinc-400">Placement Probability</span>
                      <span className="text-gold font-bold">{reportData.probability}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-zinc-400">Interview Success Rate</span>
                      <span className="text-sky-400 font-bold">{reportData.interviewSuccess}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-zinc-400">Expected Salary Band</span>
                      <span className="text-emerald-400 font-bold">{reportData.expectedSalary}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gold/5 border border-gold/15">
                      <span className="text-[10px] font-black text-gold uppercase block mb-1">Next Recommended Skill</span>
                      <div className="text-zinc-300">{reportData.nextSkill}</div>
                    </div>
                  </div>
                ) : null}
              </div>
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
