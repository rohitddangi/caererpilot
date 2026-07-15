import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Trophy, Check, X, Award } from 'lucide-react';

export default function QuizEngine({ topicName = '', questions = [], onSubmit, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIdx];

  function handleOptionSelect(opt) {
    if (selectedOpt !== null) return; // disable double select
    setSelectedOpt(opt);
    if (opt === currentQuestion.answer) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  }

  function handleNext() {
    setSelectedOpt(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    const score = Math.floor((correctAnswersCount / questions.length) * 100);
    try {
      await onSubmit(score);
    } finally {
      setSubmitting(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass rounded-3xl p-6 max-w-lg w-full relative border border-gold/30 shadow-[0_0_50px_rgba(214,168,58,0.2)] bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-1.5">
              <HelpCircle className="text-gold animate-pulse" size={16} /> Adaptive Quiz
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{topicName} Assessment</p>
          </div>
          {!isFinished && (
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              Question {currentIdx + 1} of {questions.length}
            </span>
          )}
        </div>

        {!isFinished ? (
          <div>
            {/* Question Text */}
            <div className="text-sm font-bold text-zinc-200 mb-6 leading-relaxed">
              {currentQuestion.question}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOpt === opt;
                const isCorrect = opt === currentQuestion.answer;
                const showSuccess = selectedOpt !== null && isCorrect;
                const showFailure = isSelected && !isCorrect;

                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={selectedOpt !== null}
                    className={`w-full p-4 rounded-2xl text-left text-xs font-semibold border flex items-center justify-between transition-all ${
                      showSuccess
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold'
                        : showFailure
                        ? 'border-red-500/40 bg-red-500/10 text-red-400 font-bold'
                        : isSelected
                        ? 'border-gold bg-gold/10 text-white'
                        : 'border-white/5 bg-white/[0.01] hover:border-gold/30 hover:bg-gold/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {showSuccess && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                    {showFailure && <X size={14} className="text-red-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={selectedOpt === null}
              className="premium-button w-full justify-center py-3.5 disabled:opacity-50"
            >
              <span>{currentIdx + 1 === questions.length ? 'Show Results' : 'Next Question'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-4 animate-bounce">
              <Trophy size={32} />
            </div>
            <h4 className="text-lg font-black text-white">Quiz Completed!</h4>
            <p className="text-xs text-zinc-400 mt-1">Accuracy scored against topic parameters.</p>

            <div className="my-6 p-4 rounded-2xl bg-white/[0.01] border border-white/5 max-w-xs mx-auto">
              <div className="text-3xl font-black text-gold">
                {Math.floor((correctAnswersCount / questions.length) * 100)}%
              </div>
              <div className="text-[10px] text-zinc-500 font-bold mt-1">
                {correctAnswersCount} of {questions.length} Correct Answers
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-gold hover:bg-yellow-500 text-black text-xs font-black transition-colors flex items-center justify-center gap-1.5"
              >
                <Award size={14} />
                <span>{submitting ? 'Claiming...' : 'Claim XP'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
