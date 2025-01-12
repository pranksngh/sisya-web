import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const userRole = localStorage.getItem('role'); // Retrieve user role from localStorage
  const roleToDashboardMap = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    mentor: '/dashboard/mentor',
    hr: '/dashboard/hr',
  };

  // If userRole is not defined, redirect to login
  if (!userRole) {
    return <Navigate to="/" />;
  }

  // If userRole is valid but not in allowedRoles, redirect to their specific dashboard
  if (userRole && !allowedRoles.includes(userRole)) {
    const redirectPath = roleToDashboardMap[userRole] || '/'; // Default to login if role is unknown
    return <Navigate to={redirectPath} />;
  }

  // If userRole is allowed, render children
  return children;
}

export default ProtectedRoute;
