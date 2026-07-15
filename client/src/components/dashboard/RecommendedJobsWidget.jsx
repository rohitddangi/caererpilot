import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Bookmark, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import WidgetShell from './WidgetShell.jsx';
import toast from 'react-hot-toast';

export default function RecommendedJobsWidget() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/jobs');
      // Sort by match score descending
      const sorted = [...data].sort((a, b) => b.matchScore - a.matchScore);
      setJobs(sorted.slice(0, 3));
    } catch (err) {
      console.error('[RecommendedJobsWidget] Failed to fetch recommended jobs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function updateJobAction(jobId, action) {
    setProcessingId(jobId);
    try {
      await api.patch(`/jobs/${jobId}`, { action });
      
      setJobs(items => items.map(j => {
        if (j.id === jobId) {
          if (action === 'save' || action === 'unsave') return { ...j, saved: action === 'save' };
          return { ...j, status: action };
        }
        return j;
      }));

      // Synchronize with AuthContext user object
      if (action === 'applied') {
        const currentApps = user?.jobApplications || [];
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob && !currentApps.some(a => a.id === jobId)) {
          const updatedApps = [...currentApps, { id: jobId, role: foundJob.title, company: foundJob.company, date: new Date().toLocaleDateString() }];
          setUser({ ...user, jobApplications: updatedApps });
        }
        toast.success('Application tracked successfully!');
      } else {
        toast.success(action === 'save' ? 'Job saved!' : 'Job unsaved.');
      }
    } catch (err) {
      toast.error('Action failed. Try again.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <WidgetShell
      title="AI Recommended Jobs"
      icon={Briefcase}
      badge="Top Matches"
      badgeColor="emerald"
      loading={loading}
      error={error}
      onRetry={fetchJobs}
      isEmpty={jobs.length === 0}
      emptyMessage="No recommended jobs found. Try configuring your target role to fetch custom matches."
      footer={
        <>
          <span>Updated relative to target role</span>
          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
          >
            <span>Job Center</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-black/20 hover:bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all relative group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 pr-2">
                <h3 className="font-bold text-white text-sm truncate leading-tight">{job.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">{job.company} • {job.location}</p>
              </div>
              <button
                disabled={processingId === job.id}
                onClick={() => updateJobAction(job.id, job.saved ? 'unsave' : 'save')}
                className={`p-2 rounded-xl border transition-all shrink-0 ${
                  job.saved
                    ? 'bg-gold border-gold text-black'
                    : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                aria-label={job.saved ? "Unsave job" : "Save job"}
              >
                {processingId === job.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Bookmark size={12} className={job.saved ? "fill-black" : ""} />
                )}
              </button>
            </div>

            {/* Match and details */}
            <div className="flex items-center justify-between mt-3 mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">{job.salary}</span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <Sparkles size={12} /> {job.matchScore}% Match
              </span>
            </div>

            {/* Apply action */}
            {job.status === 'applied' ? (
              <div className="w-full bg-white/10 text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center uppercase tracking-wider">
                Applied
              </div>
            ) : (
              <button
                disabled={processingId === job.id}
                onClick={() => updateJobAction(job.id, 'applied')}
                className="premium-button w-full py-2 text-xs font-bold flex justify-center items-center"
              >
                <Send size={12} className="mr-1.5" />
                <span>Apply Now</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
