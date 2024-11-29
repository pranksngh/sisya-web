// src/pages/Teacher.js

import React, { useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { Box, Container, Grid } from '@mui/material';
import SummaryCardWithChart from '../components/SummaryCard';
import StatCard from '../components/StatCard';
import RecentOrders from '../components/Tables/RecentOrders';
import AnalyticsReport from '../components/Reports/AnalayticsReport';


useEffect(()=>{
  

},[]);

function Teacher() {
  const totalUsersChartData = {
    labels: Array.from({ length: 10 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Users',
        data: [30, 60, 45, 80, 60, 75, 50, 90, 70, 60],
        backgroundColor: '#1976d2',
      },
    ],
  };
  
  const totalOrdersChartData = {
    labels: Array.from({ length: 10 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Orders',
        data: [80, 40, 60, 20, 70, 50, 30, 90, 60, 40],
        backgroundColor: '#ff7043',
      },
    ],
  };
  
  const totalSalesChartData = {
    labels: Array.from({ length: 10 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Sales',
        data: [40, 60, 70, 50, 80, 45, 65, 85, 55, 75],
        backgroundColor: '#ffb74d',
      },
    ],
  };
  
 
    return (
      <Box sx={{ padding: '34px', width: '100%' }}>
      
        {/* Other components like the StatCard components can be placed below */}
        <Box sx={{ display: 'flex', gap: '16px', marginTop: '20px',justifyContent: 'center', }}>
          {/* Stat cards */}
          <StatCard title="Total Users" value="78" percentage={70.5} chartData={totalUsersChartData} color="blue" />
          <StatCard title="Total Teachers" value="10" percentage={-27.4} chartData={totalOrdersChartData} color="red" />
          <StatCard title="Total Mentors" value="56" percentage={27.4} chartData={totalSalesChartData} color="orange" />
          <StatCard title="Total Sales" value="$35,078" percentage={27.4} chartData={totalSalesChartData} color="orange" />
        </Box>
        <Box sx={{ display: 'flex', gap: '24px', marginTop: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Grid container spacing={3} sx={{ marginTop: '20px', justifyContent:'center' }}>
        {/* Recent Orders Table - 60% Width */}
        <Grid item xs={12} md={7.2} lg={7}>
          <RecentOrders />
        </Grid>

        {/* Analytics Report - 30% Width */}
        <Grid item xs={12} md={4.8} lg={4}>
          <AnalyticsReport />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ marginTop: '20px', justifyContent:'center' }}>
        {/* Recent Orders Table - 60% Width */}
        <Grid item xs={12} md={7.2} lg={11}>
          <RecentOrders />
        </Grid>

        {/* Analytics Report - 30% Width */}
      
      </Grid>
      </Box>
      </Box>
    );
}

export default Teacher;
