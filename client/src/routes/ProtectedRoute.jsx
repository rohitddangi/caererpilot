import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * - Shows a loader while auth state resolves.
 * - Redirects to /login if unauthenticated, preserving intended destination.
 * - Redirects local (non-Google) unverified users to /verify-email.
 * - Optionally enforces admin-only access.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth state still resolving
  if (loading) return <Loader />;

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Email verification guard — local users must verify before accessing protected areas
  if (!user.isVerified && user.provider === 'local') {
    return <Navigate to="/verify-email" replace />;
  }

  // Admin-only route check
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
