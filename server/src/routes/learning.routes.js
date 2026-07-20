import express from 'express';
import { protect } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';
import User from '../models/User.js';
import { updateLocalUser } from '../services/localAuthStore.js';
import { generateCareerJson } from '../services/gemini.js';

const router = express.Router();
router.use(protect);

// ─── Get personalized learning path ──────────────────────────────────────────
router.get('/path', async (req, res, next) => {
  try {
    const user = req.user;
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const skills = user.profile?.skills || [];
    const prompt = `Generate a personalized learning path for target role: ${targetRole}. Current skills: ${skills.join(', ')}. Recommend 2-3 priority tracks with topics, hours, and resources.`;
    const result = await generateCareerJson('learningPath', prompt);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── Get specific learning track content ─────────────────────────────────────
router.get('/track/:trackId', async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const user = req.user;
    const prompt = `Generate a comprehensive learning track for: ${trackId}. Include phases, topics, resources (free first), quizzes, and projects. Tailor to user's target role: ${user.profile?.targetRole || 'Full Stack Developer'}.`;
    const result = await generateCareerJson('learningTrack', prompt);
    // Merge with user's completed topics
    const completedTopics = user.completedTopics || [];
    if (result.phases) {
      result.phases = result.phases.map(phase => ({
        ...phase,
        topics: phase.topics.map(topic => ({
          ...topic,
          completed: completedTopics.includes(topic.id),
        }))
      }));
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── Mark topic as completed ──────────────────────────────────────────────────
router.post('/complete-topic', async (req, res, next) => {
  try {
    const { topicId, topicTitle, trackId } = req.body;
    const user = req.user;
    let completedTopics = Array.isArray(user.completedTopics) ? [...user.completedTopics] : [];
    const isAlreadyDone = completedTopics.includes(topicId);
    if (!isAlreadyDone) {
      completedTopics.push(topicId);
    } else {
      completedTopics = completedTopics.filter(id => id !== topicId);
    }
    const xpGain = isAlreadyDone ? 0 : 100;
    const newXp = (user.xp || 0) + xpGain;

    // Log activity
    let activityLog = Array.isArray(user.activityLog) ? [...user.activityLog] : [];
    if (!isAlreadyDone) {
      activityLog.push({ type: 'learning', topicId, topicTitle, trackId, date: new Date().toISOString().split('T')[0], xp: xpGain });
    }

    if (isDbReady()) {
      const dbUser = await User.findById(user.id);
      dbUser.completedTopics = completedTopics;
      dbUser.xp = newXp;
      dbUser.activityLog = activityLog;
      await dbUser.save();
    } else {
      await updateLocalUser(user.id, { completedTopics, xp: newXp, activityLog });
    }
    res.json({ topicId, completed: !isAlreadyDone, completedTopics, xpGained: xpGain, totalXp: newXp });
  } catch (error) {
    next(error);
  }
});

// ─── Generate AI Quiz ─────────────────────────────────────────────────────────
router.post('/quiz', async (req, res, next) => {
  try {
    const { topic, difficulty, count = 5 } = req.body;
    const prompt = `Generate ${count} quiz questions for: ${topic}. Difficulty: ${difficulty || 'Intermediate'}. Include MCQ with 4 options, correct answer, and explanation. Mix conceptual and practical questions.`;
    const result = await generateCareerJson('quizGenerate', prompt);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── Generate AI Notes / Cheat Sheet ─────────────────────────────────────────
router.post('/notes', async (req, res, next) => {
  try {
    const { topic, type = 'summary' } = req.body;
    const prompt = `Generate ${type} notes for: ${topic}. Include key concepts, syntax examples, common patterns, and interview tips. Format as structured markdown.`;
    const result = await generateCareerJson('chat', prompt);
    res.json({ notes: result.reply || `# ${topic} Notes\n\nKey concepts and patterns for ${topic}.`, type, topic });
  } catch (error) {
    next(error);
  }
});

// ─── Get project recommendations ──────────────────────────────────────────────
router.get('/projects/:level', async (req, res, next) => {
  try {
    const { level } = req.params;
    const user = req.user;
    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const skills = user.profile?.skills?.join(', ') || 'React, Node.js';
    const prompt = `Recommend 4 ${level} level projects for target role: ${targetRole}. User skills: ${skills}. Include project title, tech stack, description, features, estimated hours, and GitHub template link.`;
    const result = await generateCareerJson('chat', prompt);
    // Return structured fallback projects
    const fallbackProjects = {
      Beginner: [
        { title: 'Personal Portfolio Website', tech: ['HTML', 'CSS', 'JavaScript'], description: 'A responsive portfolio showcasing your projects and skills.', hours: 10, github: 'https://github.com/topics/portfolio' },
        { title: 'Todo App with Local Storage', tech: ['React', 'localStorage'], description: 'Full CRUD todo application with persistent storage.', hours: 8, github: 'https://github.com/topics/todo-app' },
        { title: 'Weather Dashboard', tech: ['React', 'OpenWeather API'], description: 'Real-time weather app with city search and 5-day forecast.', hours: 12, github: 'https://github.com/topics/weather-app' },
        { title: 'GitHub Profile Finder', tech: ['React', 'GitHub API'], description: 'Search and display GitHub user profiles and repositories.', hours: 10, github: 'https://github.com/topics/github-api' },
      ],
      Intermediate: [
        { title: 'Full Stack Blog Platform', tech: ['React', 'Node.js', 'MongoDB', 'JWT'], description: 'Blog platform with auth, CRUD posts, comments, and admin panel.', hours: 30, github: 'https://github.com/topics/blog' },
        { title: 'Real-time Chat App', tech: ['React', 'Socket.io', 'Node.js', 'MongoDB'], description: 'Multi-room chat with real-time messaging and online indicators.', hours: 25, github: 'https://github.com/topics/chat-app' },
        { title: 'E-Commerce Store', tech: ['React', 'Node.js', 'MongoDB', 'Stripe'], description: 'Full e-commerce with products, cart, checkout, and payment.', hours: 40, github: 'https://github.com/topics/ecommerce' },
        { title: 'AI Resume Analyzer', tech: ['React', 'Node.js', 'Gemini API'], description: 'Upload resume, get AI feedback on ATS score and improvements.', hours: 20, github: 'https://github.com/topics/resume' },
      ],
      Advanced: [
        { title: 'SaaS Analytics Dashboard', tech: ['Next.js', 'PostgreSQL', 'Redis', 'Recharts'], description: 'Multi-tenant SaaS with real-time metrics, WebSocket updates, and Redis caching.', hours: 60, github: 'https://github.com/topics/saas' },
        { title: 'Agentic RAG Knowledge Base', tech: ['LangChain', 'Pinecone', 'FastAPI', 'React'], description: 'Multi-document semantic search with LLM agents and memory.', hours: 50, github: 'https://github.com/topics/langchain' },
        { title: 'DevOps CI/CD Pipeline', tech: ['Docker', 'GitHub Actions', 'AWS', 'Nginx'], description: 'Full containerized app with automated testing, deployment, and monitoring.', hours: 45, github: 'https://github.com/topics/devops' },
        { title: 'LLM Fine-Tuning Platform', tech: ['PyTorch', 'HuggingFace', 'FastAPI', 'MLflow'], description: 'Custom model fine-tuning pipeline with tracking, evaluation, and serving.', hours: 70, github: 'https://github.com/topics/fine-tuning' },
      ],
    };
    res.json(fallbackProjects[level] || fallbackProjects.Intermediate);
  } catch (error) {
    next(error);
  }
});

export default router;
