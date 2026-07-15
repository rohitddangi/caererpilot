import express from 'express';
import { protect } from '../middleware/auth.jsx';
import { isDbReady } from '../config/db.jsx';
import User from '../models/User.jsx';
import { updateLocalUser } from '../services/localAuthStore.jsx';
import { generateCareerJson } from '../services/gemini.jsx';

const router = express.Router();
router.use(protect);

// Level up calculator based on XP
function calculateLevelDetails(xp, currentLevel, currentStreakObj) {
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

// ─── Get Active Skill Gap Analysis ───────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    let user = req.user;
    if (!user.activeSkillGap) {
      const defaultRole = user.profile?.targetRole || 'Full Stack Developer';
      const result = await generateCareerJson('skillGapDeep', `Generate deep skill gap analysis for target role: ${defaultRole}`);
      result.targetRole = defaultRole;

      if (isDbReady()) {
        const dbUser = await User.findById(user.id);
        dbUser.activeSkillGap = result;
        await dbUser.save();
        user = dbUser;
      } else {
        user = await updateLocalUser(user.id, { activeSkillGap: result });
      }
    }
    res.json({
      activeSkillGap: user.activeSkillGap,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, best: 0, lastActive: '' }
    });
  } catch (error) {
    next(error);
  }
});

// ─── Run New Deep Analysis ───────────────────────────────────────────────────
router.post('/analyze', async (req, res, next) => {
  try {
    const { 
      targetRole, 
      currentSkills, 
      jdText,
      education,
      semester,
      resumeText,
      projects,
      certifications,
      learningProgress,
      careerGoal,
      targetCompany,
      techStack
    } = req.body;

    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    const skillsStr = Array.isArray(currentSkills) ? currentSkills.join(', ') : (currentSkills || '');
    
    const contextPrompt = `Generate deep skill gap analysis for target role: ${targetRole}.
User Context:
- Current Stack / Skills: ${skillsStr}
- Education: ${education || 'Not specified'}
- Semester: ${semester || 'Not specified'}
- Resume Summary: ${resumeText || 'Not specified'}
- Active Projects: ${projects || 'Not specified'}
- Certifications: ${certifications || 'None'}
- Learning Progress: ${learningProgress || 'Not specified'}
- Career Goal: ${careerGoal || 'Not specified'}
- Target Goal Company: ${targetCompany || 'Not specified'}
- Preferred Tech Stack: ${techStack || 'Not specified'}
- External Job Description Metadata: ${jdText || 'None'}`;
    
    const result = await generateCareerJson('skillGapDeep', contextPrompt);
    result.targetRole = targetRole;

    let user = req.user;
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.activeSkillGap = result;
      await dbUser.save();
      user = dbUser;
    } else {
      user = await updateLocalUser(user.id, { activeSkillGap: result });
    }

    res.json({
      activeSkillGap: user.activeSkillGap,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, best: 0, lastActive: '' }
    });
  } catch (error) {
    next(error);
  }
});

// ─── Verify Quiz / Assessment Submission ─────────────────────────────────────
router.post('/verify-quiz', async (req, res, next) => {
  try {
    const { topic, score, totalQuestions } = req.body;
    if (!topic || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Missing assessment parameters' });
    }

    let user = req.user;
    if (!user.activeSkillGap) {
      return res.status(400).json({ message: 'No active skill gap profile found' });
    }

    // Give user XP based on quiz performance (e.g. 50 XP base, up to 150 total)
    const accuracy = score / totalQuestions;
    const xpGained = Math.round(50 + accuracy * 100);
    const newXp = (user.xp || 0) + xpGained;
    const levelDetails = calculateLevelDetails(newXp, user.level, user.streak);

    // Deep copy activeSkillGap to make edits
    const skillGap = JSON.parse(JSON.stringify(user.activeSkillGap));

    // Boost score & confidence for the tested skill
    let updatedSkill = false;
    if (skillGap.categories) {
      for (const cat of skillGap.categories) {
        for (const sk of cat.skills) {
          if (sk.name.toLowerCase() === topic.toLowerCase()) {
            sk.strength = Math.min(100, Math.round(sk.strength + accuracy * 20));
            sk.confidence = Math.min(100, Math.round(sk.confidence + accuracy * 30));
            sk.level = sk.strength >= 80 ? 'Advanced' : (sk.strength >= 50 ? 'Intermediate' : 'Beginner');
            updatedSkill = true;
            break;
          }
        }
        if (updatedSkill) break;
      }
    }

    // Remove from missing skills if strength is now high
    if (skillGap.gapAnalysis && skillGap.gapAnalysis.missingSkills) {
      skillGap.gapAnalysis.missingSkills = skillGap.gapAnalysis.missingSkills.filter(
        sk => sk.name.toLowerCase() !== topic.toLowerCase()
      );
    }

    // Boost overall scores slightly
    if (skillGap.overallScores) {
      skillGap.overallScores.skillMatch = Math.min(100, Math.round(skillGap.overallScores.skillMatch + accuracy * 3));
      skillGap.overallScores.readiness = Math.min(100, Math.round(skillGap.overallScores.readiness + accuracy * 4));
    }
    if (skillGap.readinessMeters) {
      skillGap.readinessMeters.internship = Math.min(100, Math.round(skillGap.readinessMeters.internship + accuracy * 3));
      skillGap.readinessMeters.placement = Math.min(100, Math.round(skillGap.readinessMeters.placement + accuracy * 3));
      skillGap.readinessMeters.core = Math.min(100, Math.round(skillGap.readinessMeters.core + accuracy * 4));
    }

    // Save updated user data
    let updatedUser;
    const updatePayload = {
      xp: newXp,
      level: levelDetails.level,
      streak: levelDetails.streak,
      activeSkillGap: skillGap
    };

    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.xp = updatePayload.xp;
      dbUser.level = updatePayload.level;
      dbUser.streak = updatePayload.streak;
      dbUser.activeSkillGap = updatePayload.activeSkillGap;
      await dbUser.save();
      updatedUser = dbUser;
    } else {
      updatedUser = await updateLocalUser(user.id, updatePayload);
    }

    res.json({
      activeSkillGap: updatedUser.activeSkillGap,
      xp: updatedUser.xp,
      level: updatedUser.level,
      streak: updatedUser.streak,
      xpGained,
      message: `Quiz submitted successfully! Gained ${xpGained} XP.`
    });
  } catch (error) {
    next(error);
  }
});

