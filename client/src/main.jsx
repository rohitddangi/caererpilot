import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';
import Loader from './components/Loader.jsx';
import './styles.css';

// Public pages
const Landing      = lazy(() => import('./pages/Landing.jsx'));
const Login        = lazy(() => import('./pages/Login.jsx'));
const Signup       = lazy(() => import('./pages/Signup.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const VerifyEmail  = lazy(() => import('./pages/VerifyEmail.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'));

// Protected pages
const Dashboard    = lazy(() => import('./pages/Dashboard.jsx'));
const CommandCenter = lazy(() => import('./pages/CommandCenter.jsx'));
const Roadmap      = lazy(() => import('./pages/Roadmap.jsx'));
const SkillGap     = lazy(() => import('./pages/SkillGap.jsx'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep.jsx'));
const Chatbot      = lazy(() => import('./pages/Chatbot.jsx'));
const Jobs         = lazy(() => import('./pages/Jobs.jsx'));
const LearningHub  = lazy(() => import('./pages/LearningHub.jsx'));
const Certificates = lazy(() => import('./pages/Certificates.jsx'));
const Progress     = lazy(() => import('./pages/Progress.jsx'));
const Goals        = lazy(() => import('./pages/Goals.jsx'));
const Profile      = lazy(() => import('./pages/Profile.jsx'));
const Admin        = lazy(() => import('./pages/Admin.jsx'));

// Public route — redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root → Landing Page */}
        <Route path="/" element={<Page><Landing /></Page>} />

        {/* Public auth routes */}
        <Route path="/login"           element={<PublicRoute><Page><Login /></Page></PublicRoute>} />
        <Route path="/signup"          element={<PublicRoute><Page><Signup /></Page></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><Page><ForgotPassword /></Page></PublicRoute>} />
        <Route path="/verify-email"    element={<Page><VerifyEmail /></Page>} />
        <Route path="/reset-password"  element={<Page><ResetPassword /></Page>} />
        {/* Google OAuth callback — handles the token and user from URL params */}
        <Route path="/auth/callback"   element={<Page><AuthCallback /></Page>} />

        {/* Protected routes — all require authentication */}
        <Route path="/dashboard"      element={<ProtectedRoute><AppShell><Page><Dashboard /></Page></AppShell></ProtectedRoute>} />
        <Route path="/command-center" element={<ProtectedRoute><AppShell><Page><CommandCenter /></Page></AppShell></ProtectedRoute>} />
        <Route path="/roadmap"        element={<ProtectedRoute><AppShell><Page><Roadmap /></Page></AppShell></ProtectedRoute>} />
        <Route path="/skill-gap"      element={<ProtectedRoute><AppShell><Page><SkillGap /></Page></AppShell></ProtectedRoute>} />
        <Route path="/interview"      element={<ProtectedRoute><AppShell><Page><InterviewPrep /></Page></AppShell></ProtectedRoute>} />
        <Route path="/chatbot"        element={<ProtectedRoute><AppShell><Page><Chatbot /></Page></AppShell></ProtectedRoute>} />
        <Route path="/jobs"           element={<ProtectedRoute><AppShell><Page><Jobs /></Page></AppShell></ProtectedRoute>} />
        <Route path="/learning"       element={<ProtectedRoute><AppShell><Page><LearningHub /></Page></AppShell></ProtectedRoute>} />
        <Route path="/certificates"   element={<ProtectedRoute><AppShell><Page><Certificates /></Page></AppShell></ProtectedRoute>} />
        <Route path="/progress"       element={<ProtectedRoute><AppShell><Page><Progress /></Page></AppShell></ProtectedRoute>} />
        <Route path="/goals"          element={<ProtectedRoute><AppShell><Page><Goals /></Page></AppShell></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><AppShell><Page><Profile /></Page></AppShell></ProtectedRoute>} />
        <Route path="/admin"          element={<ProtectedRoute adminOnly><AppShell><Page><Admin /></Page></AppShell></ProtectedRoute>} />

        {/* Catch all — redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      IMPORTANT: BrowserRouter must be the OUTERMOST wrapper so that
      AuthProvider (and any hooks it uses internally) has Router context.
      Previously AuthProvider was outside BrowserRouter — a latent crash risk.
    */}
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<Loader />}>
            <AnimatedRoutes />
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(214,168,58,.35)',
                borderRadius: '14px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#d6a83a', secondary: '#000' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
