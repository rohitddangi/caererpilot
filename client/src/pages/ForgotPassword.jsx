import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, SendHorizonal } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthFrame } from './Login.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      <AnimatePresence mode="wait">
        {sent ? (
          /* ── Success State ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center gap-5 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/30"
            >
              <CheckCircle2 size={38} className="text-emerald-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox!</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                We've sent a password reset link to{' '}
                <span className="text-gold font-semibold">{email}</span>. The link expires in 1 hour.
              </p>
            </div>
            <div className="space-y-3 w-full pt-2">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Try another email
              </button>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black"
              >
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── Email Form ── */
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
                <Mail size={17} />
              </div>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoFocus
                className="w-full rounded-2xl border border-white/[0.08] bg-black/30 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-gold/60 focus:ring-4 focus:ring-gold/[0.12]"
              />
            </div>

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
              disabled={loading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black shadow-[0_0_40px_rgba(214,168,58,0.25)] transition hover:shadow-[0_0_60px_rgba(214,168,58,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendHorizonal size={17} />
                  Send Reset Link
                </>
              )}
            </motion.button>

            {/* Back to login */}
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthFrame>
  );
}
