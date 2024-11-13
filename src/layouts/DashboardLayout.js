// src/layouts/DashboardLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '200px', background: '#f4f4f4', padding: '1rem' }}>
        <h2>Sidebar</h2>
        <nav>
          {/* Add sidebar links here if needed */}
          <p>Dashboard Links</p>
        </nav>
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
