// src/App.js

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import ThemeCustomization from './themes/ThemeCustomization';
import ScrollTop from './components/ScrollTop';
import AuthProvider from './providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <ThemeCustomization>
        <RouterProvider router={router}>
          <ScrollTop />
        </RouterProvider>
      </ThemeCustomization>
    </AuthProvider>
  );
}

export default App;
