import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Compass, Award, HelpCircle, Check, Play, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GDAndAptitudePrep() {
  const [activeSubTab, setActiveSubTab] = useState('aptitude'); // aptitude, gd
  
  // Aptitude state
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const aptitudeQuestions = [
    {
      id: 1,
      question: 'A train 120m long passes a telegraph post in 6 seconds. What is the speed of the train in km/hr?',
      options: ['60 km/hr', '72 km/hr', '80 km/hr', '90 km/hr'],
      answer: '72 km/hr',
      explanation: 'Speed = Distance / Time = 120 / 6 = 20 m/s. Converting to km/hr: 20 * (18 / 5) = 72 km/hr.'
    },
    {
      id: 2,
      question: 'Find the odd one out from the given list: 3, 5, 11, 14, 17, 21, 23.',
      options: ['14', '17', '21', '23'],
      answer: '14',
      explanation: 'All other numbers in the sequence are odd integers, except 14 which is an even integer.'
    },
    {
      id: 3,
      question: 'If log 27 = 1.431, then find the value of log 9.',
      options: ['0.954', '0.852', '0.724', '0.668'],
      answer: '0.954',
      explanation: 'log 27 = log(3^3) = 3 log 3 = 1.431 -> log 3 = 0.477. Therefore log 9 = log(3^2) = 2 log 3 = 2 * 0.477 = 0.954.'
    }
  ];

  const gdTopics = [
    {
      title: 'AI Ethics & Algorithmic Biases in Hiring Pipelines',
      category: 'AI / Technology',
      tips: [
        'Acknowledge AI automation speeds up parsing, but highlight risk of structural filter bias.',
        'Propose solutions like multi-model validations and human-in-the-loop overrides.',
        'Cite real regulatory benchmarks (like EU AI Act rules).'
      ]
    },
    {
      title: 'Monolith vs Microservices in Early-Stage Startups',
      category: 'Software Architecture',
      tips: [
        'Argue monolith saves deploy costs and reduces network debugging complexity for small teams.',
        'Acknowledge microservices offer scalability but increase network latency overhead.',
        'Conclude that starting with modular monoliths transitions cleanly to microservices later.'
      ]
    },
    {
      title: 'Remote Work vs In-Office Collaboration Synergy',
      category: 'Corporate Culture',
      tips: [
        'Discuss productivity yields and geographic hiring flexibility in remote models.',
        'Acknowledge office layouts foster spontaneous code reviews and alignment velocity.',
        'Suggest hybrid schedules as the balanced compromise.'
      ]
    }
  ];

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedAns(opt);
  };

  const handleCheckAnswer = () => {
    if (selectedAns === null) return;
    setIsAnswered(true);
    if (selectedAns === aptitudeQuestions[activeQIdx].answer) {
      setCorrectAnswersCount(c => c + 1);
      toast.success('Correct answer! +30 XP');
    } else {
      toast.error('Incorrect option selected.');
    }
  };

  const handleNextQuestion = () => {
    setSelectedAns(null);
    setIsAnswered(false);
    if (activeQIdx < aptitudeQuestions.length - 1) {
      setActiveQIdx(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setActiveQIdx(0);
    setSelectedAns(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setShowSummary(false);
  };

  const activeQ = aptitudeQuestions[activeQIdx];

  return (
    <div className="space-y-6">
      {/* Sub tabs switcher */}
      <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('aptitude')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 ${
            activeSubTab === 'aptitude' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Quantitative Aptitude Tests
        </button>
        <button
          onClick={() => setActiveSubTab('gd')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 ${
            activeSubTab === 'gd' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Group Discussion Topics
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />

        {/* 1. APTITUDE PRACTICE PANEL */}
        {activeSubTab === 'aptitude' && (
          <div>
            {!showSummary ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="h-4.5 w-4.5 text-gold" />
                    Cognitive & Aptitude Trainer
                  </h3>
                  <span className="text-xs text-neutral-400 font-semibold">
                    Question {activeQIdx + 1} of {aptitudeQuestions.length}
                  </span>
                </div>

                <div className="p-4 border border-white/5 bg-white/5 rounded-2xl">
                  <p className="text-xs font-bold text-white leading-relaxed">{activeQ.question}</p>
                </div>

                <div className="space-y-2.5">
                  {activeQ.options.map((opt, idx) => {
                    const isSelected = selectedAns === opt;
                    const isCorrect = opt === activeQ.answer;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          isAnswered
                            ? (isCorrect 
                              ? 'border-green-500 bg-green-500/10 text-green-400' 
                              : (isSelected 
                                ? 'border-red-500 bg-red-500/10 text-red-400' 
                                : 'border-white/5 bg-white/5 text-neutral-400'))
                            : (isSelected
                              ? 'border-gold bg-gold/10 text-white'
                              : 'border-white/5 bg-white/5 text-neutral-300 hover:border-white/10 hover:bg-white/10')
                        }`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <Check className="h-4 w-4 text-green-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <div className="p-4 border border-gold/15 bg-gold/5 rounded-2xl space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-gold tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Step-by-Step Explanation
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed font-semibold">{activeQ.explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/5">
                  {!isAnswered ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedAns === null}
                      className="px-5 py-2.5 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl text-xs disabled:opacity-50 hover:opacity-95 transition-all"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl text-xs hover:opacity-95 transition-all"
                    >
                      {activeQIdx < aptitudeQuestions.length - 1 ? 'Next Question' : 'Finish Test'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="h-16 w-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto text-gold animate-bounce">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Aptitude round completed</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    You answered <span className="text-gold font-bold">{correctAnswersCount}/{aptitudeQuestions.length}</span> questions correctly.
                  </p>
                </div>

                <div className="p-4 border border-gold/10 bg-gold/5 rounded-2xl max-w-sm mx-auto">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Rewards Claimed</span>
                  <div className="text-gold font-extrabold text-2xl mt-1">+{correctAnswersCount * 30} XP</div>
                  <span className="text-[9px] text-neutral-400 block mt-1">Practice daily aptitude tests to build speed algorithms.</span>
                </div>

                <button
                  onClick={handleReset}
                  className="px-5 py-2 border border-white/10 rounded-xl text-xs font-bold text-neutral-200 hover:text-white transition duration-150"
                >
                  Restart Practice
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. GROUP DISCUSSION GUIDE PANEL */}
        {activeSubTab === 'gd' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Landmark className="h-4.5 w-4.5 text-gold" />
                GD Core Guidelines & Hot Topics
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Study tech topics commonly selected by recruiters. Follow checklists to optimize leadership scoring.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {gdTopics.map((topic, idx) => (
                <div key={idx} className="p-4 border border-white/5 bg-white/5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-gold/20 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] uppercase font-bold text-gold px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20">{topic.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{topic.title}</h4>

                    <ul className="mt-4 space-y-2">
                      {topic.tips.map((tip, tIdx) => (
                        <li key={tIdx} className="text-[10px] text-neutral-300 leading-relaxed flex items-start gap-1.5 font-semibold">
                          <span className="text-gold font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* General evaluation points */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-gold" />
                Recruiter GD Grading Schema
              </h4>

              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-gold font-bold text-xs block">Communication (35%)</span>
                  <span className="text-[9px] text-neutral-400 block mt-1 font-semibold">Vocabulary choice & articulate speeds</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-gold font-bold text-xs block">Leadership (35%)</span>
                  <span className="text-[9px] text-neutral-400 block mt-1 font-semibold">Listening to peers & summarizing ideas</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-gold font-bold text-xs block">Technical Depth (30%)</span>
                  <span className="text-[9px] text-neutral-400 block mt-1 font-semibold">Citing real data models & case facts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
