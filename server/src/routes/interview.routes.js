import express from 'express';
import { protect } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';
import User from '../models/User.js';
import { updateLocalUser } from '../services/localAuthStore.js';
import { generateCareerJson } from '../services/gemini.js';

const router = express.Router();
router.use(protect);

// Helper to level up based on XP
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

// ─── Get Active State & Aggregated Stats ────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      activeInterview: user.activeInterview || null,
      completedInterviews: user.completedInterviews || [],
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, best: 0, lastActive: '' }
    });
  } catch (error) {
    next(error);
  }
});

// ─── Start New Mock Interview Session ───────────────────────────────────────
router.post('/start', async (req, res, next) => {
  try {
    const { role, difficulty, type, company, resumeContext } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    const difficultyVal = difficulty || 'Intermediate';
    const categoryType = type || 'Technical';
    const companyName = company || 'General';

    const prompt = `Generate an interview session with 3 questions for target role: ${role}. Difficulty: ${difficultyVal}. Category: ${categoryType}. Target company: ${companyName}. Resume references context: ${resumeContext || 'None'}`;
    
    // Call Gemini or retrieve mock dataset
    const result = await generateCareerJson('interviewSession', prompt);
    
    const activeInterview = {
      role,
      difficulty: difficultyVal,
      type: categoryType,
      company: companyName,
      questions: result.questions || [],
      currentIndex: 0,
      answers: [],
      startTime: new Date().toISOString()
    };

    let user;
    if (isDbReady()) {
      const dbUser = await User.findById(req.user.id);
      dbUser.activeInterview = activeInterview;
      await dbUser.save();
      user = dbUser;
    } else {
      user = await updateLocalUser(req.user.id, { activeInterview });
    }

    res.json({
      activeInterview: user.activeInterview,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, best: 0, lastActive: '' }
    });
  } catch (error) {
    next(error);
  }
});

