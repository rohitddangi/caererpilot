import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbReady } from '../config/db.js';
import { findLocalUserById } from '../services/localAuthStore.js';

/**
 * protect — verifies JWT access token, attaches req.user (Mongoose document or local user object).
 * Looks for token in:
 *   1. Authorization: Bearer <token>  (standard API header)
 *   2. cp_access_token cookie         (HTTP-only, set by login/refresh)
 */
export async function protect(req, res, next) {
  try {
    let token;

    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      token = header.slice(7);
    } else if (req.cookies?.cp_access_token) {
      token = req.cookies.cp_access_token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized — no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');

    let user;
    if (isDbReady()) {
      user = await User.findById(decoded.id).select('+refreshToken');
    } else {
      user = await findLocalUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('[Auth Middleware Error]', error);
    res.status(401).json({ message: 'Not authorized' });
  }
}

/**
 * adminOnly — must come after protect.
 */
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

/**
 * verifiedOnly — requires emailVerified (isVerified).
 * Must come after protect.
 */
export function verifiedOnly(req, res, next) {
  const isVerified = req.user?.isVerified ?? req.user?.emailVerified;
  if (process.env.NODE_ENV === 'production' && !isVerified && req.user?.provider === 'local') {
    return res.status(403).json({ message: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' });
  }
  next();
}

