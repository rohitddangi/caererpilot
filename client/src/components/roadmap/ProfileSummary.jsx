import { motion } from 'framer-motion';
import { Award, Flame, Zap, ShieldCheck } from 'lucide-react';

export default function ProfileSummary({ level = 1, xp = 0, streak = {} }) {
  const currentStreak = streak.current || 0;
  const bestStreak = streak.best || 0;

  // Level Progression Calculations
  const xpInCurrentLevel = xp % 1000;
  const xpProgressPercent = Math.min(100, Math.floor((xpInCurrentLevel / 1000) * 100));
  const xpNeededForNext = 1000 - xpInCurrentLevel;

  const levelNames = [
    '',
    'Beginner',
    'Learner',
    'Developer',
    'Advanced Developer',
    'Industry Ready',
    'Job Ready',
    'Professional'
  ];

  const levelName = levelNames[level] || 'Professional';

  // 7-day consistency mock
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeDays = [true, true, true, false, false, false, false]; // Dynamic visualization logic based on streak

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-white/[0.04]">
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr_1fr] items-center">
        
        {/* Gamified Level & XP */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold">
              <Award size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Mentor Grade</div>
              <h4 className="text-base font-black text-white flex items-center gap-1.5 leading-none">
                Lvl {level} · <span className="text-gold">{levelName}</span>
              </h4>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-4 leading-normal pr-4">
            Earn experience points (XP) by completing topics (+500 XP), validating repositories (+1000 XP), or scoring quizzes.
          </p>

          <div className="relative">
            <div className="flex justify-between items-center text-[10.5px] font-bold text-zinc-400 mb-1.5">
              <span>{xp} Total XP</span>
              <span className="text-gold">{xpNeededForNext} XP to Lvl {level + 1}</span>
            </div>
            <div className="h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400 shadow-[0_0_12px_rgba(214,168,58,0.3)]"
              />
            </div>
          </div>
        </div>

        {/* Streak Details */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between h-full min-h-28">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Consistency</span>
            <Flame size={18} className="text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-black text-white leading-none tracking-tight">{currentStreak} Days</div>
            <div className="text-[10px] text-zinc-400 font-bold mt-1">Current Study Streak</div>
          </div>
          <div className="text-[9.5px] text-zinc-500 font-semibold border-t border-white/5 pt-2 mt-2">
            Personal Best: {bestStreak} Days
          </div>
        </div>

        {/* Weekly Consistency tracker */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between h-full min-h-28">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Weekly Tracker</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          
          <div className="flex justify-between items-center gap-1.5 mt-2">
            {days.map((day, idx) => {
              const active = idx < currentStreak; // light up days matching streak
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`h-6 w-full rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                    active
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_8px_rgba(214,168,58,0.2)]'
                      : 'bg-white/[0.02] text-zinc-600 border-white/5'
                  }`}>
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[9.5px] text-zinc-400 font-bold text-center mt-2.5 flex items-center gap-1 justify-center">
            <Zap size={10} className="text-gold" /> Keep streak active today
          </div>
        </div>

      </div>
    </div>
  );
}
