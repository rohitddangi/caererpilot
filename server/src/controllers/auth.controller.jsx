/**
 * controllers/auth.controller.js
 * ─────────────────────────────────────────────────────────────────
 * Handler functions for all auth routes.
 * Dynamically supports MongoDB (via Mongoose) and Local JSON Store (via localAuthStore).
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.jsx';
import { isDbReady } from '../config/db.jsx';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.jsx';
import { readUsers, writeUsers, sanitizeLocalUser, syncFirebaseLocalUser } from '../services/localAuthStore.jsx';
import admin, { isFirebaseConfigured } from '../config/firebase.jsx';

/* ── Constants ───────────────────────────────────────────────────── */

const JWT_SECRET         = () => process.env.JWT_SECRET         || 'dev-jwt-secret-change-me';
const JWT_REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';
const ACCESS_EXPIRES     = () => process.env.JWT_EXPIRES_IN          || '15m';
const REFRESH_EXPIRES    = () => process.env.JWT_REFRESH_EXPIRES_IN  || '7d';
export const CLIENT_URL  = () => process.env.CLIENT_URL || 'http://localhost:5173';

export const COOKIE_OPTIONS = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path:     '/',
});

/* ── Token helpers ───────────────────────────────────────────────── */

export function signAccessToken(user) {
  const id = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    { id, role: user.role },
    JWT_SECRET(),
    { expiresIn: ACCESS_EXPIRES() }
  );
}

export function signRefreshToken(user) {
  const id = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    { id },
    JWT_REFRESH_SECRET(),
    { expiresIn: REFRESH_EXPIRES() }
  );
}

/** Strip sensitive fields before sending to client */
export function sanitizeUser(user) {
  const isVerified = process.env.NODE_ENV !== 'production' ? true : user.isVerified;
  return {
    id:         user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    title:      user.title || 'Career Explorer',
    avatar:     user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=d6a83a&color=000&bold=true&size=128`,
    provider:   user.provider || 'local',
    isVerified,
    // Backward-compat aliases
    emailVerified: isVerified,
    authProvider:  user.provider || 'local',
    // Career data
    profile:    user.profile || {},
    xp:         user.xp    || 0,
    level:      user.level || 1,
    streak:     user.streak || { current: 0, best: 0, lastActive: '' },
    createdAt:  user.createdAt,
  };
}

/**
 * Persist refresh token (hashed) to DB/Store, set HTTP-only cookie, return JSON.
 */
export async function issueTokens(res, user, statusCode = 200) {
  const isMongoose = typeof user.save === 'function';
  const userId = isMongoose ? user._id.toString() : user.id;

  const accessToken  = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  if (isDbReady() && isMongoose) {
    user.refreshToken = hashedToken;
    await user.save({ validateBeforeSave: false });
  } else {
    const users = await readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].refreshToken = hashedToken;
      await writeUsers(users);
    }
  }

  res.cookie('cp_refresh_token', refreshToken, COOKIE_OPTIONS());

  const sanitized = isMongoose ? sanitizeUser(user) : sanitizeLocalUser(user);

  return res.status(statusCode).json({
    token: accessToken,
    user:  sanitized,
  });
}

/* ════════════════════════════════════════════════════════════════════
   REGISTER
   POST /api/auth/register
   ════════════════════════════════════════════════════════════════════ */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    let user;

    if (isDbReady()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }

      user = new User({
        name:     name.trim(),
        email:    normalizedEmail,
        password,
        provider: 'local',
        role:     normalizedEmail === adminEmail ? 'admin' : 'user',
        isVerified: false,
        verificationToken: hashedToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await user.save();
    } else {
      const users = await readUsers();
      const existing = users.find(u => u.email === normalizedEmail);
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        provider: 'local',
        role: normalizedEmail === adminEmail ? 'admin' : 'user',
        title: normalizedEmail === adminEmail ? 'Founder Admin' : 'CareerPilot Member',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d6a83a&color=000&bold=true&size=128`,
        isVerified: false,
        emailVerified: false,
        verificationToken: hashedToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        profile: { skills: [] },
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await writeUsers(users);
      user = newUser;
    }

    // Fire-and-forget — don't block the response
    sendVerificationEmail({ name: user.name, email: user.email }, rawToken).catch(
      (err) => console.error('[Register] Failed to send verification email:', err.message)
    );

    const sanitized = isDbReady() ? sanitizeUser(user) : sanitizeLocalUser(user);

    return res.status(201).json({
      message: 'Account created! Check your email for a verification link.',
      user:    sanitized,
      ...(process.env.NODE_ENV !== 'production' && { debugToken: rawToken }),
    });
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   LOGIN
   POST /api/auth/login
   ════════════════════════════════════════════════════════════════════ */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    let user;

    if (isDbReady()) {
      user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (process.env.NODE_ENV === 'production' && !user.isVerified && user.provider === 'local') {
        return res.status(403).json({
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          code:    'EMAIL_NOT_VERIFIED',
        });
      }
    } else {
      const users = await readUsers();
      const rawUser = users.find(u => u.email === normalizedEmail);
      if (!rawUser || !(await bcrypt.compare(password, rawUser.password))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const userObj = sanitizeLocalUser(rawUser);
      if (process.env.NODE_ENV === 'production' && !userObj.isVerified && userObj.provider === 'local') {
        return res.status(403).json({
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          code:    'EMAIL_NOT_VERIFIED',
        });
      }
      user = rawUser;
    }

    return issueTokens(res, user);
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   LOGOUT
   POST /api/auth/logout
   ════════════════════════════════════════════════════════════════════ */
export async function logout(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    if (isDbReady()) {
      await User.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
    } else {
      const users = await readUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        delete users[idx].refreshToken;
        await writeUsers(users);
      }
    }
  } catch { /* non-fatal */ }

  const cookieOpts = COOKIE_OPTIONS();
  res.clearCookie('cp_refresh_token', {
    httpOnly: cookieOpts.httpOnly,
    secure:   cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path:     '/',
  });

  return res.json({ message: 'Logged out successfully.' });
}

