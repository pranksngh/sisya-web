import React, { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Modal,
  TextField,
  Autocomplete,
} from '@mui/material';

// Provided function for fetching leads data
const fetchLeadsData = async (setLeadsData, setFilteredLeads, setTotalLeads, setConvertedLeads) => {
  try {
    const response = await fetch('https://sisyabackend.in/rkadmin/get_all_leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.success) {
      const leads = result.lead.sort((a, b) => new Date(b.updatedOn) - new Date(a.updatedOn)); // Sort by most recent update
      const convertedCount = leads.filter(lead => lead.status === 'converted').length;
      setTotalLeads(leads.length);
      setConvertedLeads(convertedCount);
      setLeadsData(leads);
      setFilteredLeads(leads); // Initially show all leads
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
  }
};

// Provided fetchCourses logic
const fetchCourses = async (setCourseList) => {
  try {
    const response = await fetch('https://sisyabackend.in/rkadmin/get_all_courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.success) {
      const shortTermCourses = result.bigCourses.filter(course => !course.isLongTerm);
      setCourseList(shortTermCourses);
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
};

const LeadManagerData = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [convertedLeads, setConvertedLeads] = useState(0);
  const [filter, setFilter] = useState('ALL');

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    fetchLeadsData(setLeadsData, setFilteredLeads, setTotalLeads, setConvertedLeads);
  }, []);

  useEffect(() => {
    fetchCourses(setCourseList);
  }, []);

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    if (selectedFilter === 'ALL') {
      setFilteredLeads(leadsData);
    } else {
      const filtered = leadsData.filter(lead => lead.status === selectedFilter);
      setFilteredLeads(filtered);
    }
  };

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedCourse(null);
    setUploadedFile(null);
  };

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("Selected Course: ", selectedCourse);
    console.log("Uploaded File: ", uploadedFile);
    alert("Form Submitted!");
    handleModalClose();
  };

  return (
    <Grid container spacing={3} style={{ padding: '20px' }}>
      {/* Header Section */}
      <Grid item xs={12}>
        <Typography variant="h4" align="center" style={{ marginBottom: '10px' }}>
          Leads Dashboard
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary">
          Total Leads: {totalLeads} | Converted Leads: {convertedLeads}
        </Typography>
      </Grid>

      {/* Filter & Upload Section */}
      <Grid item xs={12} container justifyContent="space-between" alignItems="center">
        <Box>
          {['ALL', 'converted', 'pending', 'contacted'].map((item) => (
            <Chip
              key={item}
              label={item}
              clickable
              color={filter === item ? 'primary' : 'default'}
              onClick={() => handleFilterChange(item)}
              style={{ margin: '5px' }}
            />
          ))}
        </Box>
        <Button variant="contained" color="primary" onClick={handleModalOpen}>
          Upload CSV
        </Button>
      </Grid>

      {/* Leads Table Section */}
      <Grid item xs={12}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Last Updated</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{new Date(lead.updatedOn).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No leads match the filter criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Modal Section */}
      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upload CSV
          </Typography>
          <Autocomplete
            options={courseList}
            getOptionLabel={(option) => option.name || "Unknown Course"}
            value={selectedCourse}
            onChange={(event, newValue) => setSelectedCourse(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Course"
                variant="outlined"
                fullWidth
                style={{ marginBottom: '20px' }}
              />
            )}
          />
          <input type="file" onChange={handleFileChange} style={{ marginBottom: '20px' }} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={!selectedCourse || !uploadedFile}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};

export default LeadManagerData;
