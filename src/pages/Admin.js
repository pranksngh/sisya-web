// src/pages/Admin.js
import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import StatCard from '../components/StatCard';
import RecentOrders from '../components/Tables/RecentOrders';
import AnalyticsReport from '../components/Reports/AnalayticsReport';
import { fetchStudentList } from '../Functions/students';
import { fetchTeacherList } from '../Functions/teachers';
import { fetchSalesmenData } from '../Functions/mentor';
import { fetchPurchases } from '../Functions/purchases';
import StudentRecords from '../components/Tables/StudentsRecord';
import DoubtsRecord from '../components/Tables/DoubtsRecord';
import DoubtAnalysis from '../components/Tables/DoubtAnalysis';
import MentorRecord from '../components/Tables/MentorRecord';

function Admin() {
 
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [totalTeacherCount, setTotalTeacherCount] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [totalSalesManCount, setTotalSalesManCount] = useState(0);
  const [salesman, setSalesman] = useState([]);
  const [totalPurchasePrice, setTotalPurchasePrice]= useState();
  const [purchase,setPurchases] = useState([]);
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

  const totalStudents = async()=>{

    try{
    const result = await fetchStudentList();
    
    if(result.success){
      const students = result.studentList;
      setTotalStudentCount(students.length);
      setStudents(students);
      console.log("fetched Student List Successfully");

    }else{
      console.log("Student List Error : ", JSON.stringify(result));

    }
  }catch(error){
    console.log("Student Fetch Failed", JSON.stringify(error));
  }
  }


  const totalTeachers = async()=>{

    try{
    const result = await fetchTeacherList();
    
    if(result.success){
      const teachers = result.mentors;
       setTotalTeacherCount(teachers.length);
       setTeachers(teachers);
      console.log("Fetched Teacher List Successfully");

    }else{
      console.log("Teacher List Error : ", JSON.stringify(result));

    }
  }catch(error){
    console.log("Teacher Fetch Failed", JSON.stringify(error));
  }
  }

  const totalSalesMan = async()=>{

    try{
    const result = await fetchSalesmenData();
    
    if(result.success){
      const salesman = result.salesmen;
      setTotalSalesManCount(salesman.length);
      setSalesman(salesman);
      console.log("Fetched Salesman List Successfully");

    }else{
      console.log("Salesman List Error : ", JSON.stringify(result));

    }
  }catch(error){
    console.log("Salesman Fetch Failed", JSON.stringify(error));
  }
  }

  const purchases = async()=>{
    try{
      const result = await fetchPurchases();
       if(result.success){
        const purchases = result.subs;
        console.log("total purchases are", JSON.stringify(result));
        const totalEarning = purchases.reduce((sum,item)=> sum + item.PurchasePrice, 0);
         setTotalPurchasePrice(totalEarning.toFixed(2));
         setPurchases(purchases);
       }else{
        console.log("purchase failed", JSON.stringify(result));
       }
    }catch(error){
      console.log("Purchase Error", JSON.stringify(error));
    }
  }



  useEffect(()=>{
    totalStudents();
    totalTeachers();
    totalSalesMan();
    purchases();
  },[]);
  
  
 
    return (
      <Box sx={{pb:10}}>
      
        {/* Other components like the StatCard components can be placed below */}
        <Box sx={{ display: 'flex', gap: '16px', marginTop: '20px',justifyContent: 'center', }}>
          {/* Stat cards */}
          <StatCard title="Total Users" value={totalStudentCount} percentage={70.5} chartData={totalUsersChartData} color="blue" />
          <StatCard title="Total Teachers" value={totalTeacherCount} percentage={-27.4} chartData={totalOrdersChartData} color="red" />
          <StatCard title="Total Mentors" value={totalSalesManCount} percentage={27.4} chartData={totalSalesChartData} color="orange" />
          <StatCard title="Total Sales" value={`₹${totalPurchasePrice}`} percentage={27.4} chartData={totalSalesChartData} color="orange" />
        </Box>
        <Box sx={{ display: 'flex', gap: '24px', marginTop: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Grid container spacing={3} sx={{ marginTop: '20px', justifyContent:'center' }}>
        {/* Recent Orders Table - 60% Width */}
        <Grid item xs={12} md={6} lg={6}>
          <RecentOrders />
        </Grid>

        {/* Analytics Report - 30% Width */}
        <Grid item xs={12} md={4} lg={5}>
          <StudentRecords />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ marginTop: '20px', justifyContent:'center' }}>
        {/* Recent Orders Table - 60% Width */}
        <Grid item xs={12} md={6} lg={7}>
         <DoubtsRecord/>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
         <DoubtAnalysis/>
        </Grid>


        {/* Analytics Report - 30% Width */}
      
      </Grid>
      <Grid container spacing={3} sx={{ marginTop: '20px', justifyContent:'center' }}>
        {/* Recent Orders Table - 60% Width */}
       
        <Grid item xs={12} md={12} lg={10}>
         <MentorRecord/>
        </Grid>
        

        {/* Analytics Report - 30% Width */}
      
      </Grid>
      </Box>
      </Box>
    );
}

export default Admin;
