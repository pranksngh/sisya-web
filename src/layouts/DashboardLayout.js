// src/layouts/DashboardLayout.js

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to the login page or homepage after logout
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '200px', background: '#f4f4f4', padding: '1rem' }}>
        <h2>Sidebar</h2>
        <nav>
          {/* Add sidebar links here if needed */}
          <p>Dashboard Links</p>
        </nav>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '20px',
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: '#d9534f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Logout
        </button>
      </aside>
      
      <div style={{ flex: 1, padding: '1rem' }}>
        <header style={{ marginBottom: '1rem' }}>
          <h2>Dashboard Header</h2>
          {/* Add any global header elements here */}
        </header>

        <main>
          <Outlet /> {/* Renders the nested route content */}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
