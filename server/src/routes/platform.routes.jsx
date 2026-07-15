import express from 'express';
import multer from 'multer';
import { adminOnly, protect } from '../middleware/auth.jsx';
import { addCertificate, getAdminAnalytics, getDashboard, listCertificates, listJobs, updateJob } from '../services/localAppStore.jsx';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect);

router.get('/dashboard', async (req, res, next) => {
  try { res.json(await getDashboard(req.user)); }
  catch (error) { next(error); }
});

router.get('/jobs', async (req, res, next) => {
  try { res.json(await listJobs(req.user.id)); }
  catch (error) { next(error); }
});

router.patch('/jobs/:id', async (req, res, next) => {
  try {
    const job = await updateJob(req.user.id, req.params.id, req.body.action);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) { next(error); }
});

router.get('/certificates', async (req, res, next) => {
  try { res.json(await listCertificates(req.user.id)); }
  catch (error) { next(error); }
});

router.post('/certificates', upload.single('certificate'), async (req, res, next) => {
  try {
    const cert = await addCertificate(req.user.id, {
      title: req.body.title,
      category: req.body.category,
      fileName: req.file?.originalname,
    });
    res.status(201).json(cert);
  } catch (error) { next(error); }
});

router.get('/admin/analytics', adminOnly, async (_req, res, next) => {
  try { res.json(await getAdminAnalytics()); }
  catch (error) { next(error); }
});

export default router;
