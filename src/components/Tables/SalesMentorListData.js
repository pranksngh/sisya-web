import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  TablePagination,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser } from '../../Functions/Login';

const SalesMentorListData = () => {
  const user = getUser();
  const [salesmenList, setSalesmenList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: 'India',
    isActive: true,
    classes: [], // To store multiple class selection
  });
  const [loading, setLoading] = useState(false);

  // Fetch salesmen data
  useEffect(() => {
    fetchSalesmenData();
  }, [user?.id]);

  const fetchSalesmenData = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/list_salesmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result?.success) {
        setSalesmenList(result?.salesmen);
        setFilteredData(result?.salesmen);
      }
    } catch (error) {
      console.error('Error fetching salesmen:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = salesmenList.filter((item) =>
      item.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleOpenModal = (salesman = null) => {
    setIsModalOpen(true);
    setIsEditMode(!!salesman);
    if (salesman) {
      setFormData({
        name: salesman.name,
        email: salesman.email,
        password: '',
        country: 'India',
        isActive: salesman.isActive,
        classes: salesman.classes || [],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        country: 'India',
        isActive: true,
        classes: [],
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (event, newValue) => {
    setFormData({ ...formData, classes: newValue });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const url = isEditMode
      ? 'https://sisyabackend.in/rkadmin/update_salesman'
      : 'https://sisyabackend.in/rkadmin/insert_salesman';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(isEditMode ? 'Mentor updated successfully!' : 'Mentor added successfully!');
        handleCloseModal();
        fetchSalesmenData();
      } else {
        toast.error('Operation failed. Please try again');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        Sales Mentor Management
      </Typography>
      <Box mb={3}>
        <TextField
          label="Search Salesmen"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal()}
        style={{ marginBottom: '15px' }}
      >
        Add Mentor
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(
                currentPage * itemsPerPage,
                currentPage * itemsPerPage + itemsPerPage
              )
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenModal(item)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>{isEditMode ? 'Edit Sales Mentor' : 'Add Sales Mentor'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
          />
          <Autocomplete
            multiple
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} // Replace with your actual class data
            value={formData.classes}
            onChange={handleClassChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={`Class ${option}`}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Select Multiple Classes"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Loading...' : isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesMentorListData;
