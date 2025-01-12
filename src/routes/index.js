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
import Courses from '../pages/Admin/Courses';
import AddCourse from '../pages/Admin/AddCourse';
import EditCourse from '../pages/Admin/EditCourse';
import StudentReport from '../pages/Admin/StudentReport';
import TeacherReport from '../pages/Admin/TeacherReport';
import CoursePurchaseList from '../pages/Admin/CoursePurchaseList';
import SalesMentorList from '../pages/Admin/SaleMentorList';
import LeadManager from '../pages/Admin/LeadManager';
import Doubts from '../pages/Admin/Doubts';
import Enquiry from '../pages/Admin/Enquiry';
import Banners from '../pages/Admin/Banners';
import PushNotification from '../pages/Admin/PushNotification';
import Admin from '../pages/Admin';
import EnrolledCourses from '../pages/Teacher/EnrolledCourses';
import CourseDetails from '../pages/Teacher/CourseDetails';
import AddHomeWork from '../pages/Teacher/AddHomeWork';
import AddClass from '../pages/Teacher/AddClass';
import ChatLayout from '../pages/Teacher/ChatLayout';
import GroupChatLayout from '../pages/Teacher/GroupChatLayout';
import DoubtScreen from '../pages/Teacher/DoubtScreen';
import MyLeaves from '../pages/Teacher/MyLeaves';
import AddTest from '../pages/Teacher/AddTest';
import TeachersList from '../pages/HR/teachers';
import TeacherProfile from '../pages/HR/teachersProfile';
import MentorList from '../pages/HR/mentors';
import MentorProfile from '../pages/HR/mentorProfile';
import MentorLeaves from '../pages/HR/MentorLeaves';
import MentorLeaveRequest from '../pages/Mentor/MentorLeaveRequest';
import TeacherLeaves from '../pages/HR/TeacherLeaves';
import LiveClassRoom from '../pages/Teacher/LiveClassRoom';

const router = createBrowserRouter([
  {
    path: '/',
    element: React.createElement(LoginPage), // Use React.createElement for consistency
  },
  {
    path: 'liveclassroom',
    element: React.createElement(
     
      LiveClassRoom
    ),
  },
  {
    path: '/dashboard',
    element: React.createElement(
      ProtectedRoute,
      { allowedRoles: [ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.MENTOR] },
      React.createElement(DashboardLayout)
    ),// Wrap in React.createElement
    children: [
      {
        path: '',
        element: React.createElement(ProtectedRoute,
          { allowedRoles: [ROLES.ADMIN] },
          React.createElement(AdminPage)), // Default dashboard content
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
          
        HrPage
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
      {
        path: 'courses',
        element: React.createElement(
         
          Courses
        ),
      },
      {
        path: 'addCourse',
        element: React.createElement(
         
          AddCourse
        ),
      },
      {
        path: 'edit-course',
        element: React.createElement(
         
          EditCourse
        ),
      },
      {
        path: 'student-report',
        element: React.createElement(
         
          StudentReport
        ),
      },
      {
        path: 'teacher-report',
        element: React.createElement(
         
          TeacherReport
        ),
      },
      {
        path: 'course-purchase-list',
        element: React.createElement(
         
          CoursePurchaseList
        ),
      },
      {
        path: 'sales-mentor-list',
        element: React.createElement(
         
          SalesMentorList
        ),
      },
      {
        path: 'lead-manager',
        element: React.createElement(
         
          LeadManager
        ),
      },
      {
        path: 'doubts',
        element: React.createElement(
         
          Doubts
        ),
      },
      {
        path: 'enquiry',
        element: React.createElement(
         
          Enquiry
        ),
      },
      {
        path: 'banners',
        element: React.createElement(
         
          Banners
        ),
      },
      {
        path: 'pushNotification',
        element: React.createElement(
         
          PushNotification
        ),
      },
      {
        path: 'enrolled-courses',
        element: React.createElement(
         
          EnrolledCourses
        ),
      },
      {
        path: 'course-details',
        element: React.createElement(
         
          CourseDetails
        ),
      },
      {
        path: 'add-homework',
        element: React.createElement(
         
          AddHomeWork
        ),
      },
      {
        path: 'add-test',
        element: React.createElement(
          AddTest
          
        ),
      },
      {
        path: 'add-class',
        element: React.createElement(
         
          AddClass
        ),
      },
      {
        path: 'Chats',
        element: React.createElement(
         
          ChatLayout
        ),
      },
      {
        path: 'group-chat',
        element: React.createElement(
         
          GroupChatLayout
        ),
      },
      {
        path: 'doubtscreen',
        element: React.createElement(
         
          DoubtScreen
        ),
      },
      {
        path: 'myleaves',
        element: React.createElement(
         
          MyLeaves
        ),
      },
      {
        path: 'teachersList',
        element: React.createElement(
         
          TeachersList
        ),
      },
      {
        path: 'teacherInfo',
        element: React.createElement(
         
          TeacherProfile
        ),
      },
      {
        path: 'mentorInfo',
        element: React.createElement(
         
          MentorProfile
        ),
      },
      {
        path: 'mentorList',
        element: React.createElement(
         
          MentorList
        ),
      },
      {
        path: 'mentorLeaves',
        element: React.createElement(
         
          MentorLeaves
        ),
      },
      {
        path: 'teacherLeaves',
        element: React.createElement(
         
          TeacherLeaves
        ),
      },
      {
        path: 'mentorLeaveRequest',
        element: React.createElement(
         
          MentorLeaveRequest
        ),
      },
      
    ],
  },
]);

export default router;
