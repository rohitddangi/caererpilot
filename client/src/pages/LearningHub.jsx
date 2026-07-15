import { useEffect, useState } from 'react';
import { 
  PlayCircle, FileText, CheckCircle2, Circle, Trophy, Brain, 
  ChevronRight, Zap, Star, Bookmark, Search, PlusCircle, 
  Calendar, Award, Sparkles, BookOpen, Clock, Heart, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../services/api.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';

// Circular rings progress
function ProgressRing({ value, label, size = 95, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-2 rounded-2xl bg-white/[0.01] border border-white/5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-neutral-800 fill-none" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none"
            stroke="url(#goldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-extrabold text-white">{value}%</span>
          <span className="text-[7px] font-black uppercase text-zinc-500 tracking-wider mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function LearningHub() {
  const { user, setUser } = useAuth();
  const [learningPath, setLearningPath] = useState(null);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [trackContent, setTrackContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [notes, setNotes] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('syllabus'); // syllabus, practice, analytics, bookmarks

  // Custom study plan modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [pace, setPace] = useState('Balanced');
  const [customPlan, setCustomPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Bookmarks collections
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetchPath();
  }, []);

  async function fetchPath() {
    try {
      const { data } = await api.get('/learning/path');
      setLearningPath(data);
      if (data?.recommended?.length > 0) {
        const firstTrack = data.recommended[0].track.toLowerCase().replace(/ /g, '-');
        setActiveTrackId(firstTrack);
        fetchTrack(firstTrack);
      } else {
        fetchTrack('full-stack');
      }
    } catch (err) {
      toast.error('Failed to load learning path');
      setLoading(false);
    }
  }

  async function fetchTrack(trackId) {
    setLoading(true);
    try {
      const { data } = await api.get(`/learning/track/${trackId}`);
      setTrackContent(data);
    } catch (err) {
      toast.error('Failed to load track content');
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(topic) {
    try {
      const { data } = await api.post('/learning/complete-topic', { 
        topicId: topic.id, 
        topicTitle: topic.title, 
        trackId: activeTrackId 
      });
      
      const updatedPhases = trackContent.phases.map(p => ({
        ...p,
        topics: p.topics.map(t => t.id === topic.id ? { ...t, completed: data.completed } : t)
      }));
      setTrackContent({ ...trackContent, phases: updatedPhases });
      
      setUser({ 
        ...user, 
        xp: data.totalXp, 
        completedTopics: data.completedTopics 
      });
      
      if (data.completed) toast.success(`+${data.xpGained} XP! Topic completed.`);
    } catch (err) {
      toast.error('Failed to update progress');
    }
  }

  async function generateNotes(topicTitle) {
    setLoadingNotes(true);
    setSelectedTopic(trackContent?.phases?.[0]?.topics?.[0] || { id: 'temp', title: topicTitle });
    try {
      const { data } = await api.post('/learning/notes', { topic: topicTitle, type: 'cheat sheet' });
      setNotes(data.notes);
      toast.success('AI cheat sheet compiled!');
    } catch (err) {
      toast.error('Failed to generate notes');
    } finally {
      setLoadingNotes(false);
    }
  }

  const handleGenerateStudyPlan = () => {
    setGeneratingPlan(true);
    // Simulate generating plan
    setTimeout(() => {
      setCustomPlan({
        weeklyHours,
        pace,
        dailyTarget: `${Math.round(weeklyHours / 5)} Hours / day`,
        completionEta: '6 Weeks',
        milestones: [
          'Week 1-2: Core concepts, syntax models, and basic tests',
          'Week 3-4: Advanced structures, scaling, caching frameworks',
          'Week 5-6: Capstone integration, project deployments, and validation tests'
        ]
      });
      setGeneratingPlan(false);
      toast.success('Study plan compiled by AI!');
    }, 1500);
  };

  const handleBookmarkResource = (res) => {
    if (bookmarks.some(b => b.title === res.title)) {
      setBookmarks(prev => prev.filter(b => b.title !== res.title));
      toast.success('Removed from bookmarks');
    } else {
      setBookmarks(prev => [...prev, res]);
      toast.success('Saved to bookmarks collection!');
    }
  };

  if (loading && !trackContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-300">
        <Loader />
        <span className="text-xs font-bold uppercase tracking-widest text-gold mt-4 animate-pulse">Syncing Learning Engine...</span>
      </div>
    );
  }

  const completedCount = user?.completedTopics?.length || 0;
  const learningProgressPercent = Math.min(100, Math.round((completedCount / 12) * 100));

  // Trusted certifications list
  const trustedCerts = [
    { name: 'Vercel Next.js Professional Certificate', provider: 'Vercel Inc.', val: 'Very High', cost: '$150' },
    { name: 'AWS Certified Developer - Associate', provider: 'Amazon Web Services', val: 'High', cost: '$150' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* ─── PREMIUM LEARNING SCOREBOARD HEADER ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                AI Mentor Classroom
              </span>
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-1">
                <Clock className="h-3 w-3 fill-yellow-500" />
                {weeklyHours} Hours Weekly Goal
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Syllabus: <span className="text-gold">{trackContent?.title || 'Learning Track'}</span>
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span>Goal Module: <strong className="text-zinc-300">{user?.profile?.targetRole || 'Full Stack Developer'}</strong></span>
              <span>•</span>
              <span>Progress: <strong className="text-zinc-300">{learningProgressPercent}% Complete</strong></span>
              <span>•</span>
              <span>Completion ETA: <strong className="text-zinc-300">September 2026</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="premium-button py-2.5 px-5 text-xs font-bold"
            >
              <Sparkles size={13} />
              <span>Generate AI Study Plan</span>
            </button>

            <button
              onClick={() => setActiveSubTab('syllabus')}
              className="px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <BookOpen size={13} />
              <span>Explore Syllabus</span>
            </button>
          </div>
        </div>

        {/* Level Progression */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-gold fill-gold" />
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Learning Streak</div>
              <div className="text-xs font-extrabold text-white">3 Day Streak · Active</div>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-gold to-yellow-500 rounded-full" style={{ width: `${learningProgressPercent}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase mt-1">
              <span>{completedCount} Topics Cleared</span>
              <span>12 Total Topics Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Switching Panel */}
      <div className="flex border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
        <div className="flex gap-2">
          {['syllabus', 'practice', 'analytics', 'bookmarks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex-shrink-0 ${
                activeSubTab === tab
                  ? 'border-gold text-gold bg-gold/[0.02]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'syllabus' && <BookOpen size={14} />}
              {tab === 'practice' && <Brain size={14} />}
              {tab === 'analytics' && <Trophy size={14} />}
              {tab === 'bookmarks' && <Bookmark size={14} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB CONTENT AREA ─── */}
      <div className="grid lg:grid-cols-[1fr_350px] gap-6 items-start">
        
        {/* LEFT COLUMN: Main Syllabus track or Practice/Analytics sections */}
        <div className="space-y-6">
          
          {activeSubTab === 'syllabus' && (
            <div className="space-y-4">
              {trackContent?.phases?.map((phase, pIdx) => (
                <div key={phase.id} className="glass rounded-3xl p-6 border border-white/5 bg-black/20">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px]">{pIdx + 1}</span>
                    {phase.title}
                  </h3>
                  
                  <div className="space-y-3">
                    {phase.topics.map(topic => (
                      <div 
                        key={topic.id} 
                        className={`border rounded-2xl p-4 transition-all ${
                          selectedTopic?.id === topic.id ? 'border-gold/50 bg-gold/5' : 'border-white/5 bg-black/40 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}>
                          <div className="flex gap-3">
                            <button onClick={(e) => { e.stopPropagation(); toggleComplete(topic); }} className="mt-0.5">
                              {topic.completed ? <CheckCircle2 className="text-gold" size={18} /> : <Circle className="text-zinc-500" size={18} />}
                            </button>
                            <div>
                              <div className={`text-xs font-bold ${topic.completed ? 'text-zinc-400 line-through' : 'text-white'}`}>{topic.title}</div>
                              <div className="text-[10px] text-zinc-500 mt-1">{topic.hours} hours • {topic.difficulty}</div>
                            </div>
                          </div>
                          <ChevronRight size={15} className={`text-zinc-500 transition-transform ${selectedTopic?.id === topic.id ? 'rotate-90' : ''}`} />
                        </div>

                        {/* Expanded details resources and cheat sheets actions */}
                        <AnimatePresence>
                          {selectedTopic?.id === topic.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-white/5 space-y-4 pl-7">
                                
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {topic.resources?.map((res, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                                      <a href={res.url || res.link} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 truncate flex-1">
                                        {res.type === 'video' ? <PlayCircle size={16} className="text-red-400" /> : <FileText size={16} className="text-blue-400" />}
                                        <div className="truncate">
                                          <div className="text-xs font-bold text-white truncate">{res.title}</div>
                                          <div className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">{res.free ? 'Free' : 'Paid'}</div>
                                        </div>
                                      </a>
                                      <button 
                                        onClick={() => handleBookmarkResource(res)} 
                                        className="p-1 text-zinc-500 hover:text-gold shrink-0 ml-2"
                                      >
                                        <Bookmark size={13} className={bookmarks.some(b => b.title === res.title) ? 'fill-gold text-gold' : ''} />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-3">
                                  <button onClick={() => generateNotes(topic.title)} className="ghost-button text-xs py-2 px-4 bg-white/5">
                                    <FileText size={13} className="mr-1.5 inline" /> AI Cheat Sheet
                                  </button>
                                  <button onClick={() => generateNotes(`${topic.title} Conceptual Quick Quiz`)} className="ghost-button text-xs py-2 px-4 bg-white/5">
                                    <Brain size={13} className="mr-1.5 inline" /> Take AI Quiz
                                  </button>
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSubTab === 'practice' && (
            <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="h-4.5 w-4.5 text-gold" />
                Adaptive Practice Exercises
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[8px] font-black uppercase text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20 inline-block">Coding Challenge</span>
                  <h4 className="text-xs font-bold text-white">Reverse Linked List (In-Place)</h4>
                  <p className="text-[10px] text-zinc-400">Implement recursion models on memory indices.</p>
                  <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-[10px] font-black text-gold inline-flex items-center gap-1 uppercase pt-2">
                    Start Code <ChevronRight size={10} />
                  </a>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[8px] font-black uppercase text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 inline-block">System Design Lab</span>
                  <h4 className="text-xs font-bold text-white">Redis Cache Eviction Strategy</h4>
                  <p className="text-[10px] text-zinc-400">Configure key expiry cache rules locally.</p>
                  <a href="https://roadmap.sh" target="_blank" rel="noreferrer" className="text-[10px] font-black text-gold inline-flex items-center gap-1 uppercase pt-2">
                    Review Patterns <ChevronRight size={10} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'analytics' && (
            <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-gold" />
                Gamification learning metrics
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ProgressRing value={learningProgressPercent} label="Syllabus Progress" />
                <ProgressRing value={80} label="Consistency rate" />
                <ProgressRing value={68} label="Quiz accuracy" />
              </div>
            </div>
          )}

          {activeSubTab === 'bookmarks' && (
            <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="h-4.5 w-4.5 text-gold" />
                Bookmarked Study Resources ({bookmarks.length})
              </h3>
              {bookmarks.length === 0 ? (
                <div className="text-xs text-zinc-500 italic py-10 text-center">No resources bookmarked yet. Click the bookmark icon inside topics to save resources.</div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((res, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div>
                        <span className="font-bold text-white block">{res.title}</span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 block">{res.free ? 'Free' : 'Paid'}</span>
                      </div>
                      <a href={res.url || res.link} target="_blank" rel="noreferrer" className="text-gold font-bold">Open Link</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI Study Plan overview & recommended Certifications */}
        <div className="space-y-6">
          
          {/* AI Notes Cheat Sheet display */}
          {selectedTopic && (
            <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-gold" />
                AI Notes: {selectedTopic.title}
              </h3>
              {loadingNotes ? (
                <div className="text-center py-8 opacity-50">
                  <Loader />
                  <p className="text-[10px] text-zinc-500 mt-2">Generating cheat sheet...</p>
                </div>
              ) : notes ? (
                <div className="text-[11px] text-zinc-400 leading-relaxed font-semibold max-h-56 overflow-y-auto custom-scrollbar pr-1 whitespace-pre-wrap border border-white/5 p-3 rounded-xl bg-black/20">
                  {notes}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 italic text-center py-6">Click 'AI Cheat Sheet' inside the topic to generate notes.</div>
              )}
            </div>
          )}

          {/* Active custom generated study plan */}
          <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-gold" />
              Active AI Study Plan
            </h3>
            {customPlan ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[8px] text-zinc-500 block uppercase">ETA duration</span>
                    <span className="text-white text-xs block mt-0.5">{customPlan.completionEta}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[8px] text-zinc-500 block uppercase">Daily Hours</span>
                    <span className="text-gold text-xs block mt-0.5">{customPlan.dailyTarget}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Study Milestones</span>
                  {customPlan.milestones.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 text-[10px] text-zinc-400 font-semibold leading-relaxed">
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-zinc-500 leading-normal">
                Click **Generate AI Study Plan** to calibrate your available study hours and build weekly milestones.
              </div>
            )}
          </div>

          {/* Trusted Certifications Recommender */}
          <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-gold" />
              Target Professional Certifications
            </h3>
            <div className="space-y-3">
              {trustedCerts.map((cert, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-gold uppercase px-2 py-0.5 rounded bg-gold/10 border border-gold/20 inline-block">
                      Relevance: {cert.val}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold">{cert.cost} Exam</span>
                  </div>
                  <h4 className="text-[10px] font-black text-zinc-300 leading-relaxed">{cert.name}</h4>
                  <span className="text-[9px] text-zinc-500 block">Issued by {cert.provider}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ─── SCHEDULE STUDY PLAN MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-gold" />
                  Calibrate AI Study Plan
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Available Study Hours / Week</label>
                  <input
                    type="number"
                    min={5}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Pace</label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                  >
                    <option value="Relaxed">Relaxed (Slow transition)</option>
                    <option value="Balanced">Balanced (Standard transition)</option>
                    <option value="Aggressive">Aggressive (Fast placements preparation)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateStudyPlan}
                  disabled={generatingPlan}
                  className="premium-button w-full justify-center py-2.5 text-xs font-bold"
                >
                  {generatingPlan ? 'Generating Plan...' : 'Compile Study Milestones'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg className="hidden">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
