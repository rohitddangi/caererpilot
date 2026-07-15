import express from 'express';
import { protect } from '../middleware/auth.jsx';
import { isDbReady } from '../config/db.jsx';
import User from '../models/User.jsx';
import { updateLocalUser } from '../services/localAuthStore.jsx';
import { generateCareerJson } from '../services/gemini.jsx';

const router = express.Router();
router.use(protect);

// Helper to level up based on XP
function calculateLevelDetails(xp, currentLevel, currentStreakObj) {
  // 1000 XP per level, Max Level 7
  const newLevel = Math.min(7, Math.max(1, Math.floor(xp / 1000) + 1));
  const levelNames = [
    '',
    'Beginner',
    'Learner',
    'Developer',
    'Advanced Developer',
    'Industry Ready',
    'Job Ready',
    'Professional'
  ];

  // Update streak if active today
  const todayStr = new Date().toISOString().split('T')[0];
  let currentStreak = currentStreakObj?.current || 0;
  let bestStreak = currentStreakObj?.best || 0;
  const lastActive = currentStreakObj?.lastActive || '';

  if (lastActive !== todayStr) {
    if (lastActive) {
      const lastActiveDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastActiveDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  }

  return {
    level: newLevel,
    levelName: levelNames[newLevel],
    streak: {
      current: currentStreak,
      best: bestStreak,
      lastActive: todayStr
    }
  };
}

// ─── Get Active Roadmap ──────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    let user = req.user;
    if (!user.activeRoadmap) {
      // Generate default Full Stack Developer roadmap
      const defaultRole = user.profile?.targetRole || 'Full Stack Developer';
      const result = await generateCareerJson('roadmapDeep', `Generate dynamic roadmap for ${defaultRole}`);
      result.targetRole = defaultRole;

      if (isDbReady()) {
        const dbUser = await User.findById(user.id);
        dbUser.activeRoadmap = result;
        await dbUser.save();
        user = dbUser;
      } else {
        user = await updateLocalUser(user.id, { activeRoadmap: result });
      }
    }
    res.json({
      activeRoadmap: user.activeRoadmap,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, best: 0, lastActive: '' }
    });
  } catch (error) {
    next(error);
  }
});

// ─── Generate Custom/New Roadmap ─────────────────────────────────────────────
router.post('/generate', async (req, res, next) => {
  try {
    const {
      targetRole,
      education,
      currentSkills,
      experienceLevel,
      languages,
      techStack,
      studyHours,
      placementDate
    } = req.body;

    if (!targetRole) return res.status(400).json({ message: 'Target role is required' });

    const contextQuery = `Generate a dynamic roadmap for the role of ${targetRole}. 
User Profile Context: 
- Education: ${education || 'Not specified'} 
- Experience Level: ${experienceLevel || 'Beginner'} 
- Core Current Skills: ${currentSkills || 'None'}
- Preferred Programming Languages: ${languages || 'Not specified'}
- Preferred Tech Stack: ${techStack || 'Not specified'}
- Study Hours Commitment: ${studyHours || '15'} hours/week
- Target Placement Deadline: ${placementDate || '4 months'}.`;

    const result = await generateCareerJson('roadmapDeep', contextQuery);
    result.targetRole = targetRole;

    let user;
    if (isDbReady()) {
      const dbUser = await User.findById(req.user.id);
      dbUser.activeRoadmap = result;
      // Reset progress metrics but preserve general XP
      dbUser.activeRoadmap.gamification = {
        level: dbUser.level || 1,
        levelName: result.gamification?.levelName || 'Beginner',
        xp: dbUser.xp || 0,
        streak: dbUser.streak || { current: 1, best: 1 }
      };
      await dbUser.save();
      user = dbUser;
    } else {
      const cleanRoadmap = { ...result };
      cleanRoadmap.gamification = {
        level: req.user.level || 1,
        levelName: result.gamification?.levelName || 'Beginner',
        xp: req.user.xp || 0,
        streak: req.user.streak || { current: 1, best: 1 }
      };
      user = await updateLocalUser(req.user.id, { activeRoadmap: cleanRoadmap });
    }

    res.json({
      activeRoadmap: user.activeRoadmap,
      xp: user.xp,
      level: user.level,
      streak: user.streak
    });
  } catch (error) {
    next(error);
  }
});