// ─── Submit Code Task / Projects Validation ─────────────────────────────────
router.post('/submit-task', async (req, res, next) => {
  try {
    const { taskId, githubUrl } = req.body;
    if (!taskId || !githubUrl) {
      return res.status(400).json({ message: 'Task ID and GitHub URL are required' });
    }

    let user = req.user;
    if (!user.activeSkillGap) {
      return res.status(400).json({ message: 'No active skill gap profile found' });
    }

    // Basic regex checks for github URLs
    const isGithub = /github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/.test(githubUrl);
    if (!isGithub) {
      return res.status(400).json({ message: 'Invalid GitHub repository link. Must be in the format github.com/username/repo-name' });
    }

    // Gain 200 XP for project submission
    const xpGained = 200;
    const newXp = (user.xp || 0) + xpGained;
    const levelDetails = calculateLevelDetails(newXp, user.level, user.streak);

    const skillGap = JSON.parse(JSON.stringify(user.activeSkillGap));

    // Validate project inside projectGap
    if (skillGap.projectGap) {
      if (!skillGap.projectGap.currentProjects) {
        skillGap.projectGap.currentProjects = [];
      }
      
      // Check if taskId exists inside missingProjects to extract name
      let projName = 'Verified Project';
      if (skillGap.projectGap.missingProjects) {
        const foundIdx = skillGap.projectGap.missingProjects.findIndex(p => p.name.toLowerCase().includes(taskId.toLowerCase()) || taskId.toLowerCase().includes(p.name.toLowerCase()));
        if (foundIdx !== -1) {
          projName = skillGap.projectGap.missingProjects[foundIdx].name;
          // Remove from missing
          skillGap.projectGap.missingProjects.splice(foundIdx, 1);
        }
      }

      // Add to currentProjects as validated
      const alreadyExists = skillGap.projectGap.currentProjects.find(p => p.name.toLowerCase() === projName.toLowerCase());
      if (!alreadyExists) {
        skillGap.projectGap.currentProjects.push({
          name: projName,
          url: githubUrl,
          validated: true,
          score: 85
        });
      } else {
        alreadyExists.validated = true;
        alreadyExists.score = 90;
        alreadyExists.url = githubUrl;
      }
    }

    // Boost match and readiness scores
    if (skillGap.overallScores) {
      skillGap.overallScores.projectMatch = Math.min(100, Math.round(skillGap.overallScores.projectMatch + 15));
      skillGap.overallScores.readiness = Math.min(100, Math.round(skillGap.overallScores.readiness + 5));
    }
    if (skillGap.readinessMeters) {
      skillGap.readinessMeters.projects = Math.min(100, Math.round(skillGap.readinessMeters.projects + 15));
    }

    const updatePayload = {
      xp: newXp,
      level: levelDetails.level,
      streak: levelDetails.streak,
      activeSkillGap: skillGap
    };

    let updatedUser;
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.xp = updatePayload.xp;
      dbUser.level = updatePayload.level;
      dbUser.streak = updatePayload.streak;
      dbUser.activeSkillGap = updatePayload.activeSkillGap;
      await dbUser.save();
      updatedUser = dbUser;
    } else {
      updatedUser = await updateLocalUser(user.id, updatePayload);
    }

    res.json({
      activeSkillGap: updatedUser.activeSkillGap,
      xp: updatedUser.xp,
      level: updatedUser.level,
      streak: updatedUser.streak,
      xpGained,
      message: `Project task verified successfully! Gained ${xpGained} XP.`
    });
  } catch (error) {
    next(error);
  }
});

// ─── Mentor / Coach Interactive Chat ──────────────────────────────────────────
router.post('/coach-chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = req.user;
    const skillGap = user.activeSkillGap || {};
    
    // Construct rich coaching prompt
    const prompt = `User target role: ${skillGap.targetRole || 'Full Stack Developer'}.
Active skill gap parameters:
Match percentage: ${skillGap.overallScores?.skillMatch || 60}%
Readiness index: ${skillGap.overallScores?.readiness || 55}%
Missing skills: ${JSON.stringify(skillGap.gapAnalysis?.missingSkills || [])}
Mentors advice context: ${JSON.stringify(skillGap.mentorsAdvice || [])}
User asks the coach: "${message}"

Role description: You are an elite AI Career Mentor. Give a highly motivating, strategic, and concise answer (max 3-4 sentences) specific to their skill gaps. Recommend specific next steps.`;

    const chatResponse = await generateCareerJson('chat', prompt);
    res.json({
      reply: chatResponse?.reply || chatResponse || 'Focus on closing your primary skill gaps by completing assessments and uploading validated GitHub projects!'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
