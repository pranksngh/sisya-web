import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box } from '@mui/material';

const rows = [
  { teacherId: '13256498', Name: 'Keyboard', Email: 125, Status: 'Rejected', mobileNo: '70,999' },
  { trackingNo: '13286564', productName: 'Computer Accessories', totalOrder: 100, status: 'Approved', totalAmount: '83,348' },
  { trackingNo: '13256495', productName: 'Keyboard', totalOrder: 125, status: 'Rejected', totalAmount: '70,999' },
  { trackingNo: '13286562', productName: 'Computer Accessories', totalOrder: 100, status: 'Approved', totalAmount: '83,348' },
  { trackingNo: '13256492', productName: 'Keyboard', totalOrder: 125, status: 'Rejected', totalAmount: '70,999' },
  { trackingNo: '13286563', productName: 'Computer Accessories', totalOrder: 100, status: 'Approved', totalAmount: '83,348' },
  { trackingNo: '13286563', productName: 'Computer Accessories', totalOrder: 100, status: 'Approved', totalAmount: '83,348' },
  
  // Add more rows here...
];

function RecentOrders() {
  return (
    <Paper elevation={0} variant="outlined" sx={{ padding: '16px' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Orders</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tracking No.</TableCell>
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
