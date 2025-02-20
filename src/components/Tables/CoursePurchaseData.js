import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../Functions/Login';

const CoursePurchaseListData = () => {
  const user = getUser();
  const [courseList, setCourseList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [filteredStudentSuggestions, setFilteredStudentSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchStudentList();
  }, [user?.id]);

  const fetchCourses = async () => {
    setLoading(true);
    const response = await fetch('https://sisyabackend.in/rkadmin/get_purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.success) {
      setCourseList(result.subs);
      setFilteredData(result.subs); // Load all data by default
    }
    setLoading(false);
  };

  const fetchStudentList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_recent_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, amount: 10000 }),
      });
      const result = await response.json();
      if (result.success) {
        setStudentList(result.studentList);
      }
    } catch (error) {
    //  console.error('Error fetching students:', error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page change
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderTableData = () => {
    // Paginate data for the current page
    const paginatedData = filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <TableBody>
        {paginatedData.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.OrderId || 'N/A'}</TableCell>
            <TableCell>{item.user?.name || 'Unknown'}</TableCell>
            <TableCell>{item.course?.name || 'Unknown'}</TableCell>
            <TableCell>{item.course?.grade || 'Unknown'}</TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>{item.PurchasePrice}</TableCell>
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewDetails(item)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  const renderModal = () => {
    if (!selectedCourse) return null;

    return (
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm">
        <DialogTitle>Course Purchase Info</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <Typography>Order ID: {selectedCourse?.OrderId || 'N/A'}</Typography>
            <Typography>Student Name: {selectedCourse?.user?.name || 'Unknown'}</Typography>
            <Typography>Course Name: {selectedCourse?.course?.name || 'Unknown'}</Typography>
            <Typography>Grade: {selectedCourse?.course?.grade || 'Unknown'}</Typography>
            <Typography>Purchase Date: {new Date(selectedCourse?.createdAt).toLocaleDateString()}</Typography>
            <Typography>Price: Rs {selectedCourse?.PurchasePrice}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Purchased Courses
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Purchased On</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              {renderTableData()}
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />

          {isModalOpen && renderModal()}
        </>
      )}
    </Box>
  );
};

export default CoursePurchaseListData;
