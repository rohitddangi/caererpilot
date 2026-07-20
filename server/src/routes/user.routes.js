import express from 'express';
import { protect } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';
import User from '../models/User.js';
import { updateLocalUser } from '../services/localAuthStore.js';

const router = express.Router();

router.get('/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/profile', protect, async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'title', 'avatar', 'profile', 'xp', 'level', 'streak',
      'activeRoadmap', 'activeSkillGap', 'activeInterview', 'completedInterviews',
      'jobApplications', 'savedJobs', 'learningProgress', 'completedTopics',
      'certificates', 'careerGoals', 'activityLog', 'chatHistory', 'badges'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const userId = req.user._id || req.user.id;
    let user;

    if (isDbReady()) {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -refreshToken -verificationToken -resetPasswordToken');
    } else {
      user = await updateLocalUser(userId, updates);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