// ─── Submit Response / Answer Check ──────────────────────────────────────────
router.post('/submit-answer', async (req, res, next) => {
  try {
    const { questionId, answerText, speechStats, videoStats } = req.body;
    if (!questionId || answerText === undefined) {
      return res.status(400).json({ message: 'Question ID and answer text are required' });
    }

    let user = req.user;
    if (!user.activeInterview) {
      return res.status(400).json({ message: 'No active interview session found' });
    }

    const session = JSON.parse(JSON.stringify(user.activeInterview));
    const questions = session.questions || [];
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      return res.status(400).json({ message: 'Question ID not found in active session' });
    }

    const speechObj = speechStats || { wpm: 130, fillerWordsCount: 2, pauses: 1, repeatedWords: 0 };
    const videoObj = videoStats || { eyeContact: 'Good', posture: 'Excellent', expressions: 'Engaged', professionalAppearance: 'High' };

    // AI answer evaluation prompt
    const prompt = `Evaluate mock interview response.
Question: "${question.text}"
Category: "${question.category}"
Correct Answer Hints: "${question.hints || ''}"
Correct Answer Explanation: "${question.correctAnswerExplanation}"
User Answer: "${answerText}"
Speech analytics: Words-Per-Minute: ${speechObj.wpm}, Filler words count: ${speechObj.fillerWordsCount}, Pauses: ${speechObj.pauses}, Repeated words: ${speechObj.repeatedWords}
Video feedback metrics: Eye contact: ${videoObj.eyeContact}, Posture: ${videoObj.posture}, Engagement: ${videoObj.expressions}, Appearance: ${videoObj.professionalAppearance}

Provide an evaluation based on correctness, structured STAR response patterns, and communication stability.`;

    const evaluation = await generateCareerJson('interviewEvaluation', prompt);

    // Append evaluated response to session history
    session.answers.push({
      questionId,
      questionText: question.text,
      userAnswer: answerText,
      evaluation,
      speechStats: speechObj,
      videoStats: videoObj
    });

    session.currentIndex += 1;

    let updatedUser;
    // Check if session completed
    if (session.currentIndex >= questions.length) {
      // Calculate average mock parameters
      const totalScore = session.answers.reduce((acc, val) => acc + (val.evaluation?.score || 80), 0);
      const avgScore = Math.round(totalScore / questions.length);

      // Aggregate categories breakdowns
      const finalReport = {
        role: session.role,
        difficulty: session.difficulty,
        type: session.type,
        company: session.company,
        score: avgScore,
        answers: session.answers,
        feedback: evaluation.feedback || 'Completed mock interview session successfully!',
        breakdown: evaluation.breakdown || { technical: avgScore, hr: avgScore, communication: avgScore, confidence: avgScore, problemSolving: avgScore, projectDiscussion: avgScore, leadership: avgScore },
        starEvaluation: evaluation.starEvaluation || {
          situation: { score: avgScore, feedback: 'Well aligned.' },
          task: { score: avgScore, feedback: 'Well aligned.' },
          action: { score: avgScore, feedback: 'Well structured.' },
          result: { score: avgScore, feedback: 'Satisfactory.' }
        },
        speechAnalytics: evaluation.speechAnalytics || {
          wpm: speechObj.wpm,
          fillerWordsCount: speechObj.fillerWordsCount,
          longPauses: speechObj.pauses,
          repeatedWords: speechObj.repeatedWords,
          improvementTips: ['Practice breathing cycles to minimize short pauses.']
        },
        postureFeedback: evaluation.postureFeedback || [
          `Maintained ${videoObj.eyeContact} eye contact.`,
          `Displayed ${videoObj.posture} posture.`
        ],
        weaknesses: evaluation.weaknesses || ['Provide more quantified details in results answers.'],
        strongPoints: evaluation.strongPoints || ['Good structural flow and command over language.'],
        hiringProbability: evaluation.hiringProbability || 75,
        salaryPotential: evaluation.salaryPotential || '₹8 – ₹12 LPA',
        customRoadmap: evaluation.customRoadmap || ['Re-evaluate distributed database query locking patterns.'],
        timestamp: new Date().toISOString()
      };

      // Calculate level and streak XP updates
      const baseXp = 300;
      const accuracyXp = avgScore * 2;
      const totalXpGained = baseXp + accuracyXp;

      const newXp = (user.xp || 0) + totalXpGained;
      const levelDetails = calculateLevelDetails(newXp, user.level, user.streak);

      const updatePayload = {
        activeInterview: null,
        xp: newXp,
        level: levelDetails.level,
        streak: levelDetails.streak,
        profile: {
          ...(user.profile || {}),
          interviewScore: avgScore
        }
      };

      if (isDbReady()) {
        const dbUser = await User.findById(user.id);
        dbUser.activeInterview = updatePayload.activeInterview;
        dbUser.xp = updatePayload.xp;
        dbUser.level = updatePayload.level;
        dbUser.streak = updatePayload.streak;
        dbUser.profile.interviewScore = updatePayload.profile.interviewScore;
        dbUser.completedInterviews.push(finalReport);
        await dbUser.save();
        updatedUser = dbUser;
      } else {
        const completedArr = Array.isArray(user.completedInterviews) ? [...user.completedInterviews] : [];
        completedArr.push(finalReport);
        updatePayload.completedInterviews = completedArr;
        updatedUser = await updateLocalUser(user.id, updatePayload);
      }

      res.json({
        activeInterview: null,
        completedInterviews: updatedUser.completedInterviews,
        xp: updatedUser.xp,
        level: updatedUser.level,
        streak: updatedUser.streak,
        finishedReport: finalReport,
        xpGained: totalXpGained,
        message: `Interview completed successfully! You gained ${totalXpGained} XP.`
      });

    } else {
      // Return next question
      const updatePayload = { activeInterview: session };
      if (isDbReady()) {
        const dbUser = await User.findById(user.id);
        dbUser.activeInterview = updatePayload.activeInterview;
        await dbUser.save();
        updatedUser = dbUser;
      } else {
        updatedUser = await updateLocalUser(user.id, updatePayload);
      }

      res.json({
        activeInterview: updatedUser.activeInterview,
        xp: updatedUser.xp,
        level: updatedUser.level,
        streak: updatedUser.streak,
        intermediateEvaluation: evaluation
      });
    }

  } catch (error) {
    next(error);
  }
});

// ─── AI Interview Coach Q&A ─────────────────────────────────────────────────
router.post('/coach-ask', async (req, res, next) => {
  try {
    const { questionText, userAnswer } = req.body;
    if (!questionText) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    const prompt = `User asks AI Interview Coach:
Question faced: "${questionText}"
User typed attempt: "${userAnswer || 'None'}"

Explain how to answer this question effectively. Show a perfect answer example using the STAR structure, and give 2-3 specific coaching tips.`;

    const chatResponse = await generateCareerJson('chat', prompt);
    res.json({
      reply: chatResponse?.reply || chatResponse || 'Focus on Situation, Task, Action, and Result. Quantify your actions (e.g. "improved query speed by 30%") and express team collaborations clearly!'
    });
  } catch (error) {
    next(error);
  }
});

// ─── Clear Interviews History ───────────────────────────────────────────────
router.post('/clear-history', async (req, res, next) => {
  try {
    let user = req.user;
    let updatedUser;

    const updatePayload = {
      activeInterview: null,
      completedInterviews: [],
      profile: {
        ...(user.profile || {}),
        interviewScore: 0
      }
    };

    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.activeInterview = updatePayload.activeInterview;
      dbUser.completedInterviews = updatePayload.completedInterviews;
      dbUser.profile.interviewScore = updatePayload.profile.interviewScore;
      await dbUser.save();
      updatedUser = dbUser;
    } else {
      updatedUser = await updateLocalUser(user.id, updatePayload);
    }

    res.json({
      activeInterview: null,
      completedInterviews: [],
      xp: updatedUser.xp,
      level: updatedUser.level,
      streak: updatedUser.streak,
      message: 'Interview history logs cleared.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
