import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../Functions/Login';

const TeacherListData = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [teacherList, setTeacherList] = useState([]);
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
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (result.success) {
        setTeacherList(result.mentors);
        setFilteredData(result.mentors);
      } else {
     //   console.error('Failed to fetch mentors');
      }
    } catch (error) {
    //  console.error('Error fetching mentors:', error);
    }
  };

  const handleSearchWithSuggestions = (e) => {
    const value = e.target.value;
    setSearchTermWithSuggestions(value);

    const sourceData = isFilterApplied
      ? teacherList.filter(
          (teacher) =>
            (!selectedClass || teacher.Grades.includes(selectedClass.toString())) &&
            (!dateRange.startDate || new Date(teacher.createdOn) >= new Date(dateRange.startDate)) &&
            (!dateRange.endDate || new Date(teacher.createdOn) <= new Date(dateRange.endDate))
        )
      : teacherList;

    if (value) {
      const filteredSuggestions = sourceData.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(value.toLowerCase()) ||
          teacher.id.toString().includes(value) ||
          teacher.phone.includes(value)
      );
      setFilteredData(filteredSuggestions);
      setIsSearchApplied(true);
    } else {
      setFilteredData(isFilterApplied ? sourceData : teacherList);
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
  };

  const handleSectionSelection = (section) => {
    setSelectedSection(section);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filteredTeachers = teacherList;

    if (selectedClass) {
      filteredTeachers = filteredTeachers.filter((teacher) =>
        teacher.Grades && teacher.Grades.includes(selectedClass.toString())
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
      filteredTeachers = filteredTeachers.filter((teacher) => {
        const createdOn = new Date(teacher.createdOn);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return createdOn >= start && createdOn <= end;
      });
    }

    setFilteredData(filteredTeachers);
    setIsFilterApplied(true);
    closeFilterDialog();
  };

  const renderTableData = () => {
    return filteredData.map((item, index) => (
      <TableRow key={index} hover>
        <TableCell align="center">{item.id}</TableCell>
        <TableCell align="center">{item.name}</TableCell>
        <TableCell align="center">{item.email}</TableCell>
        <TableCell align="center">{item.phone}</TableCell>
        <TableCell align="center">{formatDate(item.createdOn)}</TableCell>
        <TableCell align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('../teacherInfo', { state: { id: item.id } })}
          >
            View Details
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box padding={6}>
      <Typography variant="h4" gutterBottom>
        Teachers
      </Typography>

      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <TextField
          label="Search by name, ID, or phone"
          variant="outlined"
          fullWidth
          value={searchTermWithSuggestions}
          onChange={handleSearchWithSuggestions}
        />

        <Button
          variant="contained"
          color="success"
          onClick={openFilterDialog}
          startIcon={<i className="fa fa-filter" />}
          sx={{ marginLeft: 2 }}
        >
          Filter
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Phone</TableCell>
              <TableCell align="center">Created On</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderTableData()}</TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isFilterDialogOpen} onClose={closeFilterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Filter</DialogTitle>
        <DialogContent>
          {selectedSection === 'Classes' && (
            <Box display="flex" flexWrap="wrap" gap={2} marginTop={2}>
              {[...Array(12)].map((_, i) => (
                <Chip
                  key={i + 1}
                  label={`Class ${i + 1}`}
                  clickable
                  onClick={() => handleClassSelection(i + 1)}
                  color={selectedClass === i + 1 ? 'primary' : 'default'}
                />
              ))}
            </Box>
          )}
          {selectedSection === 'Date Range' && (
            <Grid container spacing={2} marginTop={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  name="startDate"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Date"
                  type="date"
                  name="endDate"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={applyFilters} variant="contained" color="primary">
            Apply Filters
          </Button>
          <Button onClick={closeFilterDialog} variant="outlined" color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Teacher Info</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <Box>
              <Typography>Name: {selectedTeacher.name}</Typography>
              <Typography>Email: {selectedTeacher.email}</Typography>
              <Typography>Phone: {selectedTeacher.phone}</Typography>
              <Typography>DOB: {formatDate(selectedTeacher.dateOfBirth)}</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} marginTop={1}>
                {selectedTeacher.Grades.map((grade, index) => (
                  <Chip key={index} label={`Class ${grade}`} />
                ))}
              </Box>
              <Typography>Address: {selectedTeacher.address || 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherListData;