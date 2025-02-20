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
  CircularProgress,
} from '@mui/material';
import { getUser } from '../../Functions/Login';
import { useNavigate } from 'react-router-dom';

function EnrolledCourse() {
  const user = getUser();
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchTecherCourses();
  }, []);

  const fetchTecherCourses = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/teacher/get_all_courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorId: user.mentor.id }),
      });
      const result = await response.json();
    //  console.log('Enrolled Courses API Response:', result);

      if (result.success && result.bigCourses) {
        setMyCourses(result.bigCourses);
      } else {
        setMyCourses([]);
      }
    } catch (error) {
    //  console.log('Error fetching teacher courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleViewCourseDetails = (courseId) => {
    navigate("../course-details", { state: { courseId } });
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Assigned Courses
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
          <Table aria-label="my-courses-table">
            <TableHead>
              <TableRow backgroundColor="#eee">
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>Grade</TableCell>
               
              
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingCourses ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : myCourses.length > 0 ? (
                myCourses.map((item) => (
                  <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.isLongTerm ? 'Long Term' : 'Short Term'}</TableCell>
                    <TableCell>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewCourseDetails(item.id);
                        }}
                        style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}
                      >
                        {item.name}
                      </a>
                    </TableCell>
                    <TableCell>{item.grade}</TableCell>
                   
                   
                    <TableCell>
                      <span style={{ color: item.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No courses available
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

export default EnrolledCourse;
