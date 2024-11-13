import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import LoginPage from '../pages/login';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/Dashboard';
import TeacherPage from '../pages/Teacher';
import HrPage from '../pages/Hr';
import MentorPage from '../pages/Mentor';
import AdminPage from '../pages/Admin';
import ProtectedRoute from '../components/ProtectedRoutes';
import ROLES from '../utils/roles';

const router = createBrowserRouter([
  {
    path: '/',
    element: React.createElement(LoginPage), // Use React.createElement for consistency
  },
  {
    path: '/dashboard',
    element: React.createElement(DashboardLayout), // Wrap in React.createElement
    children: [
      {
        path: '',
        element: React.createElement(DashboardPage), // Default dashboard content
      },
      {
        path: 'teacher',
        element: React.createElement(
          ProtectedRoute,
          { allowedRoles: [ROLES.TEACHER] },
          React.createElement(TeacherPage)
        ),
      },
      {
        path: 'hr',
        element: React.createElement(
          ProtectedRoute,
          { allowedRoles: [ROLES.HR] },
          React.createElement(HrPage)
        ),
      },
      {
        path: 'mentor',
        element: React.createElement(
          ProtectedRoute,
          { allowedRoles: [ROLES.MENTOR] },
          React.createElement(MentorPage)
        ),
      },
      {
        path: 'admin',
        element: React.createElement(
          ProtectedRoute,
          { allowedRoles: [ROLES.ADMIN] },
          React.createElement(AdminPage)
        ),
      },
    ],
  },
]);

export default router;
