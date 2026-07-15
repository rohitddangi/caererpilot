import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, Zap, Briefcase, Award, Mic2, Code2, Flame, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WidgetShell from './WidgetShell.jsx';

const ICONS = {
  FileText,
  Zap,
  Briefcase,
  Award,
  Mic2,
  Code2,
  Flame,
  CheckCircle2
};

export default function ActivityTimeline() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const activities = [];

  if (user) {
    let idCounter = 1;

    // Add completed interviews
    if (user.completedInterviews && user.completedInterviews.length > 0) {
      user.completedInterviews.forEach((item, idx) => {
        activities.push({
          id: idCounter++,
          text: `Completed mock interview for ${item.role || 'Software Role'} — scored ${item.score || '7.5'}/10`,
          time: item.date ? `${item.date}` : `${idx + 1}d ago`,
          icon: 'Mic2',
          link: '/interview'
        });
      });
    }

    // Add job applications
    if (user.jobApplications && user.jobApplications.length > 0) {
      user.jobApplications.forEach((app, idx) => {
        activities.push({
          id: idCounter++,
          text: `Applied to ${app.role} @ ${app.company}`,
          time: app.date ? `${app.date}` : `${idx + 1}d ago`,
          icon: 'Briefcase',
          link: '/jobs'
        });
      });
    }

    // Add resume analysis if score exists
    if (user.profile?.resumeScore > 0) {
      activities.push({
        id: idCounter++,
        text: `Resume analyzed — ATS score is ${user.profile.resumeScore}%`,
        time: '1d ago',
        icon: 'FileText',
        link: '/command-center'
      });
    }

    // Add skill stack configured
    if (user.profile?.skills && user.profile.skills.length > 0) {
      activities.push({
        id: idCounter++,
        text: `Configured skill stack with ${user.profile.skills.length} skills`,
        time: '2d ago',
        icon: 'Zap',
        link: '/roadmap'
      });
    }

    // Add certifications
    if (user.certificates && user.certificates.length > 0) {
      user.certificates.forEach((cert) => {
        activities.push({
          id: idCounter++,
          text: `Earned certification: ${cert.name || cert}`,
          time: cert.date || '3d ago',
          icon: 'Award',
          link: '/certificates'
        });
      });
    } else if (user.profile?.certifications && user.profile.certifications.length > 0) {
      user.profile.certifications.forEach((cert) => {
        activities.push({
          id: idCounter++,
          text: `Added certification: ${cert}`,
          time: '3d ago',
          icon: 'Award',
          link: '/certificates'
        });
      });
    }

    // Add roadmap updated
    if (user.activeRoadmap) {
      activities.push({
        id: idCounter++,
        text: `Roadmap updated: ${user.profile?.targetRole || 'Developer'} path active`,
        time: '3d ago',
        icon: 'Code2',
        link: '/roadmap'
      });
    }

    // Add joined activity (always show this)
    const joinDate = user.createdAt 
      ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
      : 'recently';
    
    activities.push({
      id: idCounter++,
      text: `Joined CareerPilot AI — Account initialized`,
      time: joinDate,
      icon: 'Flame',
      link: '/profile'
    });
  }

  // Sort activities or keep order (newest first, since we pushed dynamically, let's keep it clean)
  const items = activities.slice(0, 5);

  return (
    <WidgetShell
      title="Recent Activities"
      icon={History}
      isEmpty={items.length === 0}
      emptyMessage="No activity history logged yet."
      headerRight={
        <button 
          onClick={() => navigate('/progress')}
          className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1 group"
        >
          View Full <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </button>
      }
    >
      <div className="relative flex-1">
        {/* Vertical Line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-gold/50 via-white/10 to-transparent" />

        <div className="space-y-4">
          {items.map((activity, index) => {
            const Icon = ICONS[activity.icon] || Flame;
            
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => navigate(activity.link)}
                className="relative pl-10 group cursor-pointer"
              >
                {/* Timeline Node */}
                <div className="absolute left-[7px] top-1.5 h-5 w-5 rounded-full bg-black border-2 border-gold/40 group-hover:border-gold group-hover:shadow-[0_0_10px_rgba(214,168,58,0.5)] transition-all flex items-center justify-center z-10">
                  <div className="h-1.5 w-1.5 rounded-full bg-gold/80 group-hover:bg-gold transition-colors" />
                </div>
                
                <div className="bg-black/20 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-2xl p-3 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 text-zinc-400 group-hover:text-gold transition-colors shrink-0">
                        <Icon size={16} />
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors leading-snug break-words">
                        {activity.text}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap pt-1 shrink-0">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}
