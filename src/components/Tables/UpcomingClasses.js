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

function UpcomingClasses() {
  const user = getUser();
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [visibleClasses, setVisibleClasses] = useState(10);
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

      if (result.success && result.bigCourses) {
        setMyCourses(result.bigCourses);
        extractSessions(result.bigCourses);
      } else {
        setMyCourses([]);
      }
    } catch (error) {
      console.log('Error fetching teacher courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleViewCourseDetails = (courseId) => {
    navigate("../course-details", { state: { courseId } });
  };

  const getSubjectById = async (subjectId) => {
    try {
      const subjectResponse = await fetch('https://sisyabackend.in/student/get_subject_by_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(subjectId, 10) }),
      });
      const subjectResult = await subjectResponse.json();
      return subjectResult.success ? subjectResult.subjects[0].name : subjectId;
    } catch (error) {
      console.error("Error fetching subject details:", error);
      return subjectId;
    }
  };

  const extractSessions = async (courses) => {
    const allSessions = await Promise.all(courses.flatMap(async (course) => {
      return await Promise.all(course.session.map(async (session) => ({
        id: session.id,
        detail: session.detail,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        courseId: course.id,
        subjectId: await getSubjectById(session.subjectId),
        status: session.isDone ? 'Complete' : 'Not Started Yet',
      })));
    }));

    const today = new Date();
    const filteredSessions = allSessions.flat().filter((session) => session.startTime >= today);
    setSessions(filteredSessions);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  const getRowStyle = (status) => {
    return {
      backgroundColor: status === 'Not Started Yet' ? '#fffbe6' : '#e6ffed',
      fontWeight: status === 'Not Started Yet' ? 'bold' : 'normal',
    };
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Upcoming Classes
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
          <Table aria-label="upcoming-classes-table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingCourses ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sessions.length > 0 ? (
                sessions.slice(0, visibleClasses).map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      ...getRowStyle(item.status),
                    }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.detail}</TableCell>
                    <TableCell>{formatDateTime(item.startTime)}</TableCell>
                    <TableCell>{formatDateTime(item.endTime)}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Classes Available
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

export default UpcomingClasses;
