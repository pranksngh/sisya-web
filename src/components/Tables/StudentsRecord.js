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
import { fetchStudentList } from '../../Functions/students';

function StudentRecords() {
  const [students, setStudents] = useState([]);
  const [visibleStudents, setVisibleStudents] = useState(15);

  useEffect(() => {
    studentList();
  }, []);

  const studentList = async () => {
    try {
      const result = await fetchStudentList();
      if (result.success) {
        setStudents(result.studentList);
      } else {
      //  console.log('Student List Issues', JSON.stringify(result));
      }
    } catch (error) {
    //  console.log('Student List Error', JSON.stringify(error));
    }
  };

  const handleShowMore = () => {
    setVisibleStudents((prev) => prev + 8);
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
        Student Records
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
                Student ID
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                Class
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#37474f' }}>
                Phone
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.slice(0, visibleStudents).map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:nth-of-type(even)': { backgroundColor: '#ffffff' },
                  '&:hover': { backgroundColor: '#e3e9ef' },
                }}
              >
                <TableCell sx={{ color: '#616161' }}>{row.id}</TableCell>
                <TableCell sx={{ color: '#616161' }}>{row.name}</TableCell>
                <TableCell sx={{ color: '#616161' }}>{row.grade}</TableCell>
                <TableCell sx={{ color: '#616161' }}>{row.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {visibleStudents < students.length && (
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

export default StudentRecords;
