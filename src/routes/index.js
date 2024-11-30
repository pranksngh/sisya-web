import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import LoginPage from '../pages/login';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/Dashboard';
import HrPage from '../pages/Hr';
import MentorPage from '../pages/Mentor';
import AdminPage from '../pages/Admin';
import ProtectedRoute from '../components/ProtectedRoutes';
import ROLES from '../utils/roles';
import Boards from '../pages/Admin/Boards';
import Teacher from '../pages/Teacher';
import Subjects from '../pages/Admin/Subjects';
import Students from '../pages/Admin/Students';
import AddStudent from '../pages/Admin/AddStudent';
import Teachers from '../pages/Admin/Teachers';
import AddTeacher from '../pages/Admin/AddTeacher';
import EditTeacher from '../pages/Admin/editTeacher';

const router = createBrowserRouter([
  {
    path: '/',
    element: React.createElement(LoginPage), // Use React.createElement for consistency
  },
  {
    path: '/dashboard',
    element: React.createElement(
      DashboardLayout
    ),// Wrap in React.createElement
    children: [
      {
        path: '',
        element: React.createElement(DashboardPage), // Default dashboard content
      },
      {
        path: 'teacher',
        element: React.createElement(
          
          Teacher
        ),
      },
      {
        path: 'hr',
        element: React.createElement(
          
          React.createElement(HrPage)
        ),
      },
      {
        path: 'mentor',
        element: React.createElement(
         
        MentorPage
        ),
      },
      {
        path: 'admin',
        element: React.createElement(
         
         AdminPage
        ),
      },
      {
        path: 'boards',
        element: React.createElement(
         
          Boards
        ),
      },
      {
        path: 'subjects',
        element: React.createElement(
         
          Subjects
        ),
      },
      {
        path: 'students',
        element: React.createElement(
         
          Students
        ),
      },
      {
        path: 'addStudent',
        element: React.createElement(
         
          AddStudent
        ),
      },
      {
        path: 'teachers',
        element: React.createElement(
         
          Teachers
        ),
      },
      {
        path: 'addTeacher',
        element: React.createElement(
         
          AddTeacher
        ),
      },
      {
        path: 'edit-teacher',
        element: React.createElement(
         
          EditTeacher
        ),
      },
    ],
  },
]);

export default router;
