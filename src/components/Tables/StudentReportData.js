import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StudentReportData = () => {

  const [studentList, setStudentList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch the initial student list from the server
  useEffect(() => {
    fetchStudentList(1, 10000);
  }, []);

  const fetchStudentList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_recent_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, amount: 10000 }),
      });
      const result = await response.json();
      if (result.success && result.studentList.length > 0) {
        setStudentList(result.studentList);
      }
    } catch (error) {
     // console.error('Error fetching student list:', error);
    }
  };

  const applyFilters = async () => {
    setIsLoading(true);
    let filtered = studentList;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toString().includes(searchTerm) ||
        student.phone.includes(searchTerm)
      );
    }

    if (selectedClass) {
      filtered = filtered.filter(student => student.grade === selectedClass);
    }

    const paginatedData = filtered.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

    setFilteredData(paginatedData);
    setTotalPages(Math.ceil(filtered.length / rowsPerPage));
    await fetchCourseDataForStudents(paginatedData);
    setIsLoading(false);
  };

  const fetchCourseDataForStudents = async (students) => {
    const courseDataList = [];
    for (let student of students) {
      try {
        const response = await fetch('https://sisyabackend.in/rkadmin/get_purchases_by_student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endUsersId: student.id }),
        });

        const result = await response.json();

        if (result.success && result.subs.length) {
          for (let course of result.subs) {
            let attendenceRecord = 0,
              homeworkSubmitted = 0,
              testSubmitted = 0;

            const progressResponse = await fetch('https://sisyabackend.in/rkadmin/get_report_user_course', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endUsersId: student.id, bigCourseId: course.bigCourseId }),
            });

            const progressResult = await progressResponse.json();
            if (progressResult.success) {
              attendenceRecord = progressResult.AttendenceRecords.length || 0;
              homeworkSubmitted = progressResult.SessionTestSubmissions.length || 0;
              testSubmitted = progressResult.myCtestSubmissions.length || 0;
            }

            courseDataList.push({
              studentId: student.id,
              studentName: student.name,
              courseName: course.course.name,
              attendenceRecord,
              homeworkRecord: homeworkSubmitted,
              testRecord: testSubmitted,
              grade: student.grade,
            });
          }
        }
      } catch (error) {
      //  console.error('Error fetching courses:', error);
      }
    }
    setCourseData(courseDataList);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    applyFilters();
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    applyFilters();
  };

  const renderTableData = () => {
    if (!courseData.length) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" style={{ padding: '16px' }}>
            No record found
          </TableCell>
        </TableRow>
      );
    }

    return courseData.map((item, index) => (
      <TableRow hover key={index}>
        <TableCell>{item.studentId}</TableCell>
        <TableCell>{item.studentName}</TableCell>
        <TableCell>{item.courseName}</TableCell>
        <TableCell align="center">{item.testRecord}</TableCell>
        <TableCell align="center">{item.attendenceRecord}</TableCell>
        <TableCell align="center">{item.homeworkRecord}</TableCell>
        <TableCell align="center">{item.grade}</TableCell>
        {/* <TableCell align="center">
          <span
            className="active"
            onClick={() => navigate('/ViewStudent', { state: { student: item } })}
            style={{
              cursor: 'pointer',
              color: '#1976d2',
              textDecoration: 'underline',
            }}
          >
            View
          </span>
        </TableCell> */}
      </TableRow>
    ));
  };

  return (
    <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
      <Typography variant="h5" gutterBottom>
        Student Report Data
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, width: '300px' }}>
  <FormControl variant="outlined" size="small" fullWidth>
    <InputLabel>Select Class</InputLabel>
    <Select
      value={selectedClass}
      onChange={handleClassChange}
      label="Select Class"
      placeholder='Select Class'
    >
      
      {Array.from({ length: 12 }, (_, i) => (
        <MenuItem key={i} value={String(i + 1)}>
          Class {i + 1}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell align="center">Test Attempted</TableCell>
              <TableCell align="center">Attendance Records</TableCell>
              <TableCell align="center">Homework Records</TableCell>
              <TableCell align="center">Grade</TableCell>
             
            </TableRow>
          </TableHead>
          <TableBody>{isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              renderTableData()
            )}</TableBody>
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
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Paper>
  );
};

export default StudentReportData;
