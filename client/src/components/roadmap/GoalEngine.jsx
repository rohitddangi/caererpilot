import { useState } from 'react';
import { Target, ChevronRight, Check } from 'lucide-react';

const roles = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Engineer',
  'Mobile App Developer',
  'Software Engineer',
  'Product Engineer',
  'UI/UX Designer'
];

export default function GoalEngine({ onGenerate, activeRole = '', loading = false }) {
  const [selected, setSelected] = useState(activeRole || roles[0]);
  const [custom, setCustom] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(!roles.includes(activeRole) && activeRole !== '');

  function handleSelect(role) {
    if (loading) return;
    setSelected(role);
    setIsCustomMode(false);
    onGenerate(role); // Instant triggers upon selection!
  }

  function handleSubmit() {
    const finalRole = isCustomMode ? custom.trim() : selected;
    if (!finalRole || loading) return;
    onGenerate(finalRole);
  }

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <Target className="text-gold" size={20} /> Career Target Engine
      </h3>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
        Select a target specialization below to instantly compile your learning path, or specify a custom role.
      </p>

      {/* Grid of Preset Roles - Responsive spacing & columns */}
      <div className="grid gap-2 grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6">
        {roles.map((role) => {
          const isActive = selected === role && !isCustomMode;
          return (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              disabled={loading}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all border truncate w-full ${
                isActive
                  ? 'border-gold bg-gold/10 text-white shadow-[0_0_20px_rgba(214,168,58,0.25)]'
                  : 'border-white/5 bg-white/[0.01] hover:border-gold/30 hover:bg-gold/5 text-zinc-400 hover:text-white'
              } disabled:opacity-50`}
              title={role}
            >
              <div className="flex items-center justify-between min-w-0">
                <span className="truncate mr-1">{role}</span>
                {isActive && <Check size={12} className="text-gold flex-shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Input */}
      <div className="border-t border-white/5 pt-5 mb-6">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={isCustomMode}
            onChange={(e) => setIsCustomMode(e.target.checked)}
            className="accent-gold h-4 w-4 rounded border-zinc-700 bg-zinc-950 focus:ring-gold"
          />
          <span className="text-xs font-bold text-zinc-300">Set a custom career target goal</span>
        </label>

        {isCustomMode && (
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. Quantitative Finance Developer, Web3 Smart Contract Engineer..."
            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || (isCustomMode && !custom.trim())}
        className="premium-button w-full justify-center py-3.5"
      >
        <span>
          {loading 
            ? 'Re-Generating Career Roadmap...' 
            : isCustomMode 
              ? 'Construct Custom Roadmap' 
              : 'Construct Dynamic Roadmap'
          }
        </span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

