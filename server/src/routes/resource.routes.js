import express from 'express';
import { isDbReady } from '../config/db.js';
import { adminOnly, protect } from '../middleware/auth.js';
import Resource from '../models/Resource.js';

const router = express.Router();

const demoResources = [
  { title: 'Machine Learning Specialization', type: 'course', technology: 'AI', difficulty: 'intermediate' },
  { title: 'AWS Cloud Practitioner', type: 'certification', technology: 'Cloud', difficulty: 'beginner' },
];

router.get('/', protect, async (_req, res, next) => {
  try {
    if (!isDbReady()) return res.json(demoResources);
    const resources = await Resource.find().sort({ createdAt: -1 }).limit(100);
    res.json(resources.length ? resources : demoResources);
  } catch (error) { next(error); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (!isDbReady()) return res.status(201).json({ id: 'demo-resource', ...req.body });
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) { next(error); }
});

export default router;
