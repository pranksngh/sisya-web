import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const lineData = {
  labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Overall Analysis',
      data: [20, 45, 30, 60, 40, 55, 35],
      borderColor: '#FFA726',
      fill: false,
    },
  ],
};

function AnalyticsReport() {
  return (
    <Paper elevation={0} variant="outlined" sx={{ padding: '16px' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Doubt Report</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">Total Doubt's Raised </Typography>
        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>+45.14%</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">Total Doubt Resolved</Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>0.58%</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">Doubt's Raised Today</Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Low</Typography>
      </Box>
      <Box sx={{ height: '200px' }}> {/* Set a fixed height for the chart */}
        <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
      </Box>
    </Paper>
  );
}

export default AnalyticsReport;
