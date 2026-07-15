import './config/dotenv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from './config/passport.jsx';
import { validateEnv } from './config/env.jsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.jsx';
import { initializeFirebaseAdmin } from './config/firebase.jsx';
import authRoutes from './routes/auth.routes.jsx';
import aiRoutes from './routes/ai.routes.jsx';
import roadmapRoutes from './routes/roadmap.routes.jsx';
import userRoutes from './routes/user.routes.jsx';
import resourceRoutes from './routes/resource.routes.jsx';
import platformRoutes from './routes/platform.routes.jsx';
import skillgapRoutes from './routes/skillgap.routes.jsx';
import interviewRoutes from './routes/interview.routes.jsx';
import jobsRoutes from './routes/jobs.routes.jsx';
import learningRoutes from './routes/learning.routes.jsx';
import progressRoutes from './routes/progress.routes.jsx';
import goalsRoutes from './routes/goals.routes.jsx';
import { errorHandler, notFound } from './middleware/error.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Run environment check — prints warnings for missing/placeholder vars
validateEnv();

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

await connectDB();

// Security headers
app.use(helmet());

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

// Cookie parsing (needed for HTTP-only refresh token)
app.use(cookieParser());

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter (per-route limiters are stricter for auth endpoints)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

// Passport (no sessions — JWT only)
app.use(passport.initialize());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'CareerPilot AI API', timestamp: new Date().toISOString() });
});

// Routes
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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`CareerPilot AI API running on port ${port}`);
});
