import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Core identity
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, minlength: 8, select: false },

  // OAuth
  googleId:  { type: String, unique: true, sparse: true, index: true },
  provider:  { type: String, enum: ['local', 'google'], default: 'local' },

  // Profile
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  title:    { type: String, default: 'Career Explorer' },

  // Verification & status
  isVerified: { type: Boolean, default: false },
  verificationToken:        { type: String, select: false },
  verificationTokenExpires: { type: Date,   select: false },

  // Password reset
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false },

  // JWT refresh token (stored for rotation / revocation)
  refreshToken: { type: String, select: false },

  // Legacy Firebase field (kept for backward compat with existing records)
  firebaseUid: { type: String, unique: true, sparse: true, index: true },

  // Career profile
  profile: {
    bio:          String,
    skills:       [String],
    targetRole:   String,
    experience:   { type: Number, default: 0 },
    resumeScore:  { type: Number, default: 0 },
    education:    String,
    github:       String,
    linkedin:     String,
    interviewScore: { type: Number, default: 0 },
    projects:       [String],
    certifications: [String],
  },

  // Gamification
  xp:    { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: {
    current:    { type: Number, default: 0 },
    best:       { type: Number, default: 0 },
    lastActive: { type: String, default: '' },
  },

  // Career modules
  activeRoadmap:      { type: Object, default: null },
  activeSkillGap:     { type: Object, default: null },
  activeInterview:    { type: Object, default: null },
  completedInterviews:{ type: Array,  default: [] },

  // Job tracking
  jobApplications: { type: Array, default: [] },
  savedJobs:       { type: Array, default: [] },

  // Learning
  learningProgress: { type: Object, default: {} },
  completedTopics:  { type: Array,  default: [] },

  // Other
  certificates: { type: Array,  default: [] },
  careerGoals:  { type: Object, default: null },
  activityLog:  { type: Array,  default: [] },
  chatHistory:  { type: Array,  default: [] },
  badges:       { type: Array,  default: [] },

}, { timestamps: true });

/* ── Hooks ──────────────────────────────────────────────────────── */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ── Instance methods ────────────────────────────────────────────── */
userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.createVerificationToken = function () {
  const raw = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h
  return raw; // send raw; store hashed
};

userSchema.methods.createResetPasswordToken = function () {
  const raw = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 h
  return raw;
};

export default mongoose.model('User', userSchema);
