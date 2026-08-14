import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import VerifyEmailNotice from './VerifyEmailNotice.jsx';

/**
 * Requires a signed-in user. Pass `requireVerified` for screens that publish
 * something other people will act on — those also need a confirmed email.
 */
function ProtectedRoute({ user, requireVerified = false, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rendered in place rather than redirected to, so the address bar still shows
  // where they were heading and the back button behaves.
  if (requireVerified && !user.emailVerified) {
    return <VerifyEmailNotice />;
  }

  return children;
}

export default ProtectedRoute;
