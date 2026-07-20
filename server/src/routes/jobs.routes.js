import express from 'express';
import { protect } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';
import User from '../models/User.js';
import { updateLocalUser } from '../services/localAuthStore.js';
import { generateCareerJson } from '../services/gemini.js';

const router = express.Router();
router.use(protect);

// ─── Get personalized jobs ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const user = req.user;
    const skills = user.profile?.skills || [];
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const prompt = `Generate 6 personalized job matches for a candidate with skills: ${skills.join(', ')}. Target role: ${targetRole}. Include internships, fresher roles, and mid-level positions with realistic Indian salary data.`;
    const result = await generateCareerJson('jobMatch', prompt);
    const jobs = result.jobs || [];
    // Merge with any saved/applied status from user
    const userApplications = user.jobApplications || [];
    const userSaved = user.savedJobs || [];
    const merged = jobs.map(job => ({
      ...job,
      status: userApplications.find(a => a.jobId === job.id)?.status || job.status,
      saved: userSaved.includes(job.id),
    }));
    res.json(merged);
  } catch (error) {
    next(error);
  }
});

// ─── Update job status (apply, save, shortlist, etc.) ─────────────────────────
router.patch('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { action, jobData } = req.body;
    const user = req.user;
    let jobApplications = Array.isArray(user.jobApplications) ? [...user.jobApplications] : [];
    let savedJobs = Array.isArray(user.savedJobs) ? [...user.savedJobs] : [];

    if (action === 'save' || action === 'unsave') {
      if (action === 'save' && !savedJobs.includes(jobId)) savedJobs.push(jobId);
      if (action === 'unsave') savedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      // Track application status
      const existing = jobApplications.find(a => a.jobId === jobId);
      if (existing) {
        existing.status = action;
        existing.updatedAt = new Date().toISOString();
      } else {
        jobApplications.push({
          jobId,
          status: action,
          jobData: jobData || {},
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      // Award XP for applying
      if (action === 'applied') {
        const newXp = (user.xp || 0) + 50;
        if (isDbReady()) {
          const dbUser = await User.findById(user.id);
          dbUser.xp = newXp;
          dbUser.jobApplications = jobApplications;
          dbUser.savedJobs = savedJobs;
          await dbUser.save();
        } else {
          await updateLocalUser(user.id, { xp: newXp, jobApplications, savedJobs });
        }
        return res.json({ jobId, status: action, xpGained: 50 });
      }
    }

    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.jobApplications = jobApplications;
      dbUser.savedJobs = savedJobs;
      await dbUser.save();
    } else {
      await updateLocalUser(user.id, { jobApplications, savedJobs });
    }
    res.json({ jobId, status: action, saved: savedJobs.includes(jobId) });
  } catch (error) {
    next(error);
  }
});

// ─── Generate AI Cover Letter ────────────────────────────────────────────────
router.post('/cover-letter', async (req, res, next) => {
  try {
    const { jobTitle, company, jobDescription, role } = req.body;
    const user = req.user;
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js, Python';
    const prompt = `Generate a professional cover letter for: Job: ${jobTitle} at ${company}. Description: ${jobDescription || 'N/A'}. Candidate skills: ${skills}. Target role: ${role || jobTitle}.`;
    const result = await generateCareerJson('coverLetter', prompt);
    res.json({ letter: result.letter || result });
  } catch (error) {
    next(error);
  }
});

// ─── AI Resume Tailor Tips ───────────────────────────────────────────────────
router.post('/resume-tailor', async (req, res, next) => {
  try {
    const { jobTitle, jobDescription, missingSkills } = req.body;
    const user = req.user;
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js';
    const prompt = `Provide 5 specific resume tailoring tips for: Job: ${jobTitle}. Description: ${jobDescription || 'N/A'}. Candidate skills: ${skills}. Missing skills: ${missingSkills?.join(', ') || 'N/A'}.`;
    const result = await generateCareerJson('chat', prompt);
    res.json({ tips: result.reply || 'Tailor your resume by adding role-specific keywords, quantifying impact, and featuring relevant projects.' });
  } catch (error) {
    next(error);
  }
});

// ─── Company Intelligence ─────────────────────────────────────────────────────
router.post('/company-intel', async (req, res, next) => {
  try {
    const { company, role } = req.body;
    const prompt = `Provide company intelligence for ${company}: hiring process, interview experience, salary insights, required skills, growth opportunities, and culture summary for a ${role || 'software engineer'} role.`;
    const result = await generateCareerJson('chat', prompt);
    res.json({
      overview: result.reply || `${company} is a leading tech company known for innovation and strong engineering culture.`,
      hiringProcess: ['Online Assessment', 'Technical Interview Round 1', 'Technical Interview Round 2', 'HR Discussion'],
      salary: { fresher: '₹6–10 LPA', midLevel: '₹12–18 LPA', senior: '₹20–35 LPA' },
      culture: 'Innovation-first, collaborative, fast-paced environment with strong learning opportunities.',
    });
  } catch (error) {
    next(error);
  }
});

// ─── Get Application Analytics ────────────────────────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const user = req.user;
    const applications = user.jobApplications || [];
    const analytics = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interviewing: applications.filter(a => a.status === 'interview').length,
      offered: applications.filter(a => a.status === 'offered').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      responseRate: applications.length > 0 ? Math.round((applications.filter(a => ['shortlisted', 'interview', 'offered'].includes(a.status)).length / applications.length) * 100) : 0,
    };
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
