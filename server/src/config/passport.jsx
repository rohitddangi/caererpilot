/**
 * config/passport.js
 * ─────────────────────────────────────────────────────────────────
 * Passport Google OAuth 2.0 strategy.
 * Dynamically supports MongoDB and local JSON-file fallback.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'crypto';
import { GOOGLE_CONFIGURED } from './env.jsx';
import { isDbReady } from './db.jsx';
import User from '../models/User.jsx';
import { readUsers, writeUsers, sanitizeLocalUser } from '../services/localAuthStore.jsx';

// Derive callback URL — prefer explicit GOOGLE_CALLBACK_URL env var,
// then fall back to SERVER_URL + fixed path.
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`;

if (GOOGLE_CONFIGURED) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  CALLBACK_URL,
        // Always fetch fresh profile data
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          console.log('[Passport Google Callback] Received OAuth profile:', {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            photosCount: profile.photos?.length || 0,
          });

          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            console.error('[Passport Google Callback] Error: profile missing email');
            return done(new Error('Google profile did not return an email address. Enable the email scope.'));
          }

          const photo = profile.photos?.[0]?.value || '';
          const name  = profile.displayName || email.split('@')[0];

          let user;
          if (isDbReady()) {
            console.log('[Passport Google Callback] DB is connected. Checking MongoDB...');
            /* ── 1. Find by Google ID (fastest path) ── */
            user = await User.findOne({ googleId: profile.id });

            if (!user) {
              console.log('[Passport Google Callback] Google ID not found in MongoDB. Searching by email:', email);
              /* ── 2. Find by email (may have registered with password earlier) ── */
              user = await User.findOne({ email });

              if (user) {
                console.log('[Passport Google Callback] Existing email account found in MongoDB. Linking Google ID...');
                // Link Google to existing email/password account
                let changed = false;
                if (!user.googleId)               { user.googleId   = profile.id; changed = true; }
                if (!user.isVerified)             { user.isVerified  = true;       changed = true; }
                if (photo && !user.avatar)        { user.avatar      = photo;      changed = true; }
                if (changed) {
                  await user.save({ validateBeforeSave: false });
                  console.log('[Passport Google Callback] Mongoose user linked and saved.');
                }

              } else {
                console.log('[Passport Google Callback] No existing user found. Creating brand-new Google user...');
                /* ── 3. Brand-new Google user ── */
                const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
                user = await User.create({
                  name,
                  email,
                  googleId:   profile.id,
                  avatar:     photo,
                  provider:   'google',
                  role:       email === adminEmail ? 'admin' : 'user',
                  isVerified: true,           // Google accounts are pre-verified
                });
                console.log('[Passport Google Callback] New Mongoose user created:', user._id);
              }

            } else {
              console.log('[Passport Google Callback] Google user found in MongoDB. Syncing profile changes...');
              /* ── 4. Existing Google user — sync profile changes ── */
              let changed = false;
              if (photo && user.avatar !== photo) { user.avatar = photo; changed = true; }
              if (changed) {
                await user.save({ validateBeforeSave: false });
                console.log('[Passport Google Callback] Mongoose user updated and saved.');
              }
            }
          } else {
            console.log('[Passport Google Callback] DB is not connected. Checking local JSON store...');
            // Local fallback
            const users = await readUsers();
            user = users.find(u => u.googleId === profile.id || u.email === email);

            if (user) {
              console.log('[Passport Google Callback] Google or email match found in local store. Updating properties...');
              let changed = false;
              if (!user.googleId) { user.googleId = profile.id; changed = true; }
              if (!user.isVerified) { user.isVerified = true; user.emailVerified = true; changed = true; }
              if (photo && !user.avatar) { user.avatar = photo; user.photoURL = photo; changed = true; }
              user.provider = 'google';
              if (changed) {
                await writeUsers(users);
                console.log('[Passport Google Callback] Local user updated and saved.');
              }
              user = sanitizeLocalUser(user);
            } else {
              console.log('[Passport Google Callback] Creating new user in local JSON store...');
              const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
              const newUser = {
                id: crypto.randomUUID(),
                googleId: profile.id,
                name,
                email,
                avatar: photo,
                photoURL: photo,
                provider: 'google',
                role: email === adminEmail ? 'admin' : 'user',
                isVerified: true,
                emailVerified: true,
                profile: { skills: [] },
                createdAt: new Date().toISOString(),
              };
              users.push(newUser);
              await writeUsers(users);
              console.log('[Passport Google Callback] New local user created and saved:', newUser.id);
              user = sanitizeLocalUser(newUser);
            }
          }

          console.log('[Passport Google Callback] Success. Passing user to Passport callback hook.');
          return done(null, user);
        } catch (err) {
          console.error('[Passport Google Strategy Error]', err);
          return done(err, null);
        }
      }
    )
  );

  console.log(`[Passport] ✅ Google OAuth configured → callback: ${CALLBACK_URL}`);
} else {
  console.warn('[Passport] ⚠️  Google OAuth NOT configured.');
  console.warn('            Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env');
  console.warn('            See docs/google-oauth-setup.md for step-by-step instructions.');
}

export { GOOGLE_CONFIGURED as isGoogleConfigured };
export default passport;
