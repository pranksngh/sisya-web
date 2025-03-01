import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  CircularProgress,
  Pagination,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// New `TeacherReportData` page with Material-UI
const TeacherReportData = () => {
  const [teacherList, setTeacherList] = useState([]); // Store full teacher list
  const [filteredTeachers, setFilteredTeachers] = useState([]); // Filtered teachers for display
  const [courseData, setCourseData] = useState([]); // Store teacher course data
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fetch all teachers from the server
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentors', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        setTeacherList(result.mentors);
        setFilteredTeachers(result.mentors); // Display all teachers initially
      }
    } catch (error) {
      console.error('Error fetching teacher list:', error);
    }
    setLoading(false);
  };

  // Search handling logic
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterTeachers(value, selectedClass); // Apply filtering based on search & class
  };

  const handleSelectClass = (e) => {
    const selectedGrade = e.target.value;
    setSelectedClass(selectedGrade);
    filterTeachers(searchTerm, selectedGrade); // Apply filtering based on search & class
  };

  const filterTeachers = (search, classFilter) => {
    let filtered = teacherList;

    // Apply search term
    if (search) {
      filtered = filtered.filter((teacher) =>
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.id.toString().includes(search) ||
        teacher.phone.includes(search)
      );
    }

    // Apply class filtering
    if (classFilter) {
      filtered = filtered.filter((teacher) => teacher.Grades?.includes(classFilter));
    }

    setFilteredTeachers(filtered);
    setCurrentPage(1); // Reset pagination on filtering
  };

  const fetchCourseData = async (teachers) => {
    const dataList = [];
    setLoading(true);
    try {
      for (let teacher of teachers) {
        const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentorId: teacher.id }),
        });
        const result = await response.json();

        if (result.success && result.bigCourses.length) {
          for (let course of result.bigCourses) {
            const totalSessions = course.session?.filter(
              (session) => session.mentorId === teacher.id
            ).length;
            const conductedSessions = course.session?.filter(
              (session) => session.isDone && session.mentorId === teacher.id
            ).length;

            dataList.push({
              mentorId: teacher.id,
              mentorName: teacher.name,
              courseName: course.name,
              totalSessions,
              conductedSessions,
            });
          }
        }
      }
      setCourseData(dataList);
    } catch (error) {
      console.error('Error while fetching course data', error);
    }
    setLoading(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const dataToPaginate = filteredTeachers.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
    fetchCourseData(dataToPaginate);
  }, [currentPage, filteredTeachers]);

  const renderTableData = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    if (!courseData.length) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            No data found.
          </TableCell>
        </TableRow>
      );
    }

    return courseData.map((item, index) => (
      <TableRow hover key={index}>
        <TableCell>{item.mentorId}</TableCell>
        <TableCell>{item.mentorName}</TableCell>
        <TableCell>{item.courseName}</TableCell>
        <TableCell align="center">{item.totalSessions}</TableCell>
        <TableCell align="center">{item.conductedSessions}</TableCell>
      </TableRow>
    ));
  };

  return (
    <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
      <Typography variant="h5" gutterBottom>
        Teacher Report Data
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={handleSelectClass}
            label="Class"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i} value={String(i + 1)}>
                Class {i + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search teacher..."
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell>Mentor Name</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell align="center">Total Sessions</TableCell>
              <TableCell align="center">Conducted Sessions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderTableData()}</TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 2,
          gap: 2,
        }}
      >
        <Pagination
          count={Math.ceil(filteredTeachers.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Paper>
  );
};

export default TeacherReportData;
