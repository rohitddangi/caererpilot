import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { Bell, X, AlertCircle, Sparkles, Calendar, Award, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import WidgetShell from './WidgetShell.jsx';

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const cached = localStorage.getItem('cp_notif_sound');
    return cached !== 'false';
  });

  useEffect(() => {
    if (!user) return;

    // Check dismissed keys in localStorage
    const today = new Date().toDateString();
    const dismissedKey = `cp_dismissed_notifs_${user.id || 'guest'}_${today}`;
    const dismissedIds = JSON.parse(localStorage.getItem(dismissedKey) || '[]');

    const dynamicNotifications = [];
    let idCounter = 1;

    // Helper to push only if not dismissed
    const pushNotif = (notif) => {
      const currentId = idCounter++;
      if (!dismissedIds.includes(currentId)) {
        dynamicNotifications.push({ ...notif, id: currentId });
      }
    };

    // 1. Email verification alert
    if (!user.emailVerified) {
      pushNotif({
        type: 'alert',
        title: 'Verify Email Address',
        body: 'Please check your inbox to verify your email and secure your account.',
        time: '1h',
        read: false
      });
    }

    // 2. Resume upload alert
    if (!user.profile?.resumeScore) {
      pushNotif({
        type: 'alert',
        title: 'Resume Needs Optimization',
        body: 'Upload your resume to get your dynamic ATS optimization score and recommendations.',
        time: '2h',
        read: false
      });
    }

    // 3. Target role alert
    if (!user.profile?.targetRole) {
      pushNotif({
        type: 'reminder',
        title: 'Set Target Role',
        body: 'Configure your target role in settings to adapt the dashboard metrics and timeline goals.',
        time: '3h',
        read: false
      });
    }

    // 4. Skills configuration
    if (!user.profile?.skills || user.profile.skills.length === 0) {
      pushNotif({
        type: 'alert',
        title: 'Define Core Skills',
        body: 'Specify your skills stack to generate target role gap recommendations.',
        time: '4h',
        read: false
      });
    }

    // 5. Streak active milestone
    if (user.streak?.current > 0) {
      pushNotif({
        type: 'milestone',
        title: `🎉 ${user.streak.current}-Day Streak!`,
        body: 'Keep learning and completing career prep tasks to grow your momentum!',
        time: '1d',
        read: false
      });
    }

    // 6. Job Applications reminder
    if (user.jobApplications && user.jobApplications.length > 0) {
      pushNotif({
        type: 'match',
        title: 'New Job Available matching stack',
        body: '3 new Frontend Developer roles align with React/TypeScript skills in your stack.',
        time: '12h',
        read: false
      });
    }

    // 7. Interview Reminder
    if (user.profile?.interviewScore > 0) {
      pushNotif({
        type: 'reminder',
        title: 'Interview Preparation Reminder',
        body: 'Review your last AI mock interview feedback to address communication gaps.',
        time: '5h',
        read: false
      });
    }

    // Add default recommendations so the panel isn't empty if they are doing well
    if (dynamicNotifications.length < 3) {
      pushNotif({
        type: 'cert',
        title: 'Recommended Certification',
        body: 'AWS Cloud Practitioner / PyTorch fundamentals align with your profile growth targets.',
        time: '1d',
        read: true
      });
      pushNotif({
        type: 'match',
        title: 'New Mock Matches Available',
        body: 'AI-suggested internships and role profiles updated for your skill level.',
        time: '2d',
        read: true
      });
    }

    setItems(dynamicNotifications);
  }, [user]);

  const dismiss = (id) => {
    // Save to localStorage dismissed list
    const today = new Date().toDateString();
    const dismissedKey = `cp_dismissed_notifs_${user?.id || 'guest'}_${today}`;
    const dismissedIds = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    dismissedIds.push(id);
    localStorage.setItem(dismissedKey, JSON.stringify(dismissedIds));

    setItems(items.filter(item => item.id !== id));
  };

  const markAllRead = () => {
    setItems(items.map(item => ({ ...item, read: true })));
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('cp_notif_sound', String(nextVal));
  };

  const unreadCount = items.filter(i => !i.read).length;

  return (
    <WidgetShell
      title="Notifications"
      icon={Bell}
      badge={unreadCount > 0 ? `${unreadCount} New` : null}
      badgeColor="gold"
      isEmpty={items.length === 0}
      emptyMessage="You're all caught up! No notifications."
      headerRight={
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute notification sounds' : 'Unmute notification sounds'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar max-h-[300px]">
        <AnimatePresence>
          {items.slice(0, 5).map((notif, index) => {
            const icons = {
              alert: <AlertCircle size={16} className="text-red-400" />,
              match: <Sparkles size={16} className="text-blue-400" />,
              reminder: <Calendar size={16} className="text-amber-400" />,
              cert: <Award size={16} className="text-emerald-400" />,
              milestone: <Award size={16} className="text-gold" />
            };
            
            const bgs = {
              alert: 'bg-red-500/10 border-red-500/20',
              match: 'bg-blue-500/10 border-blue-500/20',
              reminder: 'bg-amber-500/10 border-amber-500/20',
              cert: 'bg-emerald-500/10 border-emerald-500/20',
              milestone: 'bg-gold/10 border-gold/20'
            };

            return (
              <motion.div
                 key={notif.id}
                 layout
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.2, delay: index * 0.05 }}
                 className={`relative p-3.5 rounded-2xl border transition-all ${
                   notif.read ? 'bg-black/20 border-white/5 opacity-70' : bgs[notif.type]
                 }`}
              >
                {!notif.read && (
                  <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                )}
                
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">{icons[notif.type]}</div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className={`text-xs sm:text-sm font-bold mb-0.5 ${notif.read ? 'text-white/80' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-snug mb-2">{notif.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500">{notif.time}</span>
                      <button 
                        onClick={() => dismiss(notif.id)}
                        className="text-zinc-500 hover:text-white transition-colors"
                        aria-label="Dismiss notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </WidgetShell>
  );
}
