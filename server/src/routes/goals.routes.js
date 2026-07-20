import express from 'express';
import { protect } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';
import User from '../models/User.js';
import { updateLocalUser } from '../services/localAuthStore.js';
import { generateCareerJson } from '../services/gemini.js';
import { listGoals, createGoal, updateGoalById, deleteGoalById, getGoalAnalytics } from '../services/localAppStore.js';

const router = express.Router();
router.use(protect);

// ─── List all goals ───────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { search, status, priority, category, difficulty, sort } = req.query;
    const goals = await listGoals(req.user.id, { search, status, priority, category, difficulty, sort });
    res.json(goals);
  } catch (error) { next(error); }
});

// ─── Create a new goal ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const goal = await createGoal(req.user.id, req.body);
    res.status(201).json(goal);
  } catch (error) { next(error); }
});

// ─── Update a goal ───────────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await updateGoalById(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.json(updated);
  } catch (error) { next(error); }
});

// ─── Delete a goal ───────────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteGoalById(req.user.id, req.params.id, req.query.hard === 'true');
    res.json({ message: 'Goal deleted' });
  } catch (error) { next(error); }
});

// ─── Update goal status ──────────────────────────────────────────────────────
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const updates = { status };
    if (status === 'completed') updates.progress = 100;
    if (status === 'not_started') updates.progress = 0;
    const updated = await updateGoalById(req.user.id, req.params.id, updates);
    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.json(updated);
  } catch (error) { next(error); }
});

// ─── Update goal progress ────────────────────────────────────────────────────
router.patch('/:id/progress', async (req, res, next) => {
  try {
    const { progress } = req.body;
    const updates = { progress: Math.min(100, Math.max(0, progress || 0)) };
    if (updates.progress === 100) updates.status = 'completed';
    else if (updates.progress > 0) updates.status = 'in_progress';
    const updated = await updateGoalById(req.user.id, req.params.id, updates);
    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.json(updated);
  } catch (error) { next(error); }
});

// ─── Duplicate a goal ────────────────────────────────────────────────────────
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const goals = await listGoals(req.user.id, {});
    const original = goals.find(g => g.id === req.params.id);
    if (!original) return res.status(404).json({ message: 'Goal not found' });
    const { id, userId, createdAt, updatedAt, status, progress, archived, ...rest } = original;
    const dup = await createGoal(req.user.id, { ...rest, title: `${rest.title} (Copy)` });
    res.status(201).json(dup);
  } catch (error) { next(error); }
});

// ─── Goal analytics ──────────────────────────────────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await getGoalAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) { next(error); }
});

// ─── AI Generate goals ───────────────────────────────────────────────────────
router.post('/ai-generate', async (req, res, next) => {
  try {
    const user = req.user;
    const skills = user.profile?.skills?.join(', ') || 'JavaScript, React';
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const prompt = `Generate 5 actionable career goals for a ${targetRole} candidate. Current skills: ${skills}. Each goal should have: title, description, category, priority, difficulty, targetRole, estimatedHours, icon, color. Return a JSON array.`;
    const result = await generateCareerJson('goalGenerate', prompt);
    res.json(Array.isArray(result) ? result : [result]);
  } catch (error) { next(error); }
});

// ─── Today's micro-goals ────────────────────────────────────────────────────
router.get('/today', async (req, res, next) => {
  try {
    const user = req.user;
    const skills = user.profile?.skills?.join(', ') || 'JavaScript, React';
    const prompt = `Generate 5 daily micro-goals for today for a developer learning ${skills}. Each goal: title, description, category, estimatedMinutes, priority.`;
    const result = await generateCareerJson('todayGoals', prompt);
    res.json(Array.isArray(result) ? result : [result]);
  } catch (error) { next(error); }
});

// ─── Get Career Goal Score (legacy) ──────────────────────────────────────────
router.get('/score', async (req, res, next) => {
  try {
    const user = req.user;
    const skills = user.profile?.skills || [];
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const prompt = `Calculate career goal score for ${targetRole}. Skills: ${skills.join(', ')}. Resume score: ${user.profile?.resumeScore || 0}. Interview score: ${user.profile?.interviewScore || 0}. Certifications: ${user.certificates?.length || 0}. Completed topics: ${user.completedTopics?.length || 0}. Job applications: ${user.jobApplications?.length || 0}.`;
    const result = await generateCareerJson('goalScore', prompt);
    res.json(result);
  } catch (error) { next(error); }
});

// ─── Get Career Predictions (legacy) ─────────────────────────────────────────
router.get('/prediction', async (req, res, next) => {
  try {
    const user = req.user;
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js';
    const prompt = `Predict career timeline for ${targetRole} candidate with skills: ${skills}. Predict internship readiness, placement readiness, and job readiness dates. Include expected salary range and accelerator actions.`;
    const result = await generateCareerJson('careerPrediction', prompt);
    res.json(result);
  } catch (error) { next(error); }
});

// ─── Get Goal Optimizer Suggestions (legacy) ─────────────────────────────────
router.get('/optimizer', async (req, res, next) => {
  try {
    const user = req.user;
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js';
    const prompt = `Generate 4 goal optimizer actions for ${targetRole} candidate. Current skills: ${skills}. Each action should show: current score, projected score after completion, jobs unlocked, and salary impact.`;
    const result = await generateCareerJson('goalOptimizer', prompt);
    res.json(Array.isArray(result) ? result : [result]);
  } catch (error) { next(error); }
});

// ─── Update career goals calibration (legacy) ────────────────────────────────
router.post('/calibrate', async (req, res, next) => {
  try {
    const { targetRole, targetDate, targetSalary, targetCompany } = req.body;
    const user = req.user;
    const careerGoals = { targetRole, targetDate, targetSalary, targetCompany, updatedAt: new Date().toISOString() };
    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.careerGoals = careerGoals;
      if (targetRole) dbUser.profile.targetRole = targetRole;
      await dbUser.save();
    } else {
      await updateLocalUser(user.id, { careerGoals, profile: { ...user.profile, targetRole } });
    }
    res.json({ careerGoals, message: 'Career goals updated successfully.' });
  } catch (error) { next(error); }
});

export default router;
