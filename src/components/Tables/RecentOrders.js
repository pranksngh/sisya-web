import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  Button,
} from '@mui/material';
import { fetchPurchases } from '../../Functions/purchases';

function RecentOrders() {
  const [purchases, setPurchases] = useState([]);
  const [visibleTransactions, setVisibleTransactions] = useState(15);

  useEffect(() => {
    purchaseList();
  }, []);

  const purchaseList = async () => {
    try {
      const result = await fetchPurchases();
      if (result.success) {
        setPurchases(result.subs);
      } else {
     //   console.log('Purchase Issue', JSON.stringify(result));
      }
    } catch (error) {
     // console.log('Purchase Error', JSON.stringify(error));
    }
  };

  const handleShowMore = () => {
    setVisibleTransactions((prev) => prev + 8);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: '1000px',
        margin: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Recent Purchases
      </Typography>
      <TableContainer
        sx={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          overflowY: 'auto',
          height: '510px',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#f0f4f8' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                ORDER ID
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                Course Name
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                Class
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.slice(0, visibleTransactions).map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }, // Subtle gray for odd rows
                  '&:nth-of-type(even)': { backgroundColor: '#ffffff' }, // White for even rows
                  '&:hover': { backgroundColor: '#e3e9ef' }, // Light blue-gray for hover
                }}
              >
                <TableCell sx={{ color: '#616161' }}>{row.OrderId}</TableCell>
                <TableCell sx={{ color: '#616161' }}>{row.course.name}</TableCell>
                <TableCell sx={{ color: '#616161' }}>{row.course.grade}</TableCell>
                <TableCell sx={{ color: '#1e88e5', fontWeight: 'bold' }}>
                ₹{row.PurchasePrice.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {visibleTransactions < purchases.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShowMore}
            sx={{ textTransform: 'none' }}
          >
            Show More
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default RecentOrders;
