import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box } from '@mui/material';



function RecentOrders() {

  const [purchases, setPurchases] = useState([]);


  useEffect(()=>{
    recentPurchases();
  },[])

 const recentPurchases = async()=>{

  try{

    const purchaseResponse = await fetch('https://sisyabackend.in/rkadmin/get_purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const purchaseResult = await purchaseResponse.json();
    if(purchaseResult.success){
       setPurchases(purchaseResult.subs)
    }else{
      console.log("fetch recent purchase failed");
    }
  }catch(error){
    console.log("fetch recent purchase failed", error);
  }
 }


  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: '16px', alignSelf:'center', justifyContent:'center',justifyItems:'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Purchases</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ORDER ID</TableCell>
              <TableCell>Course Name</TableCell>
    
              <TableCell>Class</TableCell>
              <TableCell>Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.slice(0,5).map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.OrderId}</TableCell>
                <TableCell>{row.course.name}</TableCell>
            
                <TableCell>
                 
                  {row.course.grade}
                </TableCell>
                <TableCell>{row.PurchasePrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default RecentOrders;
