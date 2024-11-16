// src/layouts/DashboardLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';

import { Box, Toolbar } from '@mui/material';
import Sidebar from '../components/Siderbar';

export default function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar /> {/* Replace with your sidebar component */}
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Toolbar />
        <Outlet /> {/* This renders child routes like Dashboard */}
      </Box>
    </Box>
  );
}
