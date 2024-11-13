import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return React.createElement(Navigate, { to: '/' }); // Redirect to login if unauthorized
  }

  return children;
}

export default ProtectedRoute;
