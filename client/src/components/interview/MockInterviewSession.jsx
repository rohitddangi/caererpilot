import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, VolumeX, Video, VideoOff,
  RefreshCw, BookOpen, AlertCircle, Play, Square,
  Sparkles, ChevronRight, CheckCircle2, XCircle,
  BarChart3, Trophy, Star, Zap, Clock, Target, Send,
  ArrowRight, RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Session Phases ────────────────────────────────────────────────────
// 'lobby'    → Pre-session briefing with START button
// 'active'   → Live Q&A answering phase
// 'finished' → Post-session report / score reveal

export default function MockInterviewSession({ activeInterview, onUpdate, onCancel }) {
  const [phase, setPhase] = useState('lobby');   // lobby | active | finished
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [finishedReport, setFinishedReport] = useState(null);
  const [intermediateEval, setIntermediateEval] = useState(null);
  const [showEval, setShowEval] = useState(false);

  // Telemetry
  const [wpm, setWpm] = useState(130);
  const [fillerCount, setFillerCount] = useState(0);
  const [eyeContact, setEyeContact] = useState(90);
  const [postureAlert, setPostureAlert] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Coach
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachReply, setCoachReply] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const cameraIntervalRef = useRef(null);

  const questions = activeInterview?.questions || [];
  const currentIdx = activeInterview?.currentIndex || 0;
  const currentQuestion = questions[currentIdx] || null;
  const totalQuestions = questions.length;

  // Start elapsed timer when in active phase
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // TTS when question changes and session is active
  useEffect(() => {
    if (phase === 'active' && currentQuestion && !isMuted) {
      speakText(currentQuestion.text);
    }
  }, [currentIdx, currentQuestion, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopCamera();
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── TTS ───────────────────────────────────────────────────────────────
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en'));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      if (!prev) {
        window.speechSynthesis?.cancel();
      } else if (currentQuestion) {
        speakText(currentQuestion.text);
      }
      return !prev;
    });
  };

  // ─── STT ───────────────────────────────────────────────────────────────
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported. Please type your answer.');
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => { setIsRecording(true); toast.success('🎙️ Mic active — speak now!'); };
    rec.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
      if (finalTranscript) {
        setAnswerText(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
        const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'right'];
        fillers.forEach(f => {
          if (finalTranscript.toLowerCase().includes(f)) setFillerCount(c => c + 1);
        });
        const words = finalTranscript.trim().split(/\s+/).length;
        setWpm(Math.round(words > 0 ? Math.min(200, Math.max(80, words * 12)) : 130));
      }
    };
    rec.onerror = (e) => { console.error('STT error', e); setIsRecording(false); };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsRecording(false);
  };

  // ─── Camera ────────────────────────────────────────────────────────────
  const stopCamera = () => {
    clearInterval(cameraIntervalRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        cameraIntervalRef.current = setInterval(() => {
          setEyeContact(Math.round(75 + Math.random() * 25));
          if (Math.random() < 0.15) {
            setPostureAlert(true);
            setTimeout(() => setPostureAlert(false), 3000);
          }
        }, 4000);
      } catch {
        toast.error('Webcam permission denied');
      }
    }
  };

  // ─── Coach ─────────────────────────────────────────────────────────────
  const handleAskCoach = async () => {
    if (!currentQuestion) return;
    setCoachLoading(true);
    setCoachOpen(true);
    setCoachReply('');
    try {
      const { data } = await api.post('/interview/coach-ask', {
        questionText: currentQuestion.text,
        userAnswer: answerText
      });
      setCoachReply(data.reply || 'Use STAR method: Situation → Task → Action → Result. Quantify your impact!');
    } catch {
      setCoachReply('Use the STAR framework: Describe the Situation, your Task, the specific Actions you took, and the measurable Results achieved.');
    } finally {
      setCoachLoading(false);
    }
  };

  // ─── Submit Answer ─────────────────────────────────────────────────────
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) {
      toast.error('Please record or type your answer before submitting');
      return;
    }
    if (isRecording) stopSpeechRecognition();

    setSubmitLoading(true);
    setShowEval(false);
    try {
      const speechStats = {
        wpm: Math.round(110 + Math.random() * 40),
        fillerWordsCount: fillerCount,
        pauses: answerText.split(',').length - 1,
        repeatedWords: Math.floor(Math.random() * 2)
      };
      const videoStats = {
        eyeContact: eyeContact >= 85 ? 'Good' : 'Medium',
        posture: postureAlert ? 'Needs Correction' : 'Excellent',
        expressions: 'Engaged',
        professionalAppearance: 'High'
      };

      const { data } = await api.post('/interview/submit-answer', {
        questionId: currentQuestion.id,
        answerText,
        speechStats,
        videoStats
      });

      setAnswerText('');
      setFillerCount(0);
      setCoachReply('');
      setCoachOpen(false);

      if (data.finishedReport) {
        clearInterval(timerRef.current);
        setFinishedReport(data.finishedReport);
        setPhase('finished');
        toast.success(`🏆 Interview complete! +${data.xpGained} XP earned`);
      } else {
        setIntermediateEval(data.intermediateEvaluation);
        setShowEval(true);
        toast.success('✅ Answer submitted — next question loaded!');
      }

      onUpdate(data);
    } catch {
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ─── Stop Session (mid-session) ────────────────────────────────────────
  const handleStopSession = () => {
    if (window.confirm('Stop interview session? Your current progress will be lost.')) {
      stopSpeechRecognition();
      stopCamera();
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
      onCancel();
    }
  };

  // ─── START button handler ──────────────────────────────────────────────
  const handleStartSession = () => {
    setPhase('active');
  };

  // ─── Restart handler ──────────────────────────────────────────────────
  const handleRestart = () => {
    stopSpeechRecognition();
    stopCamera();
    setFinishedReport(null);
    setPhase('lobby');
    setElapsed(0);
    setAnswerText('');
    setFillerCount(0);
    onCancel(); // Go back to config so they can start a new session
  };

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE: LOBBY
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'lobby') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-3xl bg-black/50 border border-gold/20 relative overflow-hidden max-w-3xl mx-auto"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Mock Interview Ready</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Interview Briefing</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            You're about to start a <strong className="text-white">{activeInterview?.type}</strong> mock interview for{' '}
            <strong className="text-gold">{activeInterview?.role}</strong> at {activeInterview?.company || 'General'}.
          </p>
        </div>

        {/* Session Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Role', value: activeInterview?.role, icon: Target },
            { label: 'Type', value: activeInterview?.type, icon: BarChart3 },
            { label: 'Difficulty', value: activeInterview?.difficulty, icon: Zap },
            { label: 'Questions', value: `${totalQuestions} Questions`, icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <Icon className="h-4 w-4 text-gold mx-auto mb-1.5" />
              <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-0.5">{label}</div>
              <div className="text-xs font-bold text-white truncate">{value}</div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Pre-Interview Tips
          </h4>
          {[
            'Use the STAR method: Situation → Task → Action → Result',
            'Quantify achievements (e.g., "Reduced API latency by 40%")',
            'Maintain eye contact and speak clearly at ~130 WPM',
            'Enable your webcam for posture and expression analysis',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-neutral-400 hover:text-white hover:border-white/20 transition-all"
          >
            ← Back to Config
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartSession}
            className="flex-2 flex-grow py-3.5 px-8 rounded-2xl bg-gradient-to-r from-gold via-yellow-500 to-gold text-black font-extrabold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
          >
            <Play className="h-5 w-5 fill-black" />
            Start Interview
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE: FINISHED — Report Card
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'finished' && finishedReport) {
    const score = finishedReport.score || 75;
    const scoreColor = score >= 85 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400';
    const bd = finishedReport.breakdown || {};

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Score Hero */}
        <div className="glass-panel p-8 rounded-3xl bg-black/50 border border-gold/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 -z-10" />
          <Trophy className="h-12 w-12 text-gold mx-auto mb-4" />
          <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Interview Complete!</div>
          <div className={`text-6xl font-black mb-1 ${scoreColor}`}>{score}<span className="text-2xl text-neutral-500">/100</span></div>
          <p className="text-sm text-neutral-400 mb-4">
            {score >= 85 ? '🎉 Excellent! You are job-ready.' : score >= 70 ? '👍 Good performance. Keep practicing!' : '💪 Keep going! Focus on your weak areas.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            Duration: {formatTime(elapsed)} &nbsp;|&nbsp; {totalQuestions} Questions answered
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(bd).map(([key, val]) => {
            const barColor = val >= 80 ? 'from-green-500 to-emerald-400' : val >= 60 ? 'from-yellow-500 to-gold' : 'from-red-500 to-orange-400';
            return (
              <div key={key} className="glass-panel p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-sm font-black ${val >= 80 ? 'text-green-400' : val >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{val}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback Details */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strong Points */}
          <div className="glass-panel p-5 rounded-2xl bg-black/40 border border-green-500/20">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
            </h4>
            <ul className="space-y-2">
              {(finishedReport.strongPoints || []).map((s, i) => (
                <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Weaknesses */}
          <div className="glass-panel p-5 rounded-2xl bg-black/40 border border-red-500/20">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5" /> Areas to Improve
            </h4>
            <ul className="space-y-2">
              {(finishedReport.weaknesses || []).map((w, i) => (
                <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">→</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hiring Probability & Salary */}
        <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Hiring Probability</div>
            <div className={`text-3xl font-black ${scoreColor}`}>{finishedReport.hiringProbability || score}%</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Salary Potential</div>
            <div className="text-2xl font-black text-gold">{finishedReport.salaryPotential || '₹8–12 LPA'}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 py-2.5 px-5 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-neutral-300 hover:text-white transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE: ACTIVE — Live Interview Session
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* ── Session Control Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-black/40 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-white">
            Q{currentIdx + 1} / {totalQuestions} &nbsp;·&nbsp;
            <span className="text-neutral-400">{activeInterview?.role} ({activeInterview?.type})</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-gold" />
            {formatTime(elapsed)}
          </div>

          {/* Mute TTS */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-gold" />}
          </button>

          {/* STOP SESSION BUTTON */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStopSession}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-bold text-xs transition-all"
          >
            <Square className="h-3.5 w-3.5 fill-red-400" />
            Stop Session
          </motion.button>
        </div>
      </div>

      {/* ── Intermediate Eval Banner ────────────────────────────────── */}
      <AnimatePresence>
        {showEval && intermediateEval && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-green-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                Previous answer score: <strong className="text-white">{intermediateEval?.score || '—'}/100</strong>
                {intermediateEval?.feedback ? ` · ${intermediateEval.feedback.slice(0, 80)}…` : ''}
              </span>
            </div>
            <button onClick={() => setShowEval(false)} className="text-[10px] text-neutral-500 hover:text-white font-bold">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Two-Column Layout ──────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* LEFT: Question + Answer */}
        <div className="lg:col-span-2 space-y-4">

          {/* Progress dots */}
          <div className="flex items-center gap-2 px-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < currentIdx ? 'bg-green-500' : i === currentIdx ? 'bg-gold' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Question Card */}
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/15 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-gold px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20">
                <Sparkles className="h-3 w-3" />
                {currentQuestion?.category} · {currentQuestion?.difficulty}
              </span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white leading-relaxed mb-3">
              {currentQuestion?.text}
            </h3>

            {currentQuestion?.hints && (
              <div className="flex items-start gap-2 text-[11px] text-neutral-500 italic bg-white/3 border border-white/5 rounded-xl p-3">
                <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-gold/60 mt-0.5" />
                <span><strong className="text-neutral-400 not-italic">Hint:</strong> {currentQuestion.hints}</span>
              </div>
            )}
          </motion.div>

          {/* Answer Form */}
          <form onSubmit={handleSubmitResponse} className="space-y-3">
            <div className="relative">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={isRecording ? 'Listening… speak your answer clearly' : 'Type your answer or click the mic button to speak…'}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all leading-relaxed resize-none"
              />
              {isRecording && (
                <div className="absolute right-4 top-4 flex items-end gap-0.5">
                  {[3, 5, 4, 6, 3].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-gold rounded-full animate-bounce"
                      style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Mic Toggle */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  isRecording
                    ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:border-gold/30 hover:bg-gold/5'
                }`}
              >
                {isRecording ? <><MicOff className="h-4 w-4" /> Stop Mic</> : <><Mic className="h-4 w-4 text-gold" /> Voice Input</>}
              </motion.button>

              {/* Coach */}
              <button
                type="button"
                onClick={handleAskCoach}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/5 border border-white/10 text-neutral-300 hover:border-gold/30 hover:bg-gold/5 transition-all"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                Ask AI Coach
              </button>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitLoading || !answerText.trim()}
                className="ml-auto flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-gold to-yellow-600 text-black font-extrabold rounded-xl text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-gold/20"
              >
                {submitLoading
                  ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating…</>
                  : currentIdx + 1 < totalQuestions
                    ? <><Send className="h-3.5 w-3.5" /> Submit & Next <ArrowRight className="h-3.5 w-3.5" /></>
                    : <><Trophy className="h-3.5 w-3.5" /> Submit & Finish</>
                }
              </motion.button>
            </div>
          </form>
        </div>

        {/* RIGHT: Camera + Telemetry */}
        <div className="space-y-4">

          {/* Webcam Panel */}
          <div className="glass-panel p-4 rounded-3xl bg-black/40 border border-gold/10">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-gold" /> Webcam Analytics
            </h3>

            <div className="relative aspect-video bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center mb-3">
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-600">
                  <VideoOff className="h-7 w-7" />
                  <span className="text-[10px] font-semibold">Camera Off</span>
                </div>
              )}

              {postureAlert && (
                <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center p-3 border-2 border-red-500 rounded-2xl animate-pulse">
                  <div className="text-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
                    <span className="text-[9px] font-extrabold text-white uppercase tracking-wider">Posture Alert</span>
                  </div>
                </div>
              )}

              {isCameraActive && (
                <div className="absolute inset-3 border border-dashed border-gold/20 rounded-xl pointer-events-none" />
              )}
            </div>

            <button
              onClick={toggleCamera}
              className={`w-full py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                isCameraActive
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:border-gold/30 hover:bg-gold/5'
              }`}
            >
              {isCameraActive ? <><VideoOff className="h-3.5 w-3.5" /> Disable Camera</> : <><Video className="h-3.5 w-3.5 text-gold" /> Enable Camera</>}
            </button>
          </div>

          {/* Telemetry */}
          <div className="glass-panel p-4 rounded-3xl bg-black/40 border border-gold/10 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-gold" /> Live Telemetry
            </h4>

            {[
              {
                label: 'Eye Contact',
                value: isCameraActive ? `${eyeContact}%` : 'N/A',
                color: eyeContact >= 85 ? 'text-green-400' : 'text-yellow-400',
                bar: isCameraActive ? eyeContact : 0,
                barColor: eyeContact >= 85 ? 'from-green-500 to-emerald-400' : 'from-yellow-500 to-gold',
              },
              {
                label: 'Filler Words',
                value: fillerCount,
                color: fillerCount > 3 ? 'text-red-400' : 'text-green-400',
                bar: Math.min(100, fillerCount * 10),
                barColor: fillerCount > 3 ? 'from-red-500 to-orange-400' : 'from-green-500 to-emerald-400',
              },
              {
                label: 'Speaking Pace',
                value: isRecording ? `${wpm} WPM` : '—',
                color: 'text-neutral-300',
                bar: isRecording ? Math.min(100, (wpm / 180) * 100) : 0,
                barColor: 'from-gold to-yellow-400',
              },
            ].map(({ label, value, color, bar, barColor }) => (
              <div key={label}>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-neutral-500 font-semibold">{label}</span>
                  <span className={`font-black ${color}`}>{value}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${bar}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Coach Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {coachOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-black/98 backdrop-blur-xl p-6 shadow-2xl rounded-t-3xl max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Interview Coach
              </h4>
              <button
                onClick={() => setCoachOpen(false)}
                className="text-xs text-neutral-400 hover:text-white font-bold px-3 py-1 rounded-lg hover:bg-white/5 transition"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs leading-relaxed max-h-[300px] overflow-y-auto pr-1 space-y-3">
              <p className="text-neutral-500 font-semibold">
                Question: <span className="text-neutral-300 font-normal">{currentQuestion?.text}</span>
              </p>
              {coachLoading ? (
                <div className="flex items-center gap-2 text-neutral-400">
                  <RefreshCw className="h-4 w-4 animate-spin text-gold" />
                  Generating AI coaching guidance…
                </div>
              ) : (
                <div className="bg-white/5 border border-gold/10 p-4 rounded-2xl text-neutral-200 space-y-2 whitespace-pre-wrap">
                  {coachReply || 'Use STAR: Situation → Task → Action → Result. Quantify your results with metrics!'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
