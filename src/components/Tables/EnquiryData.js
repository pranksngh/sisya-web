import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { getUser } from '../../Functions/Login';

const EnquiryData = () => {
  const user = getUser();
  const navigate = useNavigate();

  const [enquiryList, setEnquiryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [formData, setFormData] = useState({ name: '', country: 'India' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchBoardData();
  }, [user.id]);

  const fetchBoardData = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_inq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      if (result.success) {
        setEnquiryList(result.inq);
        setFilteredData(result.inq);
      } else {
        console.error("Failed to fetch boards");
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  useEffect(() => {
    const filtered = enquiryList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, enquiryList]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({ name: '', country: 'India' });
    setErrorMessage('');
  };

  const openEditModal = (board) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setSelectedBoard(board);
    setFormData({ name: board.name, country: 'India' });
    setErrorMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(
        isEditMode
          ? 'https://sisyabackend.in/rkadmin/update_board'
          : 'https://sisyabackend.in/rkadmin/add_board',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            educationBoardId: selectedBoard ? selectedBoard.id : undefined,
          }),
        }
      );

      const result = await response.json();
      setLoading(false);

      if (result.success) {
        closeModal();
        fetchBoardData();
      } else {
        setErrorMessage(JSON.stringify(result));
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating/adding board:", error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        All Enquiries
      </Typography>
      <Box mb={2}>
        <TextField
          label="Search..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
        />
      </Box>
     
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Person Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.message}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isEditMode ? 'Edit Board' : 'Add New Board'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Board Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            {errorMessage && (
              <Typography color="error" variant="body2" gutterBottom>
                {errorMessage}
              </Typography>
            )}
            <Box textAlign="right">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Submit'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default EnquiryData;
