import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Page guard. Usage:
 *   <RequireRole roles={['admin']} loginPath="/admin/login"><AdminDashboardPage /></RequireRole>
 * Not logged in  -> goes to loginPath
 * Wrong role     -> goes to home
 * (This only hides pages. The real security is the backend, which checks the token on every request.)
 */
export default function RequireRole({ roles, loginPath = '/login', children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const role = user?.is_admin ? 'admin' : user?.role || 'customer';
  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // A new owner must wait until an admin approves the account.
  if (role === 'owner' && user?.is_approved === false) {
    return <Navigate to="/owner/pending" replace />;
  }

  return children;
}
