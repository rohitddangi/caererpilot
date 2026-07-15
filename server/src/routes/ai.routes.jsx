import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { protect } from '../middleware/auth.jsx';
import { generateCareerJson } from '../services/gemini.jsx';
import User from '../models/User.jsx';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);

// ─── AI Career Command Center Endpoints ────────────────────────────────────────

// 1. Get Job Readiness Score & Recommendations
router.get('/job-readiness', async (req, res, next) => {
  try {
    const targetRole = req.user.profile?.targetRole || 'Full Stack Developer';
    const skills = req.user.profile?.skills || [];
    const projects = req.user.profile?.projects || [];
    const certifications = req.user.profile?.certifications || [];
    const completedCount = req.user.completedTopics?.length || 0;

    const requiredSkillsMap = {
      'AI/ML Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'MLflow', 'Kubernetes', 'MongoDB', 'FastAPI', 'SQL', 'Git', 'NumPy', 'Pandas'],
      'Full Stack Developer': ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML', 'CSS', 'Git', 'Docker', 'AWS', 'TypeScript', 'TailwindCSS'],
      'Data Scientist': ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Tableau', 'PowerBI', 'Hadoop', 'Git'],
      'ML Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'MLflow', 'Kubernetes', 'MongoDB', 'FastAPI', 'SQL', 'Git'],
      'Software Engineer': ['Java', 'C++', 'Python', 'Go', 'Git', 'Docker', 'SQL', 'Data Structures', 'Algorithms', 'System Design'],
      'Cyber Security Engineer': ['Linux', 'Python', 'Networking', 'Wireshark', 'Metasploit', 'Nmap', 'Cryptography', 'SIEM', 'Firewalls'],
      'Cloud Engineer': ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Python', 'Bash', 'CI/CD', 'Git']
    };

    const required = requiredSkillsMap[targetRole] || requiredSkillsMap['Full Stack Developer'];
    const matched = skills.filter(s => required.some(r => r.toLowerCase() === s.toLowerCase()));
    
    // Skills Score: 30% weight
    const skillScore = required.length ? Math.round((matched.length / required.length) * 100) : 0;
    
    // Projects Score: 25% weight (3 projects = 100%)
    const projectScore = Math.min(100, Math.round((projects.length / 3) * 100));

    // Certifications Score: 15% weight (2 certs = 100%)
    const certScore = Math.min(100, Math.round((certifications.length / 2) * 100));

    // Learning Progress Score: 15% weight (4 completed topics = 100%)
    const learningScore = Math.min(100, Math.round((completedCount / 4) * 100));

    // Interview Prep Score: 15% weight
    let interviewScore = req.user.profile?.interviewScore || 0;
    if (!interviewScore && req.user.completedInterviews?.length > 0) {
      const sum = req.user.completedInterviews.reduce((acc, item) => acc + (item.score || 0), 0);
      interviewScore = Math.round(sum / req.user.completedInterviews.length);
    }

    const readinessPercentage = Math.round(
      (skillScore * 0.3) +
      (projectScore * 0.25) +
      (certScore * 0.15) +
      (learningScore * 0.15) +
      (interviewScore * 0.15)
    );

    // Missing requirements compilation
    const missingRequirements = [];
    if (matched.length < required.length) {
      const missingList = required.filter(r => !skills.some(s => s.toLowerCase() === r.toLowerCase()));
      missingRequirements.push({ type: 'skill', name: `Skills: Acquire ${missingList.slice(0, 3).join(', ')}`, priority: 'High' });
    }
    if (projects.length < 3) {
      missingRequirements.push({ type: 'project', name: `Projects: Complete ${3 - projects.length} more custom build(s)`, priority: 'High' });
    }
    if (certifications.length < 2) {
      missingRequirements.push({ type: 'certification', name: `Certifications: Add ${2 - certifications.length} professional badge(s)`, priority: 'Medium' });
    }
    if (completedCount < 4) {
      missingRequirements.push({ type: 'learning', name: 'Learning: Finish 4 topics in Learning Hub', priority: 'Medium' });
    }
    if (!interviewScore) {
      missingRequirements.push({ type: 'interview', name: 'Interviews: Attempt a Prep coach loop', priority: 'High' });
    }

    // Dynamic suggestions compilation
    const suggestions = [];
    if (matched.length < required.length) {
      const firstMissing = required.filter(r => !skills.some(s => s.toLowerCase() === r.toLowerCase()))[0];
      suggestions.push(`Focus on learning ${firstMissing} to match standard hiring metrics for ${targetRole}.`);
    }
    if (projects.length < 3) {
      suggestions.push('Use the AI Project Mentor tool to design and architect a new full-stack portfolio item.');
    }
    if (certifications.length < 2) {
      suggestions.push('Earn certifications like AWS Cloud Practitioner or Meta React Specialization.');
    }
    if (!interviewScore) {
      suggestions.push('Complete at least one mock technical coaching session to unlock communications indices.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Excellent! Apply to openings on the Jobs board and verify custom Git repositories.');
    }

    res.json({
      readinessPercentage,
      breakdown: {
        skills: skillScore,
        projects: projectScore,
        certifications: certScore,
        learning: learningScore,
        interview: interviewScore
      },
      missingRequirements,
      suggestions
    });
  } catch (error) {
    next(error);
  }
});

