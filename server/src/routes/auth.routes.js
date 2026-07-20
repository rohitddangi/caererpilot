/**
 * routes/auth.routes.js
 * ─────────────────────────────────────────────────────────────────
 * All authentication routes:
 *   POST  /api/auth/register
 *   POST  /api/auth/login
 *   POST  /api/auth/logout
 *   POST  /api/auth/refresh
 *   GET   /api/auth/verify-email?token=
 *   POST  /api/auth/resend-verification
 *   POST  /api/auth/forgot-password
 *   POST  /api/auth/reset-password
 *   GET   /api/auth/me
 *   GET   /api/auth/google
 *   GET   /api/auth/google/callback
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import passport, { isGoogleConfigured } from '../config/passport.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
  googleCallback,
  firebaseSync,
  CLIENT_URL,
} from '../controllers/auth.controller.js';

const router = express.Router();

/* ── Rate limiters ───────────────────────────────────────────────── */

/** Strict limiter for auth mutations */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      10,
  message:  { message: 'Too many requests. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/** Extra-strict limiter for password reset (abuse prevention) */
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      5,
  message:  { message: 'Too many password reset requests. Please wait an hour and try again.' },
});

/* ── Input validation middleware ─────────────────────────────────── */

const registerSchema = z.object({
  name:     z.string().trim().min(2,  'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || 'Validation failed' });
      }
      next(error);
    }
  };
}

/* ── Google OAuth guard ──────────────────────────────────────────── */

/**
 * Returns a 503 with clear instructions if Google credentials are not set.
 * This prevents Passport from throwing a cryptic error.
 */
function requireGoogle(req, res, next) {
  if (!isGoogleConfigured) {
    return res.status(503).json({
      message: 'Google Sign-In is not configured on this server.',
      fix:     'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env, then restart.',
      docs:    'See docs/google-oauth-setup.md for a step-by-step guide.',
    });
  }
  next();
}

/* ══════════════════════════════════════════════════════════════════
   EMAIL / PASSWORD ROUTES
   ══════════════════════════════════════════════════════════════════ */

/** Create account + send verification email */
router.post('/register', authLimiter, validate(registerSchema), register);

/** Login → access token (body) + refresh token (HTTP-only cookie) */
router.post('/login', authLimiter, validate(loginSchema), login);

/** Logout → clear cookie + revoke refresh token */
router.post('/logout', protect, logout);

/** Rotate refresh token → new access token + new refresh cookie */
router.post('/refresh', refresh);

/** Click-to-verify email link (emailed to user after register) */
router.get('/verify-email', verifyEmail);

/** Re-send the email verification link */
router.post('/resend-verification', authLimiter, resendVerification);

/** Send password reset email */
router.post('/forgot-password', forgotLimiter, forgotPassword);

/** Consume reset token and set new password */
router.post('/reset-password', authLimiter, resetPassword);

/** Get current authenticated user */
router.get('/me', protect, me);

/* ══════════════════════════════════════════════════════════════════
   GOOGLE OAUTH ROUTES
   ══════════════════════════════════════════════════════════════════ */

/**
 * Step 1 — Redirect user to Google's consent screen.
 * Frontend calls: window.location.href = '/api/auth/google'
 */
router.get(
  '/google',
  requireGoogle,
  passport.authenticate('google', {
    scope:   ['profile', 'email'],
    session: false,
    prompt:  'select_account',    // Always show account picker
  })
);

/**
 * Step 2 — Google redirects back here after user grants consent.
 * On success:  redirect to CLIENT_URL/auth/callback?token=...&user=...
 * On failure:  redirect to CLIENT_URL/login?error=google_failed
 */
router.get(
  '/google/callback',
  requireGoogle,
  passport.authenticate('google', {
    session:         false,
    failureRedirect: `${CLIENT_URL()}/login?error=google_failed`,
    failureMessage:  true,
  }),
  googleCallback
);

/* ══════════════════════════════════════════════════════════════════
   LEGACY / COMPAT ROUTES
   ══════════════════════════════════════════════════════════════════ */

/** Firebase sync and authentication endpoint */
router.post('/firebase-sync', authLimiter, firebaseSync);

/** Alias: /signup → /register (307 preserves POST body) */
router.post('/signup', (_req, res) => res.redirect(307, '/api/auth/register'));

export default router;
