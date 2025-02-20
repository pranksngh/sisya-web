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
import { fetchSalesmenData } from '../../Functions/mentor';

function MentorRecord() {
  const [mentor, setMentors] = useState([]);
  const [visibleMentor, setVisibleMentor] = useState(15);

  useEffect(() => {
    mentorList();
  }, []);

  const mentorList = async () => {
    try {
      const result = await fetchSalesmenData();
      if (result.success) {
        setMentors(result.salesmen);
      } else {
      //  console.log('Mentor List Issue', JSON.stringify(result));
      }
    } catch (error) {
    //  console.log('Mentor List Error', JSON.stringify(error));
    }
  };

  const handleShowMore = () => {
    setVisibleMentor((prev) => prev + 8);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        margin: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Mentor Records
      </Typography>
      <TableContainer
        sx={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mentor.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Mentors Found
                </TableCell>
              </TableRow>
            ) : (
              mentor
                .slice(0, visibleMentor)
                .map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {visibleMentor < mentor.length && (
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

export default MentorRecord;
