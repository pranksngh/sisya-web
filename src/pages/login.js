import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROLES from '../utils/roles';
import { useAuth } from '../providers/AuthProvider';
import { login } from '../utils/authService';
function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { setRole } = useAuth(); // Use the Auth context to store the role globally

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Replace this with your actual login logic
      const user = await login(username, password);

      // Assume `user.role` is returned from your login response
      const userRole = user.role;

      // Set the role in the Auth context or local state
      setRole(userRole);

      // Redirect based on role
      switch (userRole) {
        case ROLES.TEACHER:
          navigate('/teacher-dashboard');
          break;
        case ROLES.HR:
          navigate('/hr-dashboard');
          break;
        case ROLES.MENTOR:
          navigate('/mentor-dashboard');
          break;
        case ROLES.ADMIN:
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/'); // Fallback or unauthorized route
          break;
      }
    } catch (err) {
      setError('Invalid credentials, please try again.');
    }
  };

  return React.createElement('div', { className: 'login-container' },
    React.createElement('h1', null, 'Login'),
    React.createElement('form', { onSubmit: handleLogin },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Username',
        value: username,
        onChange: (e) => setUsername(e.target.value),
      }),
      React.createElement('input', {
        type: 'password',
        placeholder: 'Password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
      }),
      error && React.createElement('p', null, error),
      React.createElement('button', { type: 'submit' }, 'Login')
    )
  );
}

export default LoginPage;
