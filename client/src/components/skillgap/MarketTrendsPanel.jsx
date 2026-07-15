import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Legend } from 'recharts';
import { Landmark, TrendingUp, DollarSign, PlusCircle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export default function MarketTrendsPanel({ activeSkillGap }) {
  const [selectedSkills, setSelectedSkills] = useState({});

  const marketDemand = activeSkillGap?.marketDemand || [];
  const economicImpact = activeSkillGap?.economicImpact || { unlockedOpportunities: 0, salaryGrowth: [] };
  const baseSalary = 6.0; // Base LPA for entry-level developers in fallback data

  const handleToggleSkill = (skillName, increasePercent) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skillName]: prev[skillName] ? null : increasePercent
    }));
  };

  // Calculate salary increments
  const totalIncreasePercent = Object.values(selectedSkills).reduce((acc, val) => acc + (val || 0), 0);
  const incrementalSalary = (baseSalary * (totalIncreasePercent / 100)).toFixed(2);
  const projectedSalary = (baseSalary + parseFloat(incrementalSalary)).toFixed(2);

  // Prepare chart data
  const chartData = marketDemand.map(item => ({
    name: item.skill,
    'Hiring Need': item.demandScore,
    'Growth Forecast': item.futureDemand,
    'Salary Yield': item.salaryImpact
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Chart visualization */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
          <h2 className="text-lg font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Industry Demand Indices & Trends
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Visualizing hiring intensity, future demands, and economic scale adjustments across core gaps.
          </p>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#666" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#D4AF37', fontSize: '11px' }}
                  />
                  <Legend tick={{ fontSize: 10 }} wrapperStyle={{ paddingTop: 10 }} />
                  <Area type="monotone" dataKey="Hiring Need" stroke="#D4AF37" fillOpacity={1} fill="url(#colorNeed)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Growth Forecast" stroke="#fff" fillOpacity={1} fill="url(#colorForecast)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500 italic">No demand graph loaded.</div>
            )}
          </div>
        </div>

        {/* Opportunity Volume Summary */}
        <div className="p-5 rounded-3xl bg-gold/5 border border-gold/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Unlocked Economic Opportunities</h4>
            <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
              Closing active skill gaps opens up channels to matching vacancies across your region.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-gold tracking-tight">+{economicImpact.unlockedOpportunities}</span>
            <span className="text-[9px] text-neutral-400 font-semibold block uppercase">Vacancies Open</span>
          </div>
        </div>
      </div>

      {/* Economic salary calculator */}
      <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-gold" />
            Salary Potential Calculator
          </h3>
          <p className="text-[10px] text-neutral-400 mb-6">
            Select missing skills from the checklist below to calculate your projected salary growth impact.
          </p>

          <div className="space-y-2">
            {economicImpact.salaryGrowth.map((item, idx) => {
              const isChecked = selectedSkills[item.skill] !== undefined && selectedSkills[item.skill] !== null;
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleSkill(item.skill, item.increasePercent)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'border-gold bg-gold/10 text-white'
                      : 'border-white/5 bg-white/5 text-neutral-300 hover:border-white/10'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{item.skill}</span>
                    <span className="text-[8px] text-neutral-400 uppercase font-semibold">mastery reward</span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-gold font-bold text-xs">+{item.increasePercent}%</span>
                    <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                      isChecked ? 'bg-gold border-gold text-black' : 'border-white/20 bg-transparent'
                    }`}>
                      {isChecked && <Zap className="h-3 w-3 fill-black" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculated Projection Panel */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400 font-semibold">Current Baseline Range:</span>
            <span className="text-white font-bold">{baseSalary} LPA</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400 font-semibold">Closing Boost Increase:</span>
            <span className="text-gold font-bold">+{totalIncreasePercent}% (+₹{incrementalSalary} LPA)</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-2xl bg-gold/10 border border-gold/20">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Projected LPA:</span>
            <span className="text-lg font-extrabold text-gold tracking-tight">₹{projectedSalary} LPA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
