import './config/dotenv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { validateEnv } from './config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { initializeFirebaseAdmin } from './config/firebase.js';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import userRoutes from './routes/user.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import platformRoutes from './routes/platform.routes.js';
import skillgapRoutes from './routes/skillgap.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import learningRoutes from './routes/learning.routes.js';
import progressRoutes from './routes/progress.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize environment check & Firebase Admin
validateEnv();
initializeFirebaseAdmin();

// Database pre-flight middleware for serverless / standalone
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Middleware] Connection error:', err);
  }
  next();
});

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Avoid blocking Vite or external assets in prod
}));

// Compression
app.use(compression());

// CORS — allow cookies from the frontend with dynamic origin validation
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or postman requests (no origin header)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => allowed === origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.includes('localhost:');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

// Passport (JWT only)
app.use(passport.initialize());

// Health check endpoint
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ ok: true, service: 'CareerPilot AI API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth',      authRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/roadmap',   roadmapRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/platform',  platformRoutes);
app.use('/api/skillgap',  skillgapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/jobs',      jobsRoutes);
app.use('/api/learning',  learningRoutes);
app.use('/api/progress',  progressRoutes);
app.use('/api/goals',     goalsRoutes);

// Serve static assets in production if hosted on single Node server
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
