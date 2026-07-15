import React, { createContext, useContext, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api.jsx';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const SERVER_URL = API_BASE.replace('/api', '');

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=d6a83a&color=000&bold=true&size=128`;
}

function enrichUser(userData) {
  return {
    ...userData,
    avatar: userData.avatar || avatarUrl(userData.name),
    // Backward-compat aliases used by other components
    emailVerified: userData.isVerified,
    authProvider:  userData.provider || 'local',
  };
}

function persistSession(user, token) {
  const enriched = enrichUser(user);
  if (token) localStorage.setItem('cp_token', token);
  localStorage.setItem('cp_user', JSON.stringify(enriched));
  return enriched;
}

function clearSession() {
  localStorage.removeItem('cp_token');
  localStorage.removeItem('cp_user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cp_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // ── On mount: verify existing token against /auth/me ──────────
  useEffect(() => {
    const token = localStorage.getItem('cp_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        const enriched = persistSession(data.user, null);
        setUser(enriched);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Listen for forced logout from the API interceptor ────────
  useEffect(() => {
    function handleForcedLogout() {
      clearSession();
      setUser(null);
      toast.error('Your session expired. Please sign in again.');
    }
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // ── Expose helper to manually establish auth session ──────────
  const setAuthenticatedSession = useCallback((userData, token) => {
    try {
      const enriched = persistSession(userData, token);
      setUser(enriched);
      return enriched;
    } catch (err) {
      console.error('[AuthContext] Failed to set authenticated session:', err);
      throw err;
    }
  }, []);

  /* ── signup ─────────────────────────────────────────────────── */
  const signup = useCallback(async ({ name, email, password }) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      // Don't log in yet — user must verify email first
      toast.success(data.message || 'Account created! Please verify your email. 📧');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(msg);
      throw error;
    }
  }, []);

  /* ── login ──────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const enriched = persistSession(data.user, data.token);
      setUser(enriched);
      toast.success(`Welcome back, ${enriched.name}! ✨`);
      return enriched;
    } catch (error) {
      const status = error.response?.status;
      const msg    = error.response?.data?.message;

      if (status === 403 && error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before logging in. Check your inbox!');
      } else {
        toast.error(msg || 'Invalid email or password.');
      }
      throw error;
    }
  }, []);

  /* ── googleLogin ────────────────────────────────────── */
  const googleLogin = useCallback(async () => {
    try {
      // Quick pre-flight check — if Google is not configured the server returns 503
      const resp = await fetch(`${SERVER_URL}/api/auth/google`, { method: 'GET', redirect: 'manual' });
      // 0 = opaque (redirect happened — good, means OAuth is live)
      // 503 = not configured
      if (resp.status === 503) {
        const body = await resp.json().catch(() => ({}));
        toast.error(
          body.message ||
          'Google Sign-In is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the server .env file.',
          { duration: 6000 }
        );
        return;
      }
    } catch {
      // Network error — just let the redirect happen and fail naturally
    }
    // Redirect to backend Passport OAuth flow
    window.location.href = `${SERVER_URL}/api/auth/google`;
  }, []);

  /* ── firebaseLogin ──────────────────────────────────────────── */
  const firebaseLogin = useCallback(async (firebaseToken, userPayload) => {
    try {
      const { data } = await api.post('/auth/firebase-sync', { token: firebaseToken, user: userPayload });
      const enriched = persistSession(data.user, data.token);
      setUser(enriched);
      toast.success(`Welcome back, ${enriched.name}! ✨`);
      return enriched;
    } catch (error) {
      const msg = error.response?.data?.message || 'Firebase login verification failed. Please try again.';
      toast.error(msg);
      throw error;
    }
  }, []);

  /* ── logout ─────────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* non-fatal */ }

    clearSession();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  /* ── resetPassword (forgot-password flow) ───────────────────── */
  const resetPassword = useCallback(async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'If that email is registered, a reset link has been sent.');
    } catch {
      // Security: always succeed to prevent enumeration
      toast.success('If that email is registered, a reset link has been sent.');
    }
  }, []);

  /* ── resendVerification ─────────────────────────────────────── */
  const resendVerification = useCallback(async (emailOverride) => {
    const email = emailOverride || user?.email;
    if (!email) {
      toast.error('Email address is required.');
      return;
    }
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      toast.success(data.message || 'Verification email sent! 📧');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend email. Try again later.');
    }
  }, [user?.email]);

  /* ── reloadUserStatus — re-fetches /me to check isVerified ─── */
  const reloadUserStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      const enriched = persistSession(data.user, null);
      setUser(enriched);

      if (enriched.isVerified) {
        toast.success('Email verified successfully! 🚀');
      } else {
        toast.error('Email is not verified yet. Please check your inbox.');
      }
      return enriched;
    } catch (error) {
      toast.error('Failed to check verification status.');
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      googleLogin,
      firebaseLogin,
      logout,
      resetPassword,
      resendVerification,
      reloadUserStatus,
      setUser,
      setAuthenticatedSession,
    }),
    // All functions are now stable useCallback refs — safe to include
    [user, loading, login, signup, googleLogin, firebaseLogin, logout, resetPassword, resendVerification, reloadUserStatus, setAuthenticatedSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
