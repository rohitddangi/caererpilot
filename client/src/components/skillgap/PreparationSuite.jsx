import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Briefcase, CheckCircle, Github, Play, ArrowRight, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function PreparationSuite({ activeSkillGap, xp, level, streak, onUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState('quizzes'); // quizzes, projects, companies
  
  // Quiz state
  const [selectedQuizTopic, setSelectedQuizTopic] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);

  // Project state
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [selectedTaskToValidate, setSelectedTaskToValidate] = useState('');
  const [projectSubmitLoading, setProjectSubmitLoading] = useState(false);

  const quizzes = activeSkillGap?.verificationQuizzes || [];
  const tasks = activeSkillGap?.verificationTasks || [];
  const companyReady = activeSkillGap?.companyReadiness || [];
  const certs = activeSkillGap?.certifications || { current: [], recommended: [] };
  const currentProjects = activeSkillGap?.projectGap?.currentProjects || [];
  const missingProjects = activeSkillGap?.projectGap?.missingProjects || [];

  // Quiz submission handler
  const handleStartQuiz = (topicObj) => {
    setSelectedQuizTopic(topicObj);
    setCurrentQuestionIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const handleSelectOption = (qIdx, option) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuizTopic) return;
    const questions = selectedQuizTopic.quiz;
    
    // Count score
    let score = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        score += 1;
      }
    });

    setGradingLoading(true);
    try {
      const { data } = await api.post('/skillgap/verify-quiz', {
        topic: selectedQuizTopic.topic,
        score,
        totalQuestions: questions.length
      });
      
      setQuizResult({
        score,
        total: questions.length,
        xpGained: data.xpGained
      });
      setQuizSubmitted(true);
      toast.success(`Quiz completed! You scored ${score}/${questions.length}`);
      
      // Notify parent to refresh user profile data
      if (onUpdate) {
        onUpdate(data);
      }
    } catch (err) {
      toast.error('Error submitting assessment details');
    } finally {
      setGradingLoading(false);
    }
  };

  // Project submission handler
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!selectedTaskToValidate) {
      toast.error('Please select a project scope to validate');
      return;
    }
    if (!projectRepoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setProjectSubmitLoading(true);
    try {
      const { data } = await api.post('/skillgap/submit-task', {
        taskId: selectedTaskToValidate,
        githubUrl: projectRepoUrl
      });
      toast.success(data.message || 'Project validated successfully!');
      setProjectRepoUrl('');
      setSelectedTaskToValidate('');
      if (onUpdate) {
        onUpdate(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to validate project repository link.');
    } finally {
      setProjectSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('quizzes'); setSelectedQuizTopic(null); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 ${
            activeSubTab === 'quizzes' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Verification Tests ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveSubTab('projects')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 ${
            activeSubTab === 'projects' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Project Gap Validator
        </button>
        <button
          onClick={() => setActiveSubTab('companies')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 ${
            activeSubTab === 'companies' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Company Prep Plans
        </button>
      </div>

      {/* RENDER ACTIVE SUB-TAB */}
      <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />

        {/* 1. QUIZ PANEL */}
        {activeSubTab === 'quizzes' && (
          <div>
            {!selectedQuizTopic ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gold" />
                  Adaptive Skill Verification Quizzes
                </h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Verify your core technical competencies. Passing these assessments instantly boosts matching parameters and awards career XP points.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {quizzes.map((qObj, idx) => (
                    <div key={idx} className="p-4 border border-white/5 bg-white/5 rounded-2xl flex flex-col justify-between hover:border-gold/30 transition-all">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{qObj.topic} Assessment</h4>
                        <span className="text-[10px] text-neutral-400 font-semibold">{qObj.quiz.length} Questions • Adaptive Scoring</span>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(qObj)}
                        className="mt-4 flex items-center justify-center gap-2 text-xs font-bold py-2 bg-gold text-black rounded-xl hover:opacity-95 transition-all"
                      >
                        <Play className="h-3 w-3 fill-black" />
                        Launch Quiz
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <h4 className="text-sm font-bold text-white">{selectedQuizTopic.topic} Core Verification</h4>
                  <button
                    onClick={() => setSelectedQuizTopic(null)}
                    className="text-xs text-neutral-400 hover:text-white font-semibold"
                  >
                    Back to List
                  </button>
                </div>

                {!quizSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex justify-between text-xs text-neutral-400 font-semibold">
                      <span>Question {currentQuestionIdx + 1} of {selectedQuizTopic.quiz.length}</span>
                      <span className="text-gold">Passing Score: 75%</span>
                    </div>

                    <div className="p-4 border border-white/5 bg-white/5 rounded-2xl">
                      <p className="text-xs font-bold text-white leading-relaxed">
                        {selectedQuizTopic.quiz[currentQuestionIdx].question}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {selectedQuizTopic.quiz[currentQuestionIdx].options.map((option, oIdx) => {
                        const isSelected = quizAnswers[currentQuestionIdx] === option;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(currentQuestionIdx, option)}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                              isSelected 
                                ? 'border-gold bg-gold/10 text-white' 
                                : 'border-white/5 bg-white/5 text-neutral-300 hover:border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        className="px-4 py-2 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 disabled:opacity-30 hover:text-white transition duration-150"
                      >
                        Previous
                      </button>

                      {currentQuestionIdx < selectedQuizTopic.quiz.length - 1 ? (
                        <button
                          disabled={!quizAnswers[currentQuestionIdx]}
                          onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                          className="px-5 py-2 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl text-xs disabled:opacity-50 hover:opacity-95 transition-all"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          disabled={Object.keys(quizAnswers).length < selectedQuizTopic.quiz.length || gradingLoading}
                          onClick={handleSubmitQuiz}
                          className="px-5 py-2 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl text-xs disabled:opacity-50 hover:opacity-95 transition-all flex items-center gap-1.5"
                        >
                          {gradingLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                          Submit Answers
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
                      <h4 className="text-lg font-bold text-white">Assessment Graded</h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        You scored <span className="text-gold font-bold">{quizResult.score}/{quizResult.total}</span> points.
                      </p>
                    </div>

                    <div className="p-4 border border-gold/10 bg-gold/5 rounded-2xl max-w-sm mx-auto">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Rewards Claimed</span>
                      <div className="text-gold font-extrabold text-2xl mt-1">+{quizResult.xpGained} XP</div>
                      <span className="text-[9px] text-neutral-400 block mt-1">Matched stats have been updated in your profile.</span>
                    </div>

                    <button
                      onClick={() => setSelectedQuizTopic(null)}
                      className="px-5 py-2 border border-white/10 rounded-xl text-xs font-bold text-neutral-200 hover:text-white transition duration-150"
                    >
                      Return to Assessments
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. PROJECT GAP VALIDATOR */}
        {activeSubTab === 'projects' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Github className="h-4 w-4 text-gold" />
                Proof-of-Work Project Gap Validator
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Paste your GitHub repository URLs below to validate specific project requirements. Proof of execution removes hiring blockers.
              </p>
            </div>

            {/* List of current validated & missing projects */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Validated Projects</h4>
                {currentProjects.length === 0 ? (
                  <div className="text-xs text-neutral-500 italic p-3 border border-white/5 rounded-xl">No projects validated yet.</div>
                ) : (
                  <div className="space-y-2">
                    {currentProjects.map((proj, idx) => (
                      <div key={idx} className="p-3 border border-green-500/20 bg-green-950/5 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {proj.name}
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          </div>
                          <span className="text-[9px] text-neutral-400 font-medium truncate max-w-[200px] block">{proj.url}</span>
                        </div>
                        <span className="text-[10px] font-bold text-green-400">Score: {proj.score}/100</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Missing Project Scopes</h4>
                {missingProjects.length === 0 ? (
                  <div className="text-xs text-green-500 font-semibold italic p-3 border border-green-500/10 rounded-xl">All project scopes validated!</div>
                ) : (
                  <div className="space-y-2">
                    {missingProjects.map((proj, idx) => (
                      <div key={idx} className="p-3 border border-white/5 bg-white/5 rounded-xl">
                        <div className="text-xs font-bold text-white">{proj.name}</div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">{proj.description}</p>
                        <span className="text-[8px] text-gold font-bold uppercase mt-2 block">Required Tech: {proj.tech}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmitProject} className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Submit Repository for Verification</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Target Project Scope</label>
                  <select
                    value={selectedTaskToValidate}
                    onChange={(e) => setSelectedTaskToValidate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                  >
                    <option value="">Select scope to unlock...</option>
                    {missingProjects.map((p, idx) => (
                      <option key={idx} value={p.name}>{p.name}</option>
                    ))}
                    {tasks.map((t, idx) => (
                      <option key={idx} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">GitHub Repository Link</label>
                  <input
                    type="text"
                    value={projectRepoUrl}
                    onChange={(e) => setProjectRepoUrl(e.target.value)}
                    placeholder="github.com/username/project-repo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={projectSubmitLoading}
                className="bg-gradient-to-r from-gold to-yellow-600 text-black font-bold py-2.5 px-6 rounded-xl text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {projectSubmitLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                Trigger Git Verification Engine
              </button>
            </form>
          </div>
        )}

        {/* 3. COMPANY PREPARATION ENGINE */}
        {activeSubTab === 'companies' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold" />
                Target Company Preparation Checklists
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Readiness scores matched against global recruiters. Close target checklists before starting pipelines.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {companyReady.map((comp, idx) => (
                <div key={idx} className="p-4 border border-white/5 bg-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">{comp.company}</span>
                      <span className="text-xs text-gold font-bold">{comp.readiness}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold to-yellow-500" style={{ width: `${comp.readiness}%` }} />
                    </div>

                    <ul className="mt-4 space-y-2">
                      {comp.prepPlan.map((plan, pIdx) => (
                        <li key={pIdx} className="text-[10px] text-neutral-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-gold font-bold">•</span>
                          <span>{plan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications panel */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <Award className="h-4 w-4 text-gold" />
                Recommended Certification Badges
              </h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Acquired Badges</h5>
                  {certs.current.length === 0 ? (
                    <div className="text-xs text-neutral-500 italic p-3 border border-white/5 rounded-xl">No badges verified yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {certs.current.map((cert, idx) => (
                        <div key={idx} className="p-2.5 border border-white/5 bg-white/5 rounded-xl text-xs text-white font-semibold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gold" />
                          {cert}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Recommended Templates</h5>
                  <div className="space-y-2">
                    {certs.recommended.map((cert, idx) => (
                      <div key={idx} className="p-3 border border-white/5 bg-white/5 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-white">{cert.name}</div>
                          <span className="text-[9px] text-neutral-400 font-semibold">{cert.provider}</span>
                        </div>
                        <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-md font-bold uppercase border border-gold/20">
                          {cert.relevance} Relevance
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
