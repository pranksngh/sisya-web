import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { getUser } from '../../Functions/Login';

const MentorListData = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [salesmanList, setSalesmanList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTermWithSuggestions, setSearchTermWithSuggestions] = useState('');
  const [isSearchApplied, setIsSearchApplied] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false); 
  const [selectedClass, setSelectedClass] = useState(null); 
  const [selectedSection, setSelectedSection] = useState('Classes'); 
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  useEffect(() => {
    fetchTeacherList(); 
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  const fetchTeacherList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/list_salesmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setSalesmanList(result.salesmen);
        setFilteredData(result.salesmen);
      } else {
      //  console.error('Failed to fetch mentors');
      }
    } catch (error) {
   //   console.error('Error fetching mentors:', error);
    }
  };

  const handleSearchWithSuggestions = (e) => {
    const value = e.target.value;
    setSearchTermWithSuggestions(value);
    const sourceData = isFilterApplied ? salesmanList.filter(
      salesman =>
        (!selectedClass || salesman.classes.includes(selectedClass.toString())) &&
        (!dateRange.startDate || (new Date(salesman.createdOn) >= new Date(dateRange.startDate))) &&
        (!dateRange.endDate || (new Date(salesman.createdOn) <= new Date(dateRange.endDate)))
    ) : salesmanList;

    if (value) {
      const filteredSuggestions = sourceData.filter((salesman) =>
        salesman.name.toLowerCase().includes(value.toLowerCase()) ||
        salesman.id.toString().includes(value) ||
        salesman.email.includes(value)
      );
      setFilteredData(filteredSuggestions);
      setIsSearchApplied(true);
    } else {
      setFilteredData(isFilterApplied ? sourceData : salesmanList);
      setIsSearchApplied(false);
    }
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };

  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const handleClassSelection = (classNumber) => {
    setSelectedClass(classNumber);
    console.log(`Class ${classNumber} selected`);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filteredSalesman = salesmanList;
    if (selectedClass) {
      filteredSalesman = filteredSalesman.filter((salesman) =>
        salesman.classes && salesman.classes.includes(selectedClass.toString())
      );
    }
    if (dateRange.startDate && dateRange.endDate) {
      filteredSalesman = filteredSalesman.filter((salesman) => {
        const createdOn = new Date(salesman.createdOn);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return createdOn >= start && createdOn <= end;
      });
    }
    setFilteredData(filteredSalesman);
    setIsFilterApplied(true);
    closeFilterDialog();
  };

  const renderTableData = () => {
    return filteredData.map((item, index) => (
      <TableRow key={index}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>{formatDate(item.createOn)}</TableCell>
        <TableCell>
          <Button onClick={() => navigate("../mentorInfo", { state: { id: item.id } })} variant="contained" color="primary">
            View Details
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Mentors</Typography>

      {/* Search and Filter Section */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          label="Search by name, ID, or phone"
          value={searchTermWithSuggestions}
          onChange={handleSearchWithSuggestions}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FilterList />
              </InputAdornment>
            ),
          }}
        />
        <Button onClick={openFilterDialog} variant="contained" color="success" startIcon={<FilterList />}>
          Filter
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderTableData()}</TableBody>
        </Table>
      </Paper>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onClose={closeFilterDialog} fullWidth maxWidth="md">
        <DialogTitle>Filter</DialogTitle>
        <DialogContent>
          {/* Filter content like class selection, date range */}
          {/* ... */}
        </DialogContent>
        <DialogActions>
          <Button onClick={applyFilters} color="primary">Apply Now</Button>
        </DialogActions>
      </Dialog>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>Teacher Info</DialogTitle>
        <DialogContent>
          {/* Modal content for displaying teacher info */}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorListData;
