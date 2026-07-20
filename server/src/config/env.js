/**
 * config/env.js
 * ─────────────────────────────────────────────────────────────────
 * Centralised environment validation.
 * Called once at server startup — prints clear warnings about
 * missing or placeholder variables so you know exactly what to fix.
 * Does NOT throw / exit so the server stays up for non-OAuth features.
 */

const PLACEHOLDER_PATTERNS = ['your-', 'replace-', 'xxx', 'changeme', 'paste_', 'paste-', 'placeholder', 'example', 'change_me'];

function isPlaceholder(value) {
  if (!value) return true;
  const v = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => v.startsWith(p));
}

function check(name, required = false) {
  const value = process.env[name];
  if (!value || isPlaceholder(value)) {
    const level = required ? '❌ REQUIRED' : '⚠️  OPTIONAL';
    console.warn(`  ${level}  ${name} — ${value ? 'still set to placeholder' : 'not set'}`);
    return false;
  }
  return true;
}

export function validateEnv() {
  console.log('\n─────────────────────────────────────────────');
  console.log('  CareerPilot AI — Environment Check');
  console.log('─────────────────────────────────────────────');

  let allGood = true;

  // Core
  const mongoOk  = check('MONGO_URI', true);
  const jwtOk    = check('JWT_SECRET', true);
  const refOk    = check('JWT_REFRESH_SECRET', true);
  const clientOk = check('CLIENT_URL', true);
  if (!mongoOk || !jwtOk || !refOk || !clientOk) allGood = false;

  // Google OAuth
  const gClientOk   = check('GOOGLE_CLIENT_ID');
  const gSecretOk   = check('GOOGLE_CLIENT_SECRET');
  const gCallbackOk = check('GOOGLE_CALLBACK_URL');
  const googleOk    = gClientOk && gSecretOk && gCallbackOk;

  // Email
  check('SMTP_HOST');
  check('SMTP_USER');

  // Summary
  console.log('─────────────────────────────────────────────');
  if (!mongoOk)  console.log('  ⚡ App running in DEMO mode (no MongoDB). Set MONGO_URI to enable persistence.');
  
  if (!googleOk) {
    console.log('  ⚡ Google OAuth DISABLED due to setup issue:');
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('     - GOOGLE_CLIENT_ID is not set in .env');
    } else if (isPlaceholder(process.env.GOOGLE_CLIENT_ID)) {
      console.log(`     - GOOGLE_CLIENT_ID is a placeholder ("${process.env.GOOGLE_CLIENT_ID.substring(0, 15)}...")`);
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
      console.log('     - GOOGLE_CLIENT_SECRET is not set in .env');
    } else if (isPlaceholder(process.env.GOOGLE_CLIENT_SECRET)) {
      console.log(`     - GOOGLE_CLIENT_SECRET is a placeholder ("${process.env.GOOGLE_CLIENT_SECRET.substring(0, 15)}...")`);
    }

    if (!process.env.GOOGLE_CALLBACK_URL) {
      console.log('     - GOOGLE_CALLBACK_URL is not set in .env');
    } else if (isPlaceholder(process.env.GOOGLE_CALLBACK_URL)) {
      console.log(`     - GOOGLE_CALLBACK_URL is a placeholder ("${process.env.GOOGLE_CALLBACK_URL.substring(0, 15)}...")`);
    }
    console.log('     Please see docs/google-oauth-setup.md to configure Google OAuth.');
  } else {
    console.log('  ✅ Google OAuth ENABLED (keys verified).');
  }

  if (!clientOk) console.log('  ⚡ CLIENT_URL is not set. CORS policy will default to localhost:5173.');
  if (!jwtOk || !refOk) console.log('  ⚡ Using insecure dev JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET!');
  if (allGood && googleOk) console.log('  ✅ All required environment variables are set.');
  console.log('─────────────────────────────────────────────\n');

  return { mongoOk, jwtOk, googleOk };
}

/** True only when Google credentials are real (not placeholders) */
export const GOOGLE_CONFIGURED =
  !isPlaceholder(process.env.GOOGLE_CLIENT_ID) &&
  !isPlaceholder(process.env.GOOGLE_CLIENT_SECRET) &&
  !isPlaceholder(process.env.GOOGLE_CALLBACK_URL);
