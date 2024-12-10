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
import { toast } from 'react-toastify'; // Add this if you want to show success/error messages

// Provided function for fetching leads data
const fetchLeadsData = async (setLeadsData, setFilteredLeads, setTotalLeads, setConvertedLeads) => {
  try {
    const response = await fetch('https://sisyabackend.in/rkadmin/get_all_leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.success) {
      const leads = result.lead.sort((a, b) => new Date(b.updatedOn) - new Date(a.updatedOn));
      const convertedCount = leads.filter(lead => lead.status === 'converted').length;
      setTotalLeads(leads.length);
      setConvertedLeads(convertedCount);
      setLeadsData(leads);
      setFilteredLeads(leads);
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
  }
};

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
    console.error('Error fetching courses:', error);
  }
};

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Remove the prefix from base64 string
    reader.onerror = (error) => reject(error);
  });
};

const LeadManagerData = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [convertedLeads, setConvertedLeads] = useState(0);
  const [filter, setFilter] = useState('ALL');

  const [openModal, setOpenModal] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setFile(null);
  };

  const handleImport = async () => {
    if (!file || !selectedCourse) {
      alert('Please select a course and upload a file.');
      return;
    }

    setIsLoading(true);

    try {
      const fileData = await convertFileToBase64(file);

      const postData = {
        courseId: selectedCourse.id,
        fileData,
        grade: Number(selectedCourse.grade),
      };

      const response = await fetch('https://sisyabackend.in/student/leads/bulk_insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      setIsLoading(false);

      if (result.success) {
        toast.success('Leads uploaded successfully.');
        fetchLeadsData(setLeadsData, setFilteredLeads, setTotalLeads, setConvertedLeads);
        handleModalClose();
      } else {
        toast.error('Failed to upload leads.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error during file import:', error);
      toast.error('Error occurred during file upload.');
    }
  };

  const approveLead = async (leadId) => {
    try {
      const response = await fetch(`https://sisyabackend.in/rkadmin/approve_lead/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const result = await response.json();
      if (result.success) {
        toast.success('Lead approved successfully.');
        fetchLeadsData(setLeadsData, setFilteredLeads, setTotalLeads, setConvertedLeads);
      } else {
        toast.error('Failed to approve lead.');
      }
    } catch (error) {
      console.error('Error approving lead:', error);
      toast.error('Error occurred while approving the lead.');
    }
  };
  
  const rejectLead = async (leadId) => {
    try {
      const response = await fetch(`https://sisyabackend.in/rkadmin/reject_lead/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const result = await response.json();
      if (result.success) {
        toast.success('Lead rejected successfully.');
        fetchLeadsData(setLeadsData, setFilteredLeads, setTotalLeads, setConvertedLeads);
      } else {
        toast.error('Failed to reject lead.');
      }
    } catch (error) {
      console.error('Error rejecting lead:', error);
      toast.error('Error occurred while rejecting the lead.');
    }
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
                  <TableCell><strong>Details</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
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
        {/* Action Field */}
        <TableCell>
          {lead.status === 'pending approval' ? (
            <a href={`#view-proof/${lead.id}`} className="view-proof-link" style={{ color: '#1976d2', textDecoration: 'underline' }}>
              View Proof
            </a>
          ) : lead.status === 'converted' ? (
            <Button variant="outlined" size="small">
              View
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
              N/A
            </Typography>
          )}
        </TableCell>
        <TableCell>
          {lead.status === 'pending approval' ? (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => approveLead(lead.id)}
                style={{ marginRight: '10px' }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => rejectLead(lead.id)}
              >
                Reject
              </Button>
            </>
          ) : lead.status === 'converted' ? (
            <Typography variant="body2" color="textSecondary">
              Completed
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              N/A
            </Typography>
          )}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} align="center">
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
            getOptionLabel={(option) => option.name || 'Unknown Course'}
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
          <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '20px' }} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleImport}
            disabled={!selectedCourse || !file || isLoading}
          >
            {isLoading ? 'Uploading...' : 'Submit'}
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};

export default LeadManagerData;
