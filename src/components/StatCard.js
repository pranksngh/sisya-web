import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function StatCard({ title, value, percentage, chartData, color }) {
  const options = {
    responsive: true,
    scales: {
      y: { display: false },
      x: { display: false },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <Card 
      sx={{
        width: '22%',
        border: '1px solid #E0E0E0', // Add border
        boxShadow: 'none',           // Remove shadow
        borderRadius: '8px',         // Optional: add rounded corners
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
          {value}
        </Typography>
        <Typography
          variant="subtitle2"
          color={percentage > 0 ? 'green' : 'red'}
          sx={{ mt: 1, mb: 1 }}
        >
          {percentage > 0 ? `+${percentage}%` : `${percentage}%`}
        </Typography>
      
      </CardContent>
    </Card>
  );
}

export default StatCard;
