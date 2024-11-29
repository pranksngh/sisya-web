import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box } from '@mui/material';



function RecentOrders(data) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ padding: '16px' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Transactions</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ORDER ID</TableCell>
              <TableCell>Course Name</TableCell>
    
              <TableCell>Status</TableCell>
              <TableCell>Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.trackingNo}</TableCell>
                <TableCell>{row.productName}</TableCell>
            
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: row.status === 'Approved' ? 'green' : row.status === 'Pending' ? 'orange' : 'red',
                      mr: 1,
                    }}
                  />
                  {row.status}
                </TableCell>
                <TableCell>{row.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default RecentOrders;
