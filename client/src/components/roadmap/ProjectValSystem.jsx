import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, Award, AlertTriangle, ArrowRight, BookOpen, Send, RefreshCw } from 'lucide-react';

export default function ProjectValSystem({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    projectName: '',
    githubUrl: '',
    liveUrl: '',
    techStack: '',
    description: ''
  });
  const [evalResult, setEvalResult] = useState(null);

  const mockEvaluationSteps = [
    'AI parser clones and scans repository outline...',
    'Analyzing code cleanliness and package setups...',
    'Assessing framework implementation details...',
    'Evaluating UI design and layout structure...',
    'Calibrating scoring variables...'
  ];

  async function handleVerify(e) {
    e.preventDefault();
    if (!formData.projectName || !formData.githubUrl) return;
    const res = await onSubmit(formData);
    if (res) {
      setEvalResult(res);
    }
  }

  function handleReset() {
    setEvalResult(null);
    setFormData({
      projectName: '',
      githubUrl: '',
      liveUrl: '',
      techStack: '',
      description: ''
    });
  }

  const items = evalResult ? [
    { label: 'Code Quality', val: evalResult.codeQuality || 0 },
    { label: 'Feature Completion', val: evalResult.features || 0 },
    { label: 'Complexity Index', val: evalResult.complexity || 0 },
    { label: 'UI/UX Design', val: evalResult.uiux || 0 },
    { label: 'Documentation', val: evalResult.documentation || 0 }
  ] : [];

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-white/[0.02]">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-gold" size={20} /> AI Project Validation Engine
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Submit your completed projects for AI code quality and feature review.</p>
        </div>
        {evalResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-[10px] font-bold text-zinc-300 hover:text-gold transition-all"
          >
            <RefreshCw size={11} />
            <span>Validate New Project</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center"
          >
            <Loader2 className="animate-spin text-gold mb-4" size={36} />
            <div className="text-sm font-bold text-zinc-300">Evaluating Project Repository</div>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
              Applying static analyzers and structural matching algorithms to calculate project score...
            </p>
          </motion.div>
        ) : !evalResult ? (
          <motion.form
            key="form"
            onSubmit={handleVerify}
            className="space-y-4 text-xs"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-zinc-400 font-bold mb-2">Project Name*</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Weather Dashboard"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-bold mb-2">GitHub Repository URL*</label>
                <input
                  type="url"
                  required
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="e.g. https://github.com/user/weather-dashboard"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-zinc-400 font-bold mb-2">Live Deployment URL (Optional)</label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="e.g. https://weather-dashboard.vercel.app"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-bold mb-2">Technologies Used*</label>
                <input
                  type="text"
                  required
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g. React, Tailwind, OpenWeather API"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-2">Project Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Give a short overview of features built and core system challenges resolved..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors resize-none leading-normal"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.projectName || !formData.githubUrl}
              className="premium-button w-full justify-center py-3.5"
            >
              <Send size={14} />
              <span>Submit Project for AI Review</span>
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-xs"
          >
            {/* Success / Warning banner */}
            {(evalResult.score || 85) >= 70 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                <Award className="text-emerald-400 flex-shrink-0" size={24} />
                <div>
                  <div className="text-sm font-bold text-white">Project Verification Successful!</div>
                  <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                    Your code parsed successfully. **+1000 XP awarded** to your career level profile.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                <AlertTriangle className="text-amber-400 flex-shrink-0" size={24} />
                <div>
                  <div className="text-sm font-bold text-white">Enhancements Required</div>
                  <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                    Project score fell below verification threshold (70). Improve features and re-submit.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Metrics */}
              <div className="space-y-4.5">
                <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                  <div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Overall Project Score</div>
                    <div className="text-3xl font-black text-gold mt-1">{evalResult.score || 85} <span className="text-sm text-zinc-500">/ 100</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10.5px] font-bold text-zinc-400 mb-1">
                        <span>{item.label}</span>
                        <span className="text-white font-bold">{item.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Text Feedback */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                  <h4 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BookOpen size={10} /> AI Code Analysis Feedback
                  </h4>
                  <p className="text-zinc-300 leading-relaxed font-semibold italic">
                    "{evalResult.feedback || 'Code quality is solid with robust folder setup and standard modular layout.'}"
                  </p>
                </div>

                {evalResult.improvements && evalResult.improvements.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Recommended Enhancements</div>
                    <div className="space-y-1.5">
                      {evalResult.improvements.map((imp, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-400 leading-normal">
                          <ArrowRight size={11} className="text-gold flex-shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
