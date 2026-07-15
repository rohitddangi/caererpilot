import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { AuthFrame } from './Login.jsx';

export default function AuthCallback() {
  const { setAuthenticatedSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token || !userParam) {
      console.error('[AuthCallback] Missing token or user parameter in redirect URL');
      toast.error('Google authentication failed. Missing user credentials.');
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    try {
      const decodedUser = JSON.parse(decodeURIComponent(userParam));
      console.log('[AuthCallback] Successfully parsed Google User:', decodedUser);

      // Save user & token in localStorage and React state via context helper
      const enriched = setAuthenticatedSession(decodedUser, token);
      
      toast.success(`Welcome back, ${enriched.name}! ✨`, {
        icon: '🚀',
        duration: 4000,
      });

      // Redirect directly to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[AuthCallback] Failed to parse user parameter or establish session:', err);
      toast.error('Google authentication failed. Invalid user data format.');
      navigate('/login?error=google_failed', { replace: true });
    }
  }, [searchParams, setAuthenticatedSession, navigate]);

  return (
    <AuthFrame
      title="Authenticating"
      subtitle="Finalizing your secure sign-in with Google..."
    >
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="relative">
          {/* Outer pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gold/10 blur-xl"
          />
          {/* Spinner */}
          <Loader2 className="w-16 h-16 text-gold animate-spin relative z-10" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-400 font-medium">Securing your session</p>
          <div className="flex items-center gap-1.5 justify-center text-xs text-zinc-500">
            <ShieldCheck size={14} className="text-gold" />
            <span>Encrypted token verified</span>
          </div>
        </div>
      </div>
    </AuthFrame>
  );
}
