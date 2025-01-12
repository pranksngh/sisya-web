// src/pages/Login.js

import React, { useEffect, useState } from 'react';
import AuthLogin from '../components/AuthLogin';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role'); // Check if user is logged in
  const roleToDashboardMap = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    mentor: '/dashboard/mentor',
    hr: '/dashboard/hr',
  };
  useEffect(() => {
    if (userRole) {
      // Redirect logged-in users to their dashboard
      const redirectPath = roleToDashboardMap[userRole] || '/';
      navigate(redirectPath);
    }
  }, [userRole, navigate]);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f5fa' }}>
      
        <AuthLogin/>
    
       
      
    </div>
  );
}

export default LoginPage;
