// src/components/SummaryCardWithChart.js

import React from 'react';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SummaryCardWithChart = ({ title, value, percentage, color, chartData }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { display: false },
      x: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <Card sx={{ borderRadius: 2,  height: '180px', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Box
            component="span"
            sx={{
              color: percentage > 0 ? 'success.main' : 'error.main',
              fontSize: '0.875rem',
              fontWeight: 'medium',
            }}
          >
            {percentage}%
          </Box>
        </Stack>
      </CardContent>
      <Box sx={{ height: '50px', padding: '0 8px 8px 8px' }}>
        <Bar key={JSON.stringify(chartData)} data={chartData} options={chartOptions} />
      </Box>
    </Card>
  );
};

export default SummaryCardWithChart;
