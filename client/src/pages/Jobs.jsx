import { useEffect, useState } from 'react';
import { 
  Bookmark, Briefcase, Building, FileText, Send, Star, Zap, 
  CheckCircle2, ChevronRight, X, Search, Filter, Share2, 
  Compass, BarChart3, Bell, HelpCircle, ExternalLink, ShieldCheck, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../services/api.jsx';
import Loader from '../components/Loader.jsx';
import ProgressBar from '../components/dashboard/ProgressBar.jsx';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended'); // Recommended, Internships, Freelance, Applied, Saved, Tracker
  const [selectedJob, setSelectedJob] = useState(null); // For Cover Letter / Intelligence modal
  const [modalType, setModalType] = useState(null); // 'coverLetter', 'intel', 'eligibility'
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWorkplace, setFilterWorkplace] = useState('All'); // All, Remote, Hybrid, Onsite
  const [filterType, setFilterType] = useState('All'); // All, Full Time, Part Time, Contract
  const [filterExperience, setFilterExperience] = useState('All'); // All, Freshers, Experienced

  // Analytics state
  const [analytics, setAnalytics] = useState({
    total: 0,
    applied: 0,
    shortlisted: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
    responseRate: 0
  });

  useEffect(() => {
    fetchJobs();
    fetchAnalytics();
  }, []);

  async function fetchJobs() {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      toast.error('Failed to load personalized jobs');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnalytics() {
    try {
      const { data } = await api.get('/jobs/analytics');
      setAnalytics(data);
    } catch {
      // fallback
    }
  }

  async function updateJobAction(jobId, action) {
    try {
      const job = jobs.find(j => j.id === jobId);
      const { data } = await api.patch(`/jobs/${jobId}`, { 
        action,
        jobData: job || {}
      });
      setJobs(items => items.map(j => {
        if (j.id === jobId) {
          if (action === 'save' || action === 'unsave') return { ...j, saved: action === 'save' };
          return { ...j, status: action };
        }
        return j;
      }));
      toast.success(action === 'applied' ? 'Application tracked!' : `Job ${action}d`);
      fetchAnalytics();
    } catch (err) {
      toast.error('Action failed');
    }
  }

  async function openModal(job, type) {
    setSelectedJob(job);
    setModalType(type);
    setModalData(null);
    setModalLoading(true);
    
    try {
      if (type === 'coverLetter') {
        const { data } = await api.post('/jobs/cover-letter', { 
          jobTitle: job.title, 
          company: job.company, 
          jobDescription: job.description 
        });
        setModalData(data.letter);
      } else if (type === 'intel') {
        const { data } = await api.post('/jobs/company-intel', { 
          company: job.company, 
          role: job.title 
        });
        setModalData(data);
      } else if (type === 'eligibility') {
        // Mock eligibility evaluation parameters
        const isEligible = (job.matchScore || 70) >= 80 ? 'Eligible' : ((job.matchScore || 70) >= 55 ? 'Partially Eligible' : 'Not Ready');
        setModalData({
          status: isEligible,
          missing: job.missingSkills || ['System Design', 'Redis Caching'],
          probability: job.hiringProbability || 75,
          studyTime: isEligible === 'Eligible' ? '0 Weeks' : '2 Weeks',
          tips: isEligible === 'Eligible' 
            ? 'Your stack matches perfectly. Submit your application directly!' 
            : 'Complete the Next.js App Router roadmap module to bridge the remaining gaps.'
        });
      }
    } catch (err) {
      toast.error('Failed to generate insights');
      setSelectedJob(null);
    } finally {
      setModalLoading(false);
    }
  }

  // Auto-filtering based on tabs
  const displayedJobs = jobs.filter(j => {
    // 1. Tab Filter
    if (activeTab === 'Recommended') {
      const match = j.status !== 'applied' && j.type !== 'Internship' && j.type !== 'Freelance';
      if (!match) return false;
    }
    if (activeTab === 'Internships') {
      if (j.type !== 'Internship') return false;
    }
    if (activeTab === 'Freelance') {
      if (j.type !== 'Freelance') return false;
    }
    if (activeTab === 'Applied') {
      if (!['applied', 'shortlisted', 'interview', 'offered', 'rejected'].includes(j.status)) return false;
    }
    if (activeTab === 'Saved') {
      if (!j.saved) return false;
    }

    // 2. Search query filter
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 3. Workplace Workplace filter
    if (filterWorkplace !== 'All') {
      const isRemote = j.location.toLowerCase().includes('remote');
      if (filterWorkplace === 'Remote' && !isRemote) return false;
      if (filterWorkplace === 'Onsite' && isRemote) return false;
    }

    // 4. Experience filter
    if (filterExperience !== 'All') {
      const isExperienced = j.experience?.toLowerCase().includes('year') || j.experience?.toLowerCase().includes('yr');
      if (filterExperience === 'Freshers' && isExperienced) return false;
      if (filterExperience === 'Experienced' && !isExperienced) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* ─── PREMIUM JOBS SCOREBOARD HEADER ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-gold uppercase tracking-widest px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
              Opportunity Intelligence Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              AI Job & Internship Cockpit
            </h2>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span>Active Connectors: <strong className="text-zinc-300">Google Careers, Wellfound, GitHub</strong></span>
              <span>•</span>
              <span>Available Openings: <strong className="text-zinc-300">{jobs.length}</strong></span>
              <span>•</span>
              <span>Hiring Probability: <strong className="text-zinc-300">72% Average</strong></span>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl leading-normal italic mt-2">
              "Matching active skill profiles against verified recruiter APIs to close vacancies directly."
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs bar */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
        {['Recommended', 'Internships', 'Freelance', 'Saved', 'Applied', 'Tracker'].map(tab => {
          let count = 0;
          if (tab === 'Recommended') count = jobs.filter(j => j.status !== 'applied' && j.type !== 'Internship' && j.type !== 'Freelance').length;
          else if (tab === 'Internships') count = jobs.filter(j => j.type === 'Internship').length;
          else if (tab === 'Freelance') count = jobs.filter(j => j.type === 'Freelance').length;
          else if (tab === 'Saved') count = jobs.filter(j => j.saved).length;
          else if (tab === 'Applied') count = jobs.filter(j => ['applied', 'shortlisted', 'interview', 'offered'].includes(j.status)).length;
          
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {tab}
              {tab !== 'Tracker' && <span className="ml-2 text-[10px] opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="h-10 w-10 rounded-full border-4 border-gold/20 border-t-gold mb-4"
          />
          <div className="text-sm font-bold text-zinc-400">Syncing live opportunity pipelines...</div>
        </div>
      ) : activeTab === 'Tracker' ? (
        /* Tracker tab showing analytics graphs */
        <div className="grid gap-6 md:grid-cols-2">
          {/* Analytics Summary */}
          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-gold" />
              Application Funnel Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Tracked</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.total}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Response Rate</span>
                <div className="text-2xl font-black text-gold mt-1">{analytics.responseRate}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Interviewing</span>
                <div className="text-2xl font-black text-sky-400 mt-1">{analytics.interviewing}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Offers Claimed</span>
                <div className="text-2xl font-black text-green-400 mt-1">{analytics.offered}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-gold" />
              Funnel Conversions Ratios
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-zinc-300">Screening conversions</span>
                  <span className="text-gold">{Math.round((analytics.shortlisted / (analytics.total || 1)) * 100)}%</span>
                </div>
                <ProgressBar value={Math.round((analytics.shortlisted / (analytics.total || 1)) * 100)} height="h-2" color="from-gold to-yellow-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-zinc-300">Interview conversion</span>
                  <span className="text-sky-400">{Math.round((analytics.interviewing / (analytics.total || 1)) * 100)}%</span>
                </div>
                <ProgressBar value={Math.round((analytics.interviewing / (analytics.total || 1)) * 100)} height="h-2" color="from-sky-400 to-sky-600" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Jobs lists content */
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
          
          {/* Side Search & filter panel */}
          <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10 space-y-5">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Title, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50"
              />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Workplace Type</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Remote', 'Onsite'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilterWorkplace(opt)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filterWorkplace === opt ? 'bg-gold text-black' : 'bg-white/5 text-zinc-400 border border-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Experience Profile</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Freshers', 'Experienced'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilterExperience(opt)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filterExperience === opt ? 'bg-gold text-black' : 'bg-white/5 text-zinc-400 border border-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List display */}
          <div className="grid gap-6 md:grid-cols-1">
            <AnimatePresence>
              {displayedJobs.map(job => {
                const isEligible = (job.matchScore || 70) >= 80 ? 'Eligible' : ((job.matchScore || 70) >= 55 ? 'Partially Eligible' : 'Not Ready');
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={job.id} 
                    className="glass rounded-3xl p-6 relative overflow-hidden group border border-white/5 bg-black/20"
                  >
                    {job.urgent && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">Urgent Hiring</div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-gold text-[10px] font-black uppercase tracking-wider mb-2">
                          <Briefcase size={13} /> {job.type} • {job.location}
                        </div>
                        <h3 className="text-lg font-black text-white">{job.title}</h3>
                        <div className="text-zinc-400 text-xs mt-1 font-semibold">{job.company} • {job.salary}</div>
                      </div>
                      <button 
                        onClick={() => updateJobAction(job.id, job.saved ? 'unsave' : 'save')} 
                        className={`p-3 rounded-2xl border transition-all ${job.saved ? 'bg-gold border-gold text-black' : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'}`}
                      >
                        <Bookmark size={15} className={job.saved ? "fill-black" : ""} />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-5 font-semibold">{job.description}</p>

                    {/* Match metrics scores */}
                    <div className="grid grid-cols-4 gap-3 mb-5">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <div className="text-gold font-black text-lg">{job.matchScore}%</div>
                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Skill Fit</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <div className="text-green-400 font-black text-lg">{job.atsScore}%</div>
                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-1">ATS Score</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <div className="text-sky-400 font-black text-lg">{job.hiringProbability}%</div>
                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Selection</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center flex flex-col justify-center">
                        <span className={`text-[8px] font-black uppercase border rounded-md py-1 px-1.5 inline-block ${
                          isEligible === 'Eligible' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          isEligible === 'Partially Eligible' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {isEligible}
                        </span>
                      </div>
                    </div>

                    {/* Missing Skills blocker warning */}
                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div className="mb-5 bg-red-500/[0.02] border border-red-500/15 rounded-2xl p-3 flex items-start gap-3">
                        <Zap size={14} className="text-red-400 mt-0.5 shrink-0 animate-pulse" />
                        <div>
                          <div className="text-[10px] font-black text-red-400 uppercase">Hiring Blocker Gaps</div>
                          <div className="text-xs text-zinc-400 font-semibold mt-1">Missing Stack: {job.missingSkills.join(', ')}</div>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions triggers */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      {job.status !== 'applied' ? (
                        <button 
                          onClick={() => updateJobAction(job.id, 'applied')} 
                          className="premium-button flex-1 py-2 text-xs font-bold"
                        >
                          <Send size={13} />
                          <span>Track Application</span>
                        </button>
                      ) : (
                        <div className="flex-1 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center uppercase tracking-wider">
                          Status: {job.status}
                        </div>
                      )}
                      
                      {/* External Company application URL link */}
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ExternalLink size={13} /> Apply
                        </a>
                      )}

                      <button onClick={() => openModal(job, 'coverLetter')} className="ghost-button flex-1 py-2 text-xs bg-white/5 font-bold">
                        <FileText size={13} className="mr-1.5 inline text-zinc-400" /> Cover Letter
                      </button>
                      <button onClick={() => openModal(job, 'intel')} className="ghost-button p-2 bg-white/5" title="Company Intel">
                        <Building size={13} className="text-zinc-400" />
                      </button>
                      <button onClick={() => openModal(job, 'eligibility')} className="ghost-button p-2 bg-white/5" title="AI Eligibility Checks">
                        <HelpCircle size={13} className="text-zinc-400" />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {displayedJobs.length === 0 && (
              <div className="col-span-full py-20 text-center text-zinc-500">
                <div className="inline-block p-4 rounded-full bg-white/5 mb-4"><Briefcase size={32} /></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">No matching opportunities found</h3>
                <p className="text-xs text-zinc-400 mt-1">Check back later or update your skills stack configurations.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* AI Intelligence & Cover Letter Modal Overlay */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 text-gold rounded-xl">
                    {modalType === 'coverLetter' ? <FileText size={20} /> : <Building size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {modalType === 'coverLetter' ? 'AI Cover Letter Draft' : 
                       modalType === 'eligibility' ? 'AI Eligibility Evaluation' : 
                       'Company Intelligence Insights'}
                    </h3>
                    <p className="text-xs text-zinc-400">{selectedJob.company} • {selectedJob.title}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"><X size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap text-xs text-zinc-300 leading-relaxed font-semibold">
                {modalLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader />
                    <p className="mt-4 text-xs font-bold text-gold uppercase tracking-wider animate-pulse">Generating personalized insights...</p>
                  </div>
                ) : modalType === 'coverLetter' ? (
                  <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs text-zinc-300 leading-relaxed select-all">
                    {modalData}
                  </div>
                ) : modalType === 'eligibility' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-zinc-400">Match Status</span>
                      <span className="text-gold font-bold">{modalData?.status}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-zinc-400">Selection Probability</span>
                      <span className="text-sky-400 font-bold">{modalData?.probability}%</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/15">
                      <span className="text-[10px] font-black text-red-400 uppercase block mb-1">Missing Gaps</span>
                      <div className="text-zinc-300">{modalData?.missing?.join(', ')}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gold/5 border border-gold/15">
                      <span className="text-[10px] font-black text-gold uppercase block mb-1">AI Recommendation Tips</span>
                      <div className="text-zinc-300">{modalData?.tips}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div><h4 className="text-gold font-bold mb-2 uppercase tracking-wider text-xs">Overview</h4><p>{modalData?.overview}</p></div>
                    <div><h4 className="text-gold font-bold mb-2 uppercase tracking-wider text-xs">Culture</h4><p>{modalData?.culture}</p></div>
                    <div>
                      <h4 className="text-gold font-bold mb-2 uppercase tracking-wider text-xs">Hiring Process</h4>
                      <ul className="space-y-2">
                        {modalData?.hiringProcess?.map((step, i) => (
                          <li key={i} className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">{i+1}</span> {step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {!modalLoading && modalType === 'coverLetter' && (
                <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(modalData); toast.success('Copied to clipboard'); }} className="premium-button px-6 py-2 text-xs font-bold">Copy to Clipboard</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
