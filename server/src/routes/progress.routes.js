import express from 'express';
import { protect } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';
import User from '../models/User.js';
import { updateLocalUser } from '../services/localAuthStore.js';
import { generateCareerJson } from '../services/gemini.js';

const router = express.Router();
router.use(protect);

// ─── Get progress summary ──────────────────────────────────────────────────────
router.get('/summary', async (req, res, next) => {
  try {
    const user = req.user;
    const completedTopics = user.completedTopics || [];
    const jobApplications = user.jobApplications || [];
    const completedInterviews = user.completedInterviews || [];
    const certificates = user.certificates || [];
    const resumeScore = user.profile?.resumeScore || 0;
    const interviewScore = user.profile?.interviewScore || 0;

    // Build heatmap from activityLog
    const activityLog = user.activityLog || [];
    const heatmapData = {};
    activityLog.forEach(entry => {
      const date = entry.date;
      if (!heatmapData[date]) heatmapData[date] = 0;
      heatmapData[date] += 1;
    });

    // Weekly chart data
    const today = new Date();
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });
      const dayActivities = activityLog.filter(e => e.date === dateStr);
      weeklyData.push({
        day: dayName,
        date: dateStr,
        learning: dayActivities.filter(e => e.type === 'learning').length,
        interviews: dayActivities.filter(e => e.type === 'interview').length,
        applications: dayActivities.filter(e => e.type === 'application').length,
        xp: dayActivities.reduce((sum, e) => sum + (e.xp || 0), 0),
      });
    }

    let roadmapPercent = 0;
    if (user.activeRoadmap) {
      const completedCount = user.activeRoadmap.skillTree?.reduce((acc, ph) =>
        acc + (ph.topics?.filter(t => t.completed).length || 0), 0) || 0;
      const totalCount = user.activeRoadmap.skillTree?.reduce((acc, ph) =>
        acc + (ph.topics?.length || 0), 0) || 1;
      roadmapPercent = Math.floor((completedCount / totalCount) * 100);
    }

    // Interview readiness
    let averageInterviewScore = interviewScore || 0;
    if (completedInterviews.length > 0) {
      const totalScore = completedInterviews.reduce((sum, intv) => sum + (intv.score || 0), 0);
      averageInterviewScore = Math.round(totalScore / completedInterviews.length);
    }

    const summary = {
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, best: 0 },
      modules: {
        skills: Math.round(user.activeSkillGap?.overallScores?.skillMatch || Math.min(100, (completedTopics.length * 10) || 60)),
        roadmap: roadmapPercent,
        learning: Math.min(100, (user.completedTopics?.length || 0) * 12 + 10),
        interview: averageInterviewScore,
        resume: resumeScore || 0,
        certifications: Math.min(100, certificates.length * 25),
        jobs: Math.min(100, jobApplications.length * 15),
        github: user.profile?.github ? 100 : 0,
        linkedin: user.profile?.linkedin ? 100 : 0,
        projects: Math.min(100, (user.profile?.projects?.length || 0) * 20 + 20),
      },
      heatmapData,
      weeklyData,
      badges: user.badges || [],
      totalActivities: activityLog.length,
    };
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// ─── Get AI Insights ──────────────────────────────────────────────────────────
router.post('/insights', async (req, res, next) => {
  try {
    const user = req.user;
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js';
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const prompt = `Generate 5 personalized career insights for a ${targetRole} candidate with skills: ${skills}. Include strengths, weaknesses, opportunities, and action items.`;
    const result = await generateCareerJson('progressInsights', prompt);
    res.json(Array.isArray(result) ? result : [result]);
  } catch (error) {
    next(error);
  }
});

// ─── Award badge ──────────────────────────────────────────────────────────────
router.post('/badge', async (req, res, next) => {
  try {
    const { badgeId, badgeName, badgeIcon } = req.body;
    const user = req.user;
    let badges = Array.isArray(user.badges) ? [...user.badges] : [];
    if (!badges.find(b => b.id === badgeId)) {
      badges.push({ id: badgeId, name: badgeName, icon: badgeIcon, earnedAt: new Date().toISOString() });
    }
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.badges = badges;
      await dbUser.save();
    } else {
      await updateLocalUser(user.id, { badges });
    }
    res.json({ badges, newBadge: { id: badgeId, name: badgeName } });
  } catch (error) {
    next(error);
  }
});

export default router;