// 2. AI Project Mentor - Generate full architectural design
router.post('/project-mentor', async (req, res, next) => {
  try {
    const { projectIdea, techPreference } = req.body;
    if (!projectIdea) {
      return res.status(400).json({ message: 'Project idea is required.' });
    }
    const context = `Project Idea: ${projectIdea}\nTech Preference: ${techPreference || 'Matching career track'}`;
    const result = await generateCareerJson('projectMentor', context);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 3. Industry Trends Dashboard Data
router.get('/industry-trends', async (req, res, next) => {
  try {
    const targetRole = req.user.profile?.targetRole || 'Full Stack Developer';
    const context = `Target Role: ${targetRole}. Yield latest trending skills, tech, jobs, salary bands, and future opportunities.`;
    const result = await generateCareerJson('industryTrends', context);
    res.json(result);
  } catch (error) {
    next(error);
  }
});



router.post('/roadmap', async (req, res, next) => {
  try { res.json(await generateCareerJson('roadmap', `Generate roadmap for ${req.body.role}`)); }
  catch (error) { next(error); }
});

router.post('/skill-gap', async (req, res, next) => {
  try { res.json(await generateCareerJson('skillGap', JSON.stringify(req.body))); }
  catch (error) { next(error); }
});

router.post('/interview', async (req, res, next) => {
  try { res.json(await generateCareerJson('interview', JSON.stringify(req.body))); }
  catch (error) { next(error); }
});

router.post('/chat', async (req, res, next) => {
  try { res.json(await generateCareerJson('chat', req.body.message || 'Give career guidance')); }
  catch (error) { next(error); }
});

// ─── Multi-Agent Career Chat (CareerGPT) ────────────────────────────────────
router.post('/career-chat', async (req, res, next) => {
  try {
    const { message, agent = 'Career Coach', context = {} } = req.body;
    const user = req.user;
    const userProfile = {
      name: user.name,
      targetRole: user.profile?.targetRole || context.targetRole || 'Full Stack Developer',
      skills: user.profile?.skills || context.skills || [],
      resumeScore: user.profile?.resumeScore || context.resumeScore || 0,
      interviewScore: user.profile?.interviewScore || context.interviewScore || 0,
      experience: user.profile?.experience || 0,
      education: user.profile?.education || '',
    };

    // Load rich dynamic properties
    const completedInterviews = user.completedInterviews || [];
    const latestMock = completedInterviews.length > 0 ? completedInterviews[completedInterviews.length - 1] : null;
    const missingSkills = user.activeSkillGap?.gapAnalysis?.missingSkills?.map(s => s.name) || [];
    const roadmapMilestones = user.activeRoadmap?.weeklyGoals || [];

    const agentPersonas = {
      'Career Coach': 'You are an expert Career Coach at a top career consultancy. You give precise, actionable advice based on the user\'s profile data.',
      'Resume Expert': 'You are a Senior ATS Resume Expert with 10 years of experience reviewing resumes for top tech companies. You give specific, measurable resume improvement advice.',
      'Roadmap Expert': 'You are a Senior Software Architect who creates personalized learning roadmaps. You recommend specific technologies, timelines, and milestones based on the user\'s current level.',
      'Job Expert': 'You are a Talent Acquisition Specialist at top tech companies. You give insider knowledge about job markets, application strategies, and hiring processes.',
      'Interview Expert': 'You are an Interview Coach who has conducted 1000+ technical interviews at FAANG. You provide detailed feedback on answers, common patterns, and how to ace technical and behavioral rounds.',
      'Skill Gap Expert': 'You are a Technical Skills Assessment Specialist. You identify exact skill gaps, prioritize learning order, and estimate time to bridge each gap.',
      'Learning Mentor': 'You are a Senior Software Engineer who mentors junior developers. You recommend the best learning resources, practice projects, and learning strategies.',
      'Certification Advisor': 'You are a Professional Certification Advisor who knows the ROI of every tech certification. You recommend the highest-impact certifications based on career goals and market demand.',
    };

    const persona = agentPersonas[agent] || agentPersonas['Career Coach'];
    
    const contextStr = `User Profile: Name: ${userProfile.name}, Target Role: ${userProfile.targetRole}, Skills: ${userProfile.skills.join(', ') || 'Not specified'}, Resume Score: ${userProfile.resumeScore}/100, Interview Score: ${userProfile.interviewScore}/100, Experience: ${userProfile.experience} years.
Roadmap Goals: ${roadmapMilestones.slice(0, 2).join(', ') || 'None set'}
Identified Skill Gaps: ${missingSkills.slice(0, 3).join(', ') || 'None'}
Last Interview score: ${latestMock ? latestMock.score + '%' : 'None attempted'}.`;

    const fullPrompt = `${persona}\n\n${contextStr}\n\nUser Question: ${message}\n\nRespond as the ${agent} with specific, personalized advice based on the user's profile. Be actionable and concrete. Keep response under 200 words unless detail is needed.`;

    const result = await generateCareerJson('careerChat', fullPrompt);
    res.json({ reply: result.reply || result, agent });
  } catch (error) {
    next(error);
  }
});

// ─── Certification Intelligence ──────────────────────────────────────────────
router.post('/cert-recommend', async (req, res, next) => {
  try {
    const { targetRole, category } = req.body;
    const user = req.user;
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js';
    const prompt = `Recommend top 5 certifications for ${targetRole || user.profile?.targetRole || 'Full Stack Developer'} with skills: ${skills}. Filter by: ${category || 'all'}.`;
    const result = await generateCareerJson('certRecommend', prompt);
    res.json(Array.isArray(result) ? result : [result]);
  } catch (error) { next(error); }
});

router.post('/cert-impact', async (req, res, next) => {
  try {
    const { certName, provider } = req.body;
    const prompt = `Analyze the career impact of ${certName} by ${provider || 'N/A'} on hiring probability, salary, and career growth.`;
    const result = await generateCareerJson('certImpact', prompt);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cert-linkedin-post', async (req, res, next) => {
  try {
    const { certName, provider, keyLearnings } = req.body;
    const prompt = `Generate a professional LinkedIn post announcing: Earned ${certName} from ${provider}. Key learnings: ${keyLearnings || 'skills and knowledge'}. Make it authentic and engaging.`;
    const result = await generateCareerJson('linkedInPost', prompt);
    res.json({ post: result.post || result });
  } catch (error) { next(error); }
});

export default router;

