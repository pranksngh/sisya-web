// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { login as authenticate } from '../utils/authService';
import AuthLogin from '../components/AuthLogin';
import AuthCard from '../components/AuthCard';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await authenticate(username, password);
      login(user.username, user.role); // Call login with username and role

      // Redirect based on user role
      switch (user.role) {
        case 'teacher':
          navigate('/dashboard/teacher');
          break;
        case 'hr':
          navigate('/dashboard/hr');
          break;
        case 'mentor':
          navigate('/dashboard/mentor');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials, please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f5fa' }}>
      
        <AuthLogin/>
    
       
      
    </div>
  );
}

export default LoginPage;
