import { motion } from 'framer-motion';
import { Clock, Calendar, TrendingUp, ShieldCheck, Landmark } from 'lucide-react';

export default function TimeEstimator({
  timeEstimation = {},
  careerPredictions = {},
  jobMarket = {}
}) {
  const {
    skillCompletion = '6 Weeks',
    roadmapCompletion = '4 Months',
    internshipReadiness = '2.5 Months',
    placementReadiness = '4.5 Months'
  } = timeEstimation;

  const {
    internshipDate = 'September 2026',
    placementDate = 'November 2026',
    expectedGrowth = '22% Job Openings Growth'
  } = careerPredictions;

  const {
    salaryTrend = '₹6 – ₹11 LPA entry-level salary range',
    hiringProbability = '84%'
  } = jobMarket;

  const timeCards = [
    { title: 'Next Skill Node', value: skillCompletion, desc: 'Target completion for current topics.', icon: <Clock size={16} className="text-gold" /> },
    { title: 'Full Roadmap', value: roadmapCompletion, desc: 'Estimated timeline for complete curriculum.', icon: <Calendar size={16} className="text-sky-400" /> },
    { title: 'Internship Threshold', value: internshipReadiness, desc: 'Weeks to meet internship parameters.', icon: <ShieldCheck size={16} className="text-emerald-400" /> },
    { title: 'Placement threshold', value: placementReadiness, desc: 'Months to meet full placement criteria.', icon: <TrendingUp size={16} className="text-purple-400" /> }
  ];

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.02]">
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Time Estimations */}
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock size={16} className="text-gold" /> AI Timeline Projections
          </h4>
          <div className="grid gap-3 grid-cols-2">
            {timeCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9.5px] font-black text-zinc-500 uppercase tracking-wider">{card.title}</span>
                  {card.icon}
                </div>
                <div>
                  <div className="text-base font-black text-white">{card.value}</div>
                  <p className="text-[9.5px] text-zinc-500 mt-1 leading-tight">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Career Predictions */}
        <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-5 lg:pt-0 lg:pl-6">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-gold animate-pulse" /> Career Predictive Engine
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="text-xs text-zinc-400">Internship Readiness Date</span>
                <span className="text-xs font-bold text-white">{internshipDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="text-xs text-zinc-400">Placement Readiness Date</span>
                <span className="text-xs font-bold text-white">{placementDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="text-xs text-zinc-400">Estimated Hiring Probability</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                  {hiringProbability}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/15 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
              <Landmark size={18} />
            </div>
            <div>
              <div className="text-[9px] font-black text-gold uppercase tracking-wider">Salary Prediction band</div>
              <div className="text-xs font-bold text-zinc-200 mt-0.5 leading-tight">{salaryTrend}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">{expectedGrowth}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
