import {
  Area, AreaChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, Cell, Pie, PieChart,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { weeklyGrowthData, progressJourneys } from '../data/dashboardData.jsx';

const GOLD     = '#d6a83a';
const CHAMP    = '#f4d37a';
const AMBER    = '#a97b16';
const IVORY    = '#fff0aa';

function getThemeColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    tickColor: isDark ? '#94a3b8' : '#475569',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    tooltip: isDark 
      ? { background: '#111827', border: '1px solid rgba(214, 168, 58, 0.35)', borderRadius: 14, color: '#F8FAFC' }
      : { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, color: '#1E293B', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }
  };
}

// ─── Gradient Defs ─────────────────────────────────────────────────────────────
function GradientDefs() {
  return (
    <defs>
      <linearGradient id="gLearning" x1="0" x2="0" y1="0" y2="1">
        <stop offset="5%"  stopColor={GOLD}  stopOpacity={0.5} />
        <stop offset="95%" stopColor={GOLD}  stopOpacity={0}   />
      </linearGradient>
      <linearGradient id="gSkills" x1="0" x2="0" y1="0" y2="1">
        <stop offset="5%"  stopColor={CHAMP} stopOpacity={0.4} />
        <stop offset="95%" stopColor={CHAMP} stopOpacity={0}   />
      </linearGradient>
      <linearGradient id="gApps" x1="0" x2="0" y1="0" y2="1">
        <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.4} />
        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
      </linearGradient>
      <linearGradient id="gInterviews" x1="0" x2="0" y1="0" y2="1">
        <stop offset="5%"  stopColor="#34d399" stopOpacity={0.4} />
        <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
      </linearGradient>
    </defs>
  );
}

// ─── Weekly Growth Multi-Line Chart ───────────────────────────────────────────
export function WeeklyGrowthChart() {
  const { user } = useAuth();
  const resumeScore = user?.profile?.resumeScore || 0;
  const skillsCount = user?.profile?.skills?.length || 0;
  const certsCount = user?.certificates?.length || 0;
  const appsCount = user?.jobApplications?.length || 0;

  // Scale data dynamically based on user progress to reflect a true dashboard progression
  const progressMultiplier = user 
    ? Math.min((skillsCount + certsCount + (resumeScore > 0 ? 1 : 0) + (appsCount > 0 ? 1 : 0) + 1) / 10, 1)
    : 0.1;

  const dynamicGrowthData = weeklyGrowthData.map(d => ({
    ...d,
    learning: Math.round(d.learning * progressMultiplier * 10) / 10,
    skills: Math.round(d.skills * progressMultiplier),
    applications: Math.round(d.applications * progressMultiplier),
    interviews: Math.round(d.interviews * progressMultiplier),
  }));

  const { tickColor, gridColor, tooltip } = getThemeColors();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={dynamicGrowthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <GradientDefs />
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis dataKey="day" stroke={tickColor} tick={{ fill: tickColor, fontSize: 12 }} />
        <YAxis stroke={tickColor} tick={{ fill: tickColor, fontSize: 12 }} />
        <Tooltip contentStyle={tooltip} />
        <Legend wrapperStyle={{ fontSize: 12, color: tickColor, paddingTop: 12 }} />
        <Area type="monotone" dataKey="learning"     name="Learning Hrs"   stroke={GOLD}      fill="url(#gLearning)"   strokeWidth={2.5} dot={false} />
        <Area type="monotone" dataKey="skills"       name="Skills Done"    stroke={CHAMP}     fill="url(#gSkills)"     strokeWidth={2}   dot={false} />
        <Area type="monotone" dataKey="applications" name="Applications"   stroke="#818cf8"   fill="url(#gApps)"       strokeWidth={2}   dot={false} />
        <Area type="monotone" dataKey="interviews"   name="Interviews"     stroke="#34d399"   fill="url(#gInterviews)" strokeWidth={2}   dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Career Radar Chart ───────────────────────────────────────────────────────
export function CareerRadarChart() {
  const { user } = useAuth();
  const resumeScore = user?.profile?.resumeScore || 0;
  const skillsCount = user?.profile?.skills?.length || 0;
  const interviewScore = user?.profile?.interviewScore || 0;
  const certsCount = user?.certificates?.length || 0;
  const projectsCount = user?.profile?.projects?.length || 0;

  const dynamicRadarData = [
    { subject: 'Technical',   score: Math.min(skillsCount * 12, 100), fullMark: 100 },
    { subject: 'Projects',    score: Math.min(projectsCount * 25, 100), fullMark: 100 },
    { subject: 'Resume',      score: resumeScore, fullMark: 100 },
    { subject: 'Interview',   score: interviewScore, fullMark: 100 },
    { subject: 'Networking',  score: user?.profile?.linkedin ? 100 : 0, fullMark: 100 },
    { subject: 'Certifications', score: Math.min(certsCount * 25, 100), fullMark: 100 },
  ];

  const { tickColor, gridColor, tooltip } = getThemeColors();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={dynamicRadarData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 12 }} />
        <Radar name="Your Score" dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip contentStyle={tooltip} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Skill Score Bars ─────────────────────────────────────────────────────────
export function SkillBars({ data }) {
  const colors = [GOLD, CHAMP, AMBER, IVORY, '#e8c96a'];
  const { tickColor, gridColor, tooltip } = getThemeColors();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke={tickColor} tick={{ fill: tickColor, fontSize: 11 }} />
        <YAxis stroke={tickColor} tick={{ fill: tickColor, fontSize: 11 }} domain={[0, 100]} />
        <Tooltip contentStyle={tooltip} />
        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Progress Donut (legacy) ──────────────────────────────────────────────────
export function ProgressDonut() {
  const golds = [GOLD, CHAMP, AMBER, IVORY];
  const data = progressJourneys.map(j => ({ name: j.name, value: j.percent }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={72} outerRadius={102} paddingAngle={4}>
          {data.map((_, i) => <Cell key={i} fill={golds[i % golds.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Weekly Chart (legacy alias) ─────────────────────────────────────────────
export function WeeklyChart() {
  return <WeeklyGrowthChart />;
}
