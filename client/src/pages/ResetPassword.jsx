import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Circle, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api.jsx';
import toast from 'react-hot-toast';
import { AuthFrame } from './Login.jsx';

/* ── Password strength ─────────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter',  pass: /[A-Z]/.test(password) },
    { label: 'One number',            pass: /\d/.test(password) },
    { label: 'One special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const colors   = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500', 'bg-emerald-400'];
  const labels   = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2.5 pt-1"
    >
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full bg-white/[0.07] overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${strength >= i ? colors[strength] : ''}`}
              initial={{ width: 0 }}
              animate={{ width: strength >= i ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
        <span className="text-[11px] text-zinc-400 ml-1 min-w-[42px]">{labels[strength]}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass ? (
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            ) : (
              <Circle size={12} className="text-zinc-600 shrink-0" />
            )}
            <span className={`text-[11px] ${c.pass ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────── */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState('');

  // If no token in URL, show an error immediately
  const hasToken = Boolean(token);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Password updated successfully! 🎉');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      title="Set new password"
      subtitle="Choose a strong password to secure your account."
    >
      <AnimatePresence mode="wait">
        {/* ── No Token ── */}
        {!hasToken && (
          <motion.div
            key="no-token"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-5 py-4"
          >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-red-500/15 border border-red-500/30">
              <AlertCircle size={38} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid reset link</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                This password reset link is missing or invalid. Please request a new one.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black"
            >
              Request New Reset Link
            </Link>
          </motion.div>
        )}

        {/* ── Success ── */}
        {hasToken && success && (
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
              <ShieldCheck size={38} className="text-emerald-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Password updated!</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Your password has been successfully reset. You can now log in with your new credentials.
              </p>
            </div>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-champagne px-5 py-3.5 text-sm font-bold text-black"
            >
              Sign In →
            </Link>
          </motion.div>
        )}

        {/* ── Form ── */}
        {hasToken && !success && (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Password */}
            <div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
                  <Lock size={17} />
                </div>
                <input
                  id="reset-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  required
                  autoFocus
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
                {password && <PasswordStrength password={password} />}
              </AnimatePresence>
            </div>

            {/* Confirm */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors">
                <Lock size={17} />
              </div>
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className={`w-full rounded-2xl border bg-black/30 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:ring-4 focus:ring-gold/[0.12] ${
                  confirm && password !== confirm
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
              {confirm && password !== confirm && (
                <p className="mt-1.5 text-[11px] text-red-400 pl-1">Passwords don't match</p>
              )}
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
                  Updating password...
                </>
              ) : (
                'Set New Password →'
              )}
            </motion.button>

            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              Back to Sign In
            </Link>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthFrame>
  );
}
