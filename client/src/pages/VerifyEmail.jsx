import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, LogOut, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.jsx';
import toast from 'react-hot-toast';
import { AuthFrame } from './Login.jsx';

export default function VerifyEmail() {
  const { user, resendVerification, reloadUserStatus, logout, setAuthenticatedSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenInUrl = searchParams.get('token');

  const [resending, setResending]     = useState(false);
  const [checking, setChecking]       = useState(false);
  const [cooldown, setCooldown]       = useState(0);
  const [tokenStatus, setTokenStatus] = useState(tokenInUrl ? 'verifying' : null);

  // ── Auto-verify if a token is in the URL (clicked link from email) ──
  useEffect(() => {
    if (!tokenInUrl) return;

    setTokenStatus('verifying');
    api.get(`/auth/verify-email?token=${tokenInUrl}`)
      .then(({ data }) => {
        // Use context helper so React state is updated alongside localStorage
        // — without this the user stays null and /dashboard redirects back here
        setAuthenticatedSession(data.user, data.token);
        setTokenStatus('success');
        toast.success('Email verified! Redirecting you to the dashboard... 🚀');
        setTimeout(() => navigate('/dashboard', { replace: true }), 1800);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Link is invalid or has expired.';
        setTokenStatus('error');
        toast.error(msg);
      });
  }, []);  // eslint-disable-line

  // ── Redirect guards ──────────────────────────────────────────────
  useEffect(() => {
    if (!tokenInUrl && !user) navigate('/login', { replace: true });
    if (!tokenInUrl && user?.isVerified) navigate('/dashboard', { replace: true });
  }, [user, tokenInUrl, navigate]);

  // ── Cooldown countdown ───────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await resendVerification(user?.email);
      setCooldown(60);
    } finally {
      setResending(false);
    }
  }

  async function handleCheckStatus() {
    setChecking(true);
    try {
      const updated = await reloadUserStatus();
      if (updated?.isVerified) navigate('/dashboard', { replace: true });
    } finally {
      setChecking(false);
    }
  }

  // ── Token verification in progress or success/fail ──────────────
  if (tokenInUrl) {
    return (
      <AuthFrame
        title={
          tokenStatus === 'success'  ? 'Email Verified! 🎉' :
          tokenStatus === 'error'    ? 'Verification Failed' :
          'Verifying your email...'
        }
        subtitle={
          tokenStatus === 'success'  ? 'Your email has been verified. Redirecting to your dashboard.' :
          tokenStatus === 'error'    ? 'This link may have expired or already been used.' :
          'Please wait while we verify your email address.'
        }
      >
        <AnimatePresence mode="wait">
          {tokenStatus === 'verifying' && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-8">
              <Loader2 size={40} className="text-gold animate-spin" />
            </motion.div>
          )}
          {tokenStatus === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/30"
              >
                <CheckCircle size={38} className="text-emerald-400" />
              </motion.div>
              <p className="text-sm text-zinc-400">Redirecting you to the dashboard...</p>
            </motion.div>
          )}
          {tokenStatus === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 text-center py-4"
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-red-500/15 border border-red-500/30">
                <AlertCircle size={38} className="text-red-400" />
              </div>
              <p className="text-sm text-zinc-400 max-w-xs">
                The verification link is invalid or has expired (links are valid for 24 hours).
                Please request a new one.
              </p>
              <button
                onClick={() => navigate('/verify-email')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black"
              >
                Resend Verification Email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthFrame>
    );
  }

  // ── Default: waiting for user to verify ─────────────────────────
  if (!user) return null;

  return (
    <AuthFrame
      title="Verify your email"
      subtitle={`We sent a verification link to ${user.email}. Please check your inbox to activate your account.`}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gold/20 blur-md animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 border border-gold/40 text-gold">
            <Mail size={36} className="animate-bounce" />
          </div>
        </div>

        <div className="w-full space-y-3">
          {/* Check Status */}
          <motion.button
            onClick={handleCheckStatus}
            disabled={checking}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black shadow-[0_0_40px_rgba(214,168,58,0.25)] hover:shadow-[0_0_60px_rgba(214,168,58,0.4)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={17} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking Status...' : 'I Have Verified My Email'}
          </motion.button>

          {/* Resend */}
          <motion.button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.06] hover:border-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0
              ? `Resend Available in ${cooldown}s`
              : resending
              ? 'Resending Email...'
              : 'Resend Verification Email'}
          </motion.button>
        </div>

        {/* Info */}
        <div className="w-full text-left p-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] text-xs text-zinc-400 leading-relaxed">
          <p className="flex gap-2">
            <span className="text-gold shrink-0">💡</span>
            <span>
              Can't find the email? Check your <strong className="text-zinc-300">Spam</strong> or{' '}
              <strong className="text-zinc-300">Junk</strong> folder. The link is valid for 24 hours.
            </span>
          </p>
        </div>

        <div className="w-full border-t border-white/[0.08]" />

        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={13} />
          Sign out and use a different account
        </button>
      </div>
    </AuthFrame>
  );
}