/* ════════════════════════════════════════════════════════════════════
   REFRESH TOKEN
   POST /api/auth/refresh
   ════════════════════════════════════════════════════════════════════ */
export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.cp_refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token provided.' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET());
    } catch (err) {
      return res.status(401).json({
        message: err.name === 'TokenExpiredError'
          ? 'Refresh token expired. Please log in again.'
          : 'Invalid refresh token.',
      });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    let user;
    if (isDbReady()) {
      user = await User.findOne({ _id: decoded.id, refreshToken: hashed }).select('+refreshToken');
    } else {
      const users = await readUsers();
      user = users.find(u => u.id === decoded.id && u.refreshToken === hashed);
    }

    if (!user) {
      return res.status(401).json({
        message: 'Refresh token invalid or already used. Please log in again.',
      });
    }

    return issueTokens(res, user);
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   VERIFY EMAIL
   GET /api/auth/verify-email?token=<raw>
   ════════════════════════════════════════════════════════════════════ */
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is required.' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    let user;
    if (isDbReady()) {
      user = await User.findOne({
        verificationToken:        hashed,
        verificationTokenExpires: { $gt: new Date() },
      }).select('+verificationToken +verificationTokenExpires');

      if (!user) {
        return res.status(400).json({ message: 'Verification link is invalid or has expired. Request a new one.' });
      }

      user.isVerified               = true;
      user.verificationToken        = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
    } else {
      const users = await readUsers();
      const rawUser = users.find(u => u.verificationToken === hashed && new Date(u.verificationTokenExpires) > new Date());

      if (!rawUser) {
        return res.status(400).json({ message: 'Verification link is invalid or has expired. Request a new one.' });
      }

      rawUser.isVerified = true;
      rawUser.emailVerified = true;
      rawUser.verificationToken = undefined;
      rawUser.verificationTokenExpires = undefined;
      await writeUsers(users);
      user = rawUser;
    }

    return issueTokens(res, user);
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   RESEND VERIFICATION
   POST /api/auth/resend-verification
   ════════════════════════════════════════════════════════════════════ */
export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const normalizedEmail = email.toLowerCase();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    let userFound = false;
    let name = '';

    if (isDbReady()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+verificationToken +verificationTokenExpires');
      if (user && !user.isVerified && user.provider === 'local') {
        user.verificationToken = hashed;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        userFound = true;
        name = user.name;
      }
    } else {
      const users = await readUsers();
      const user = users.find(u => u.email === normalizedEmail);
      if (user && !user.isVerified && user.provider === 'local') {
        user.verificationToken = hashed;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await writeUsers(users);
        userFound = true;
        name = user.name;
      }
    }

    // Always return success to prevent email enumeration
    if (userFound) {
      sendVerificationEmail({ name, email: normalizedEmail }, rawToken).catch(console.error);
    }

    return res.json({ message: 'If your account exists and is unverified, a new link has been sent.' });
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   FORGOT PASSWORD
   POST /api/auth/forgot-password
   ════════════════════════════════════════════════════════════════════ */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const normalizedEmail = email.toLowerCase();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    let userFound = false;
    let name = '';

    if (isDbReady()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordToken +resetPasswordExpires');
      if (user && user.provider === 'local') {
        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save({ validateBeforeSave: false });
        userFound = true;
        name = user.name;
      }
    } else {
      const users = await readUsers();
      const user = users.find(u => u.email === normalizedEmail);
      if (user && user.provider === 'local') {
        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await writeUsers(users);
        userFound = true;
        name = user.name;
      }
    }

    // Always return success — prevents email enumeration
    if (userFound) {
      sendPasswordResetEmail({ name, email: normalizedEmail }, rawToken).catch(console.error);
    }

    return res.json({ message: 'If that email is registered, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   RESET PASSWORD
   POST /api/auth/reset-password
   ════════════════════════════════════════════════════════════════════ */
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    let user;
    if (isDbReady()) {
      user = await User.findOne({
        resetPasswordToken:   hashed,
        resetPasswordExpires: { $gt: new Date() },
      }).select('+resetPasswordToken +resetPasswordExpires +refreshToken');

      if (!user) {
        return res.status(400).json({ message: 'Reset link is invalid or has expired (links expire after 1 hour).' });
      }

      user.password             = password;
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpires = undefined;
      user.refreshToken         = undefined;  // Invalidate ALL active sessions
      user.isVerified           = true;       // Auto-verify if they can receive email
      await user.save();
    } else {
      const users = await readUsers();
      const rawUser = users.find(u => u.resetPasswordToken === hashed && new Date(u.resetPasswordExpires) > new Date());

      if (!rawUser) {
        return res.status(400).json({ message: 'Reset link is invalid or has expired (links expire after 1 hour).' });
      }

      rawUser.password             = await bcrypt.hash(password, 12);
      rawUser.resetPasswordToken   = undefined;
      rawUser.resetPasswordExpires = undefined;
      rawUser.refreshToken         = undefined;
      rawUser.isVerified           = true;
      rawUser.emailVerified        = true;
      await writeUsers(users);
      user = rawUser;
    }

    const cookieOpts = COOKIE_OPTIONS();
    res.clearCookie('cp_refresh_token', {
      httpOnly: cookieOpts.httpOnly,
      secure:   cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path:     '/',
    });

    return res.json({ message: 'Password updated. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
}

/* ════════════════════════════════════════════════════════════════════
   ME (current user)
   GET /api/auth/me
   ════════════════════════════════════════════════════════════════════ */
export function me(req, res) {
  const sanitized = isDbReady() ? sanitizeUser(req.user) : sanitizeLocalUser(req.user);
  return res.json({ user: sanitized });
}

/* ════════════════════════════════════════════════════════════════════
   GOOGLE OAUTH CALLBACK HANDLER
   GET /api/auth/google/callback
   ════════════════════════════════════════════════════════════════════ */
export async function googleCallback(req, res) {
  try {
    const user = req.user;
    if (!user) {
      console.error('[Google OAuth Callback Router] Error: req.user is missing');
      return res.redirect(`${CLIENT_URL()}/login?error=google_failed`);
    }

    const isMongoose = typeof user.save === 'function';
    const userId = isMongoose ? user._id.toString() : user.id;

    console.log('[Google OAuth Callback Router] Authenticated user:', {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      isMongoose
    });

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    console.log('[Google OAuth Callback Router] Generated JWT tokens successfully.');

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    if (isDbReady() && isMongoose) {
      console.log('[Google OAuth Callback Router] Saving hashed refresh token to MongoDB...');
      user.refreshToken = hashedToken;
      await user.save({ validateBeforeSave: false });
      console.log('[Google OAuth Callback Router] Token saved to MongoDB.');
    } else {
      console.log('[Google OAuth Callback Router] Saving hashed refresh token to Local JSON store...');
      const users = await readUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].refreshToken = hashedToken;
        await writeUsers(users);
        console.log('[Google OAuth Callback Router] Token saved to Local JSON store.');
      } else {
        console.error('[Google OAuth Callback Router] Error: user not found in local store during token saving');
      }
    }

    console.log('[Google OAuth Callback Router] Setting cp_refresh_token cookie...');
    res.cookie('cp_refresh_token', refreshToken, COOKIE_OPTIONS());

    const sanitized = isMongoose ? sanitizeUser(user) : sanitizeLocalUser(user);
    const userJson = encodeURIComponent(JSON.stringify(sanitized));
    const redirectUrl = `${CLIENT_URL()}/auth/callback?token=${accessToken}&user=${userJson}`;
    
    console.log('[Google OAuth Callback Router] Redirecting to frontend callback URL:', CLIENT_URL());
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('[Google OAuth Callback Error]', error);
    return res.redirect(`${CLIENT_URL()}/login?error=google_auth_failed`);
  }
}

/* ════════════════════════════════════════════════════════════════════
   FIREBASE TOKEN SYNC / LOGIN
   POST /api/auth/firebase-sync
   ════════════════════════════════════════════════════════════════════ */
export async function firebaseSync(req, res, next) {
  try {
    const { token, user: clientUser } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    let uid, email, name, picture, emailVerified;

    if (isFirebaseConfigured()) {
      try {
        console.log('[Firebase Sync] Verifying ID token with Firebase Admin...');
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
        email = decodedToken.email;
        name = decodedToken.name;
        picture = decodedToken.picture;
        emailVerified = decodedToken.email_verified;
        console.log('[Firebase Sync] Token verified successfully for:', email);
      } catch (err) {
        console.error('[Firebase Sync] Token verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid or expired Firebase ID token.' });
      }
    } else {
      // Developer Mode: decode JWT payload securely without signature check.
      // Falls back to request-body details if token is not standard or parse fails.
      try {
        console.log('[Firebase Sync] Admin SDK not configured. Parsing token in dev-mode...');
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          uid = payload.sub || payload.user_id;
          email = payload.email;
          name = payload.name;
          picture = payload.picture;
          emailVerified = payload.email_verified;
        }
      } catch (err) {
        console.warn('[Firebase Sync] Dev token parsing failed:', err.message);
      }

      // If token parsing didn't yield values, use clientUser body info
      if (!uid || !email) {
        if (clientUser && clientUser.uid && clientUser.email) {
          console.log('[Firebase Sync] Using client-provided user details as fallback.');
          uid = clientUser.uid;
          email = clientUser.email;
          name = clientUser.name;
          picture = clientUser.picture;
          emailVerified = clientUser.emailVerified;
        } else {
          return res.status(400).json({ message: 'Missing user credentials or invalid token format.' });
        }
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Firebase identity did not return an email address.' });
    }

    let user;

    if (isDbReady()) {
      console.log('[Firebase Sync] MongoDB is connected. Syncing Mongo user...');
      const normalizedEmail = email.toLowerCase();
      const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

      // Find user by firebaseUid or email
      user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: normalizedEmail }] });

      if (user) {
        console.log('[Firebase Sync] Existing user found in MongoDB. Updating profile...');
        let changed = false;
        if (!user.firebaseUid) { user.firebaseUid = uid; changed = true; }
        if (picture && !user.avatar) { user.avatar = picture; changed = true; }
        if (emailVerified !== undefined && user.isVerified !== emailVerified) {
          user.isVerified = emailVerified;
          changed = true;
        }
        if (user.provider !== 'google') {
          user.provider = 'google';
          changed = true;
        }
        if (changed) {
          await user.save({ validateBeforeSave: false });
        }
      } else {
        console.log('[Firebase Sync] Creating new user in MongoDB...');
        user = await User.create({
          name: name || email.split('@')[0],
          email: normalizedEmail,
          firebaseUid: uid,
          avatar: picture || '',
          provider: 'google',
          role: normalizedEmail === adminEmail ? 'admin' : 'user',
          isVerified: emailVerified ?? true,
        });
      }
    } else {
      console.log('[Firebase Sync] MongoDB is not connected. Syncing local JSON user...');
      // Sync local user using the localAuthStore helper
      user = await syncFirebaseLocalUser({
        uid,
        email,
        name,
        picture,
        emailVerified,
        authProvider: 'google',
      });
    }

    // Issue local JWT credentials and set refresh cookie
    console.log('[Firebase Sync] User synced successfully. Issuing local session tokens...');
    return issueTokens(res, user);
  } catch (error) {
    console.error('[Firebase Sync Error]', error);
    next(error);
  }
}
