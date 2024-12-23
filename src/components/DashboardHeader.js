import React from 'react';
import { Box, Typography, Button } from '@mui/material';

function DashboardHeader() {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#1a73e8',
        color: '#fff',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '8px',
        boxSizing: 'border-box',
        marginBottom: '20px',
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Welcome to Mantis
        </Typography>
        <Typography variant="subtitle1">
          The purpose of a product update is to add new features, fix bugs or improve the performance of the product.
        </Typography>
      </Box>
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#fff',
          color: '#1a73e8',
          textTransform: 'none',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#f1f1f1',
          },
        }}
      >
        View Full Statistic
      </Button>
    </Box>
  );
}

export default DashboardHeader;