// ─── Toggle Module Completion ───────────────────────────────────────────────
router.patch('/toggle-module', async (req, res, next) => {
  try {
    const { phaseIndex, topicIndex, moduleName } = req.body;
    let user = req.user;
    if (!user.activeRoadmap) return res.status(400).json({ message: 'No active roadmap found' });

    const roadmap = { ...user.activeRoadmap };
    const phase = roadmap.skillTree?.[phaseIndex];
    if (!phase) return res.status(400).json({ message: 'Phase index invalid' });

    const topic = phase.topics?.[topicIndex];
    if (!topic) return res.status(400).json({ message: 'Topic index invalid' });

    // Ensure modules completions array is tracked
    if (!topic.completedModules) {
      topic.completedModules = [];
    }

    const idx = topic.completedModules.indexOf(moduleName);
    let addedXp = 0;

    if (idx === -1) {
      topic.completedModules.push(moduleName);
      addedXp = 150; // 150 XP per module completed
    } else {
      topic.completedModules.splice(idx, 1);
      addedXp = -150; // Deduct XP if unchecked
    }

    // Recalculate topic completion
    const allModulesCount = topic.modules?.length || 1;
    const isTopicCompleted = topic.completedModules.length === allModulesCount;
    const wasTopicCompleted = topic.completed;
    topic.completed = isTopicCompleted;

    if (isTopicCompleted && !wasTopicCompleted) {
      addedXp += 350; // Bonus +350 XP for fully completing a topic! (Total +500)
    } else if (!isTopicCompleted && wasTopicCompleted) {
      addedXp -= 350;
    }

    const newXp = Math.max(0, (user.xp || 0) + addedXp);
    const { level, levelName, streak } = calculateLevelDetails(newXp, user.level, user.streak);

    roadmap.gamification = {
      level,
      levelName,
      xp: newXp,
      streak
    };

    // Update readiness scores slightly
    const completedCount = roadmap.skillTree?.reduce((acc, ph) =>
      acc + (ph.topics?.filter(t => t.completed).length || 0), 0) || 0;
    const totalCount = roadmap.skillTree?.reduce((acc, ph) =>
      acc + (ph.topics?.length || 0), 0) || 1;
    const percent = Math.floor((completedCount / totalCount) * 100);

    roadmap.readiness = {
      internship: Math.min(100, 48 + Math.floor(percent * 0.5)),
      placement: Math.min(100, 32 + Math.floor(percent * 0.6))
    };

    let updatedUser;
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.activeRoadmap = roadmap;
      dbUser.xp = newXp;
      dbUser.level = level;
      dbUser.streak = streak;
      await dbUser.save();
      updatedUser = dbUser;
    } else {
      updatedUser = await updateLocalUser(user.id, {
        activeRoadmap: roadmap,
        xp: newXp,
        level,
        streak
      });
    }

    res.json({
      activeRoadmap: updatedUser.activeRoadmap,
      xp: updatedUser.xp,
      level: updatedUser.level,
      streak: updatedUser.streak
    });
  } catch (error) {
    next(error);
  }
});

