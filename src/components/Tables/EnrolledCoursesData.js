import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, CircularProgress, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getUser } from '../../Functions/Login';

const EnrolledCoursesData = () => {
  const user = getUser();
  const [courses, setCourses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleViewCourseDetails = (courseId) => {
    navigate("../course-details", { state: { courseId } });
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://sisyabackend.in/teacher/get_all_courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mentorId: user.mentor.id })
      });
      const result = await response.json();
      if (result.success) {
        setCourses(result.bigCourses);
        setFilteredData(result.bigCourses);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const filtered = courses.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, courses]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const renderTableData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem).map((item) => {
      const now = new Date();
    const startDate = new Date(item.startDate);
      return (
      <TableRow key={item.id} sx={{ 
        '&:hover': { backgroundColor: '#f5f5f5' },
        ...(now < startDate ? { backgroundColor: '#ffcccb' } : {}) 
      }}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.isLongTerm ? "Long Term" : "Short Term"}</TableCell>
        <TableCell>
          <a href="#" onClick={() => {
            
            if (now < startDate) {
              alert('You cannot enroll before the course starts.');
            } else {
              handleViewCourseDetails(item.id);
            }
          }} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
            {item.name}
          </a>
        </TableCell>
        <TableCell>{item.grade}</TableCell>
        <TableCell>{formatDate(item.startDate)}</TableCell>
        <TableCell>{formatDate(item.endDate)}</TableCell>
        <TableCell>{item.enrolledStudents}</TableCell>
        <TableCell>
          <span style={{ color: item.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </TableCell>
      </TableRow>
    )
  });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        My Courses
      </Typography>
      
      {/* Search Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          <TextField
            label="Search Courses"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
            sx={{ mr: 2 }}
          />
          <Tooltip title="Clear Search">
            <IconButton onClick={handleClearSearch} sx={{ color: 'gray' }}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="Search">
          <IconButton onClick={() => handleSearch({ target: { value: searchTerm } })}>
            <SearchIcon sx={{ color: 'gray' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Loading Spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography sx={{ marginLeft: 2 }}>Loading Courses...</Typography>
        </Box>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Course Type</TableCell>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Grade</TableCell>
                  <TableCell sx={{ color: 'white' }}>Start Date</TableCell>
                  <TableCell sx={{ color: 'white' }}>End Date</TableCell>
                  <TableCell sx={{ color: 'white' }}>Enrolled Students</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderTableData()}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredData.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ borderRadius: 2, boxShadow: 2 }}
        />
      </Box>
    </Box>
  );
};

export default EnrolledCoursesData;
