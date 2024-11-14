// src/components/AuthCard.js

import React from 'react';
import { Card, CardContent } from '@mui/material';

function AuthCard({ children }) {
  return (
    <Card
      sx={{
        maxWidth: 450,
        margin: 'auto',
        borderRadius: 3,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        padding: 3,
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default AuthCard;
