import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, ChevronDown, ChevronUp, FileText, CheckCircle, HelpCircle, Award, Landmark, Zap } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function InterviewHistory({ completedInterviews, onClearHistory }) {
  const [expandedId, setExpandedId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const handleToggle = (idx) => {
    setExpandedId(expandedId === idx ? null : idx);
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all mock interview performance logs?')) {
      return;
    }
    setClearing(true);
    try {
      const { data } = await api.post('/interview/clear-history');
      toast.success(data.message || 'Interview history logs cleared.');
      if (onClearHistory) {
        onClearHistory(data);
      }
    } catch (err) {
      toast.error('Failed to clear interview records.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Clear action */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Mock Logs</h3>
          <p className="text-[10px] text-neutral-400">Review past session feedback and transcript recordings.</p>
        </div>

        {completedInterviews.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-900/20 transition-all text-xs font-bold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Logs
          </button>
        )}
      </div>

      {completedInterviews.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl bg-black/40 border border-gold/10 text-center space-y-3">
          <FileText className="h-10 w-10 text-neutral-600 mx-auto" />
          <h4 className="text-xs font-bold text-neutral-300">No Past Sessions Profiled</h4>
          <p className="text-[10px] text-neutral-500 max-w-sm mx-auto leading-normal">
            Complete your first mock interview simulation to populate performance transcripts and detailed evaluations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedInterviews.map((mock, idx) => {
            const isOpen = expandedId === idx;
            const dateStr = mock.timestamp ? new Date(mock.timestamp).toLocaleDateString() : 'N/A';
            return (
              <div key={idx} className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                {/* Header button */}
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between items-start text-left hover:bg-white/5 transition-all gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{mock.role} Mock ({mock.type})</h4>
                      <span className="text-[9px] text-neutral-400 font-semibold uppercase">{dateStr} • Company: {mock.company}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
                    <span className="text-gold font-bold text-sm bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-md">
                      Score: {mock.score}%
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gold" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/5 px-5 py-5 space-y-6 bg-black/20 text-xs"
                    >
                      {/* Overall feedback */}
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">General Report Summary</span>
                        <p className="mt-1 text-neutral-300 leading-relaxed font-semibold">{mock.feedback}</p>
                      </div>

                      {/* Yield info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-3 border border-white/5 bg-white/5 rounded-xl flex items-center justify-between">
                          <span className="text-neutral-400 font-semibold">Projected CTC:</span>
                          <span className="text-gold font-bold">{mock.salaryPotential}</span>
                        </div>
                        <div className="p-3 border border-white/5 bg-white/5 rounded-xl flex items-center justify-between">
                          <span className="text-neutral-400 font-semibold">Hiring Fit:</span>
                          <span className="text-gold font-bold">{mock.hiringProbability}% Match</span>
                        </div>
                      </div>

                      {/* Transcripts logs */}
                      <div className="space-y-3 border-t border-white/5 pt-4">
                        <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4 text-gold" />
                          Dialogue Transcript Logs
                        </h5>

                        <div className="space-y-4">
                          {mock.answers.map((ans, aIdx) => (
                            <div key={aIdx} className="p-4 border border-white/5 bg-white/5 rounded-2xl space-y-2">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span className="text-gold">Q{aIdx + 1}:</span>
                                <span>{ans.questionText}</span>
                              </div>
                              <p className="text-neutral-300 leading-relaxed font-mono italic text-[11px] bg-black/25 p-3 border border-white/5 rounded-xl">
                                Answer: "{ans.userAnswer}"
                              </p>
                              {ans.evaluation && (
                                <div className="text-[10px] text-neutral-400 bg-gold/5 border border-gold/10 p-2.5 rounded-xl">
                                  <span className="text-gold font-bold block mb-1">AI Score: {ans.evaluation.score}%</span>
                                  {ans.evaluation.feedback}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
