import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, LineChart } from 'lucide-react';

const growthData = [
  { name: 'Week 1', skills: 20, hours: 8, readiness: 15 },
  { name: 'Week 2', skills: 35, hours: 14, readiness: 28 },
  { name: 'Week 3', skills: 48, hours: 22, readiness: 42 },
  { name: 'Week 4', skills: 60, hours: 30, readiness: 58 },
  { name: 'Week 5', skills: 72, hours: 38, readiness: 70 },
  { name: 'Week 6', skills: 85, hours: 46, readiness: 84 }
];

const skillStrengthData = [
  { subject: 'Technical', A: 85, B: 110, fullMark: 100 },
  { subject: 'System Architecture', A: 60, B: 110, fullMark: 100 },
  { subject: 'Data Systems', A: 75, B: 110, fullMark: 100 },
  { subject: 'DevOps / Cloud', A: 40, B: 110, fullMark: 100 },
  { subject: 'Problem Solving', A: 80, B: 110, fullMark: 100 },
  { subject: 'Interview Readiness', A: 50, B: 110, fullMark: 100 }
];

export default function RoadmapAnalytics() {
  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.02]">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <BarChart3 className="text-gold" size={20} /> Roadmap Growth Analytics
      </h3>
      <p className="text-xs text-zinc-400 mb-6">
        Dynamic analysis tracking skill node acquisitions, cumulative hours, and role readiness index.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Readiness Growth (Area Chart) */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 h-80 flex flex-col justify-between">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <LineChart size={12} className="text-gold" /> Career Readiness Growth
          </div>
          <div className="flex-1 w-full text-[10px] font-medium text-zinc-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d6a83a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d6a83a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(214,168,58,0.2)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="readiness" stroke="#d6a83a" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Dimensions (Radar Chart) */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 h-80 flex flex-col justify-between">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <LineChart size={12} className="text-sky-400" /> Skill Dimension Strengths
          </div>
          <div className="flex-1 w-full text-[9px] font-mono text-zinc-400">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="75%" data={skillStrengthData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                <Radar name="Credentials" dataKey="A" stroke="#d6a83a" fill="#d6a83a" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
