import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { isFirebaseConfigured, auth, googleProvider } from '../firebase/firebase.jsx';
import { signInWithPopup } from 'firebase/auth';

/* ─────────────────────────────────────────────
   Shared AuthFrame — used by Login, Signup, ForgotPassword
   ───────────────────────────────────────────── */
export function AuthFrame({ children, title, subtitle, wide = false }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-obsidian px-4 py-10 overflow-hidden">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gold/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-champagne/15 blur-[100px]"
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(214,168,58,0.5) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-[2rem] border border-white/[0.08] bg-white/[0.045] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-[32px]`}
      >
        {/* Logo */}
        <div className="mb-8 inline-block">
          <Logo size="md" subtitle="Career Intelligence Platform" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">{title}</h1>
        <p className="text-sm text-zinc-400 mb-7 leading-relaxed">{subtitle}</p>

        {children}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Reusable Input Field
───────────────────────────────────────────── */
function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, rightElement, id }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors duration-200">
        <Icon size={17} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-2xl border border-white/[0.08] bg-black/30 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-gold/60 focus:ring-4 focus:ring-gold/[0.12] focus:bg-black/40"
      />
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Google Button
───────────────────────────────────────────── */
function GoogleButton({ onClick, loading, label }) {
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
      {loading ? 'Connecting...' : label}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Divider
───────────────────────────────────────────── */
function Divider() {
  return (
    <div className="relative flex items-center my-5">
      <div className="flex-1 border-t border-white/[0.08]" />
      <span className="mx-4 text-xs text-zinc-500 font-medium">or continue with email</span>
      <div className="flex-1 border-t border-white/[0.08]" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, googleLogin, firebaseLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = location.state?.from?.pathname || '/dashboard';

  // Handle errors redirected back from Google OAuth
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'google_failed') {
      setError('Google sign-in failed. Please try again or use email and password.');
      // Clean the URL without reloading
      window.history.replaceState({}, '', '/login');
    } else if (errorParam === 'google_auth_failed') {
      setError('A server error occurred during Google sign-in. Please try again.');
      window.history.replaceState({}, '', '/login');
    }
  }, []);  // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
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
        navigate(from, { replace: true });
      } else {
        // googleLogin() triggers a full-page redirect to Google.
        // If Google is not configured, it shows a toast and returns — we then clear loading.
        // If it redirects, the page unloads and setGoogleLoading(false) never runs (fine).
        await googleLogin();
      }
    } catch (err) {
      console.error('[Google Auth Error]:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Unable to connect to Google. Please try again.');
      }
    } finally {
      // Only reached if googleLogin() returned without redirecting or Firebase flow finished/failed
      setGoogleLoading(false);
    }
  }

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to continue your career acceleration journey."
    >
      {/* Google Sign In */}
      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continue with Google" />

      <Divider />

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="login-email"
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          id="login-password"
          icon={Lock}
          type={showPass ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-zinc-400 hover:text-gold transition-colors font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error message */}
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
              Signing in...
            </>
          ) : (
            'Sign In →'
          )}
        </motion.button>

        {/* Sign up link */}
        <p className="text-center text-sm text-zinc-400 pt-1">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-gold hover:text-champagne transition-colors">
            Create one free
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
