// src/pages/Login.js

import React, { useState } from 'react';
import AuthLogin from '../components/AuthLogin';


function LoginPage() {

  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f5fa' }}>
      
        <AuthLogin/>
    
       
      
    </div>
  );
}

export default LoginPage;