// ─── Submit Project for Validation ─────────────────────────────────────────
router.post('/validate-project', async (req, res, next) => {
  try {
    const { projectName, githubUrl, liveUrl, techStack, description } = req.body;
    if (!projectName || !githubUrl) {
      return res.status(400).json({ message: 'Project name and GitHub URL are required' });
    }

    // Call Gemini (or mock evaluate)
    const prompt = `Project Name: ${projectName}\nGitHub: ${githubUrl}\nLive URL: ${liveUrl}\nTech Stack: ${techStack}\nDescription: ${description}`;
    const schemaHint = `{
      "score": 0, "codeQuality": 0, "features": 0, "complexity": 0, "uiux": 0, "deployment": 0, "documentation": 0,
      "feedback": "", "improvements": []
    }`;
    const result = await generateCareerJson('projectValidation', prompt, schemaHint);

    let user = req.user;
    let addedXp = 0;
    const isSuccess = (result.score || result) >= 70;

    if (isSuccess) {
      addedXp = 1000; // Award 1000 XP for building a verified project!
    }

    const newXp = (user.xp || 0) + addedXp;
    const { level, levelName, streak } = calculateLevelDetails(newXp, user.level, user.streak);

    const roadmap = user.activeRoadmap ? { ...user.activeRoadmap } : null;
    if (roadmap) {
      roadmap.gamification = { level, levelName, xp: newXp, streak };
      // Save project validation record in recommended projects if matches name
      const proj = roadmap.projectRecommendations?.find(p => p.name.toLowerCase() === projectName.toLowerCase());
      if (proj) {
        proj.completed = true;
        proj.score = result.score || 85;
      }
    }

    let updatedUser;
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.xp = newXp;
      dbUser.level = level;
      dbUser.streak = streak;
      if (roadmap) dbUser.activeRoadmap = roadmap;
      await dbUser.save();
      updatedUser = dbUser;
    } else {
      const updates = { xp: newXp, level, streak };
      if (roadmap) updates.activeRoadmap = roadmap;
      updatedUser = await updateLocalUser(user.id, updates);
    }

    res.json({
      evaluation: result,
      xp: updatedUser.xp,
      level: updatedUser.level,
      streak: updatedUser.streak,
      activeRoadmap: updatedUser.activeRoadmap
    });
  } catch (error) {
    next(error);
  }
});

// ─── Submit Quiz Answers ─────────────────────────────────────────────────────
router.post('/submit-quiz', async (req, res, next) => {
  try {
    const { score, topicName } = req.body; // e.g. score = 80 (percentage)
    let user = req.user;
    if (score === undefined || !topicName) {
      return res.status(400).json({ message: 'Quiz score and topic name are required' });
    }

    // Award +250 XP
    const addedXp = Math.floor((score / 100) * 250);
    const newXp = (user.xp || 0) + addedXp;
    const { level, levelName, streak } = calculateLevelDetails(newXp, user.level, user.streak);

    const roadmap = user.activeRoadmap ? { ...user.activeRoadmap } : null;
    if (roadmap) {
      roadmap.gamification = { level, levelName, xp: newXp, streak };
      // Find topic in skillTree and update confidence
      roadmap.skillTree?.forEach(phase => {
        phase.topics?.forEach(topic => {
          if (topic.name.toLowerCase() === topicName.toLowerCase()) {
            topic.quizScore = score;
            topic.confidenceScore = score; // Confidence is bound to highest quiz accuracy
          }
        });
      });
    }

    let updatedUser;
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.xp = newXp;
      dbUser.level = level;
      dbUser.streak = streak;
      if (roadmap) dbUser.activeRoadmap = roadmap;
      await dbUser.save();
      updatedUser = dbUser;
    } else {
      const updates = { xp: newXp, level, streak };
      if (roadmap) updates.activeRoadmap = roadmap;
      updatedUser = await updateLocalUser(user.id, updates);
    }

    res.json({
      xp: updatedUser.xp,
      level: updatedUser.level,
      streak: updatedUser.streak,
      activeRoadmap: updatedUser.activeRoadmap,
      addedXp
    });
  } catch (error) {
    next(error);
  }
});

// ─── Mentor Dynamic Chat ─────────────────────────────────────────────────────
router.post('/mentor-chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user;
    const roadmap = user.activeRoadmap || {};

    const completedTopics = [];
    const missingSkills = roadmap.skillGap?.missingSkills || [];
    roadmap.skillTree?.forEach(phase => {
      phase.topics?.forEach(t => {
        if (t.completed) completedTopics.push(t.name);
      });
    });

    const context = `
Role Target: ${roadmap.targetRole || 'Full Stack Developer'}
User Level: ${roadmap.currentProfile?.level || 'Beginner'}
Current XP: ${user.xp || 0}
Streak: ${user.streak?.current || 0} days
Completed Skills: ${completedTopics.join(', ') || 'None'}
Missing Skills: ${missingSkills.join(', ') || 'None'}
User Question: ${message}

Answer in 2-3 concise, actionable mentor sentences that directly references their completed skills or missing skills to guide their next learning step.
    `.trim();

    const result = await generateCareerJson('chat', context);
    res.json({ reply: result.reply || result });
  } catch (error) {
    next(error);
  }
});

export default router;
