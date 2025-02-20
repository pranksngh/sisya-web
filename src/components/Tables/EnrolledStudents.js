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
  CircularProgress,
  Avatar,
} from '@mui/material';
import { getUser } from '../../Functions/Login';

function EnrolledStudents() {
  const user = getUser();
  const [visibleStudent, setVisibleStudent] = useState(15);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/teacher/get_my_big_course_students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorId: user.mentor.id }),
      });
      const result = await response.json();
    //  console.log('Enrolled Students API Response:', result);

      if (result.success && result.endUsers) {
        // Remove duplicates based on student id
        const uniqueStudents = result.endUsers.filter(
          (student, index, self) => index === self.findIndex((s) => s.id === student.id)
        );
        setEnrolledStudents(uniqueStudents);
      } else {
        setEnrolledStudents([]);
      }
    } catch (error) {
     // console.log('Error fetching enrolled students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleShowMore = () => {
    setVisibleStudent((prev) => prev + 8);
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Enrolled Students
      </Typography>
      <Paper elevation={0}>
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
          <Table aria-label="enrolled-students-table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingStudents ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : enrolledStudents.length > 0 ? (
                enrolledStudents.slice(0, visibleStudent).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>
                      <Avatar
                        src={student.image || '/placeholder.jpg'}
                        alt={student.name}
                        sx={{ width: 30, height: 30 }}
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No students enrolled
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

export default EnrolledStudents;
