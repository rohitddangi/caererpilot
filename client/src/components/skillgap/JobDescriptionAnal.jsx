import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, RefreshCw, Landmark } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function JobDescriptionAnal({ activeSkillGap, onUpdate }) {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const targetRole = activeSkillGap?.targetRole || 'Full Stack Developer';
  const currentSkills = activeSkillGap?.categories?.flatMap(c => c.skills.map(s => s.name)) || [];

  const handleAnalyzeJd = async (e) => {
    e.preventDefault();
    if (!jdText.trim()) {
      toast.error('Please enter a job description to analyze');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/skillgap/analyze', {
        targetRole,
        currentSkills,
        jdText
      });
      
      // Calculate matches dynamically or extract from result
      const matchScore = data.activeSkillGap?.overallScores?.skillMatch || 70;
      const blockers = data.activeSkillGap?.gapAnalysis?.blockers || [];
      const missing = data.activeSkillGap?.gapAnalysis?.missingSkills || [];
      
      setResult({
        fitScore: matchScore,
        blockers: blockers.slice(0, 3),
        missingSkills: missing.slice(0, 5),
        salaryPotential: data.activeSkillGap?.overallScores?.salaryPotential || '₹8 – ₹15 LPA',
        hiringProbability: data.activeSkillGap?.overallScores?.hiringProbability || 'Medium'
      });

      toast.success('Job description analyzed successfully!');
      
      // Optionally trigger global data refresh
      if (onUpdate) {
        onUpdate(data);
      }
    } catch (err) {
      toast.error('Error analyzing job description');
    } finally {
      setLoading(false);
    }
  };

  const sampleJd = () => {
    setJdText(`We are looking for a Senior Engineer experienced in designing distributed systems. 
Must be proficient in Node.js, TypeScript, Next.js, and scaling PostgreSQL databases.
Experience with Docker, Redis caching, and AWS/Cloud hosting is highly preferred.
Ideal candidate has strong communication skills and is ready to own features end-to-end.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* JD Paste Form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              JD Extraction & Alignment Matcher
            </h2>
            <button
              onClick={sampleJd}
              className="text-[10px] text-gold font-bold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-lg hover:bg-gold/20 transition-all"
            >
              Load Sample JD
            </button>
          </div>
          
          <p className="text-xs text-neutral-400 mb-6">
            Paste target job descriptions from LinkedIn, Indeed, or company career pages below. Our extraction engine compares parameters against your active credentials instantly.
          </p>

          <form onSubmit={handleAnalyzeJd} className="space-y-4">
            <div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description text here..."
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold bg-white/5 p-3 rounded-xl">
              <span>Matching Target Stack: <strong className="text-white">{targetRole}</strong></span>
              <span>Detected Skills Count: <strong className="text-white">{currentSkills.length}</strong></span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold to-yellow-600 text-black font-bold py-3 rounded-xl text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/10"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              Compare Profile & Run Fit Check
            </button>
          </form>
        </div>
      </div>

      {/* Analysis Results Display */}
      <div>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-6"
            >
              <div className="text-center pb-4 border-b border-white/5">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Hiring Compatibility</span>
                <div className="text-4xl font-extrabold text-gold tracking-tight mt-1">{result.fitScore}%</div>
                <div className="mt-1 text-[11px] text-neutral-300 font-semibold flex items-center justify-center gap-1">
                  Fit Index: <span className="text-green-400 font-bold uppercase">{result.hiringProbability} Fit</span>
                </div>
              </div>

              {/* Salary details */}
              <div className="p-3 border border-white/5 bg-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-gold" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Estimated Salary Match</span>
                </div>
                <span className="text-xs font-extrabold text-white">{result.salaryPotential}</span>
              </div>

              {/* Critical Blockers */}
              {result.blockers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    Missing Hiring Blockers
                  </h4>
                  <ul className="space-y-1.5">
                    {result.blockers.map((b, idx) => (
                      <li key={idx} className="text-[10px] text-neutral-300 leading-relaxed flex items-start gap-1">
                        <span className="text-red-500">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing skills tags */}
              {result.missingSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Required Skill Gaps
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold font-bold"
                      >
                        {sk.name || sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[9px] text-neutral-500 font-medium leading-normal italic pt-2 text-center border-t border-white/5">
                Closing these blockers by verifying projects will raise fit scores to 85%+.
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 h-full flex flex-col justify-center items-center text-center min-h-[300px]">
              <FileText className="h-10 w-10 text-neutral-600 mb-3" />
              <h4 className="text-xs font-bold text-neutral-300">No Analysis Result Loaded</h4>
              <p className="text-[10px] text-neutral-500 max-w-[180px] mt-1.5 leading-normal">
                Paste an external job description to generate fit predictions and blockers.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
