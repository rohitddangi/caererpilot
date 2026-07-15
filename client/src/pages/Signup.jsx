import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthFrame } from './Login.jsx';
import { isFirebaseConfigured, auth, googleProvider } from '../firebase/firebase.jsx';
import { signInWithPopup } from 'firebase/auth';

/* ─────────────────────────────────────────────
   Password Strength Indicator
───────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One number', pass: /\d/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 pt-1"
    >
      {/* Strength bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full bg-white/[0.07] overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${strength >= i ? colors[strength] : ''}`}
              initial={{ width: 0 }}
              animate={{ width: strength >= i ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
        <span className="text-[11px] text-zinc-400 ml-1 min-w-[40px]">{labels[strength]}</span>
      </div>
      {/* Check list */}
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            {c.pass ? (
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            ) : (
              <Circle size={13} className="text-zinc-600 shrink-0" />
            )}
            <span className={`text-[11px] ${c.pass ? 'text-zinc-300' : 'text-zinc-500'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Google Button (inline for Signup)
───────────────────────────────────────────── */
function GoogleButton({ onClick, loading }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path d="M43.611 20.083H42V20H24v8h11.303C33.677 32.693 29.265 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
          <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
          <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.266 0-9.678-3.307-11.303-7.917l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
          <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C39.712 36.898 44 31 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
        </svg>
      )}
      {loading ? 'Connecting...' : 'Sign up with Google'}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   SIGNUP PAGE
───────────────────────────────────────────── */
export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup, googleLogin, firebaseLogin } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Full name must be at least 2 characters.';
    if (!form.email) return 'Please enter your email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!agreed) return 'Please accept the Terms & Conditions.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup({ name: form.name.trim(), email: form.email, password: form.password });
      // Navigate to email verification page — backend does NOT issue tokens on register
      navigate('/verify-email', { replace: true });
    } catch {
      // error toast handled in context
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError?.('');
    setGoogleLoading(true);
    try {
      if (isFirebaseConfigured) {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        const userPayload = {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          picture: result.user.photoURL,
          emailVerified: result.user.emailVerified,
        };
        await firebaseLogin(token, userPayload);
        navigate('/dashboard', { replace: true });
      } else {
        // googleLogin triggers a full-page redirect — if it returns, it means OAuth isn't configured
        await googleLogin();
      }
    } catch (err) {
      console.error('[Google Auth Error]:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError?.(err.message || 'Unable to connect to Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Start your AI-powered career acceleration journey today."
      wide
    >
      {/* Google Sign Up */}
      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-1 border-t border-white/[0.08]" />
        <span className="mx-4 text-xs text-zinc-500 font-medium">or register with email</span>
        <div className="flex-1 border-t border-white/[0.08]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
            <User size={17} />
          </div>
          <input
            id="signup-name"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Full name"
            required
            className="w-full rounded-2xl border border-white/[0.08] bg-black/30 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-gold/60 focus:ring-4 focus:ring-gold/[0.12]"
          />
        </div>

        {/* Email */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
            <Mail size={17} />
          </div>
          <input
            id="signup-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="Email address"
            required
            className="w-full rounded-2xl border border-white/[0.08] bg-black/30 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-gold/60 focus:ring-4 focus:ring-gold/[0.12]"
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
              <Lock size={17} />
            </div>
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="Password"
              required
              className="w-full rounded-2xl border border-white/[0.08] bg-black/30 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-gold/60 focus:ring-4 focus:ring-gold/[0.12]"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <AnimatePresence>
            {form.password && <PasswordStrength password={form.password} />}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
            <Lock size={17} />
          </div>
          <input
            id="signup-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Confirm password"
            required
            className={`w-full rounded-2xl border bg-black/30 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:ring-4 focus:ring-gold/[0.12] ${
              form.confirmPassword && form.password !== form.confirmPassword
                ? 'border-red-500/50 focus:border-red-500/70'
                : 'border-white/[0.08] focus:border-gold/60'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="mt-1.5 text-[11px] text-red-400 pl-1">Passwords don't match</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                agreed ? 'border-gold bg-gold' : 'border-white/20 bg-white/[0.04] group-hover:border-gold/40'
              }`}
            >
              {agreed && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  width="11" height="9" viewBox="0 0 11 9" fill="none"
                >
                  <path d="M1 4L4 7L10 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              )}
            </div>
          </div>
          <span className="text-sm text-zinc-400 leading-relaxed">
            I agree to the{' '}
            <span className="text-gold hover:text-champagne transition-colors cursor-pointer font-medium">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-gold hover:text-champagne transition-colors cursor-pointer font-medium">
              Privacy Policy
            </span>
          </span>
        </label>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || googleLoading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black shadow-[0_0_40px_rgba(214,168,58,0.25)] transition hover:shadow-[0_0_60px_rgba(214,168,58,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account →'
          )}
        </motion.button>

        {/* Login link */}
        <p className="text-center text-sm text-zinc-400 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold hover:text-champagne transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
