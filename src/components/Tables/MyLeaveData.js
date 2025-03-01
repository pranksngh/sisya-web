import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box, Button } from '@mui/material';
import { toast } from 'react-toastify';  // Import toast for success/error notifications
import AddLeaveRequestDialog from '../DialogBoxes/AddLeaveRquestDialog';
import { getUser } from '../../Functions/Login';

function LeaveRequestData() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveErrorMessage, setLeaveErrorMessage] = useState('');
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
  const [selectedRequest, setSelectedRequest] = useState({});
  const [mentors, setMentors] = useState({});
  const user = getUser();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveLoading(true);
    setLeaveErrorMessage('');
  
    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setLeaveErrorMessage('Start date cannot be after end date.');
      setLeaveLoading(false);
      return;
    }
  
    const payload = {
      mentorId: 1, // Replace with dynamic user ID
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      reason: formData.reason,
    };
  
    try {
      const response = await fetch('https://sisyabackend.in/teacher/requestLeave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      setLeaveLoading(false);
  
      if (result.success) {
        handleClose();  // Close the modal using the correct function
        console.log("leave added successfully");
        toast.success('Leave requested successfully.');  // Show success toast
      } else {
        setLeaveErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setLeaveLoading(false);
      console.error("Error requesting leave:", error);
      setLeaveErrorMessage('An error occurred. Please try again.');
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const response = await fetch('https://sisyabackend.in//teacher/get_my_leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorId: user.mentor.id }),
      });

      const result = await response.json();

      if (result.success) {
        setLeaveRequests(result.leaves); // Set the fetched leave requests data
        // Fetch mentor details for each unique mentorId
        const uniqueMentorIds = [...new Set(result.leaves.map(item => item.mentorId))];
        uniqueMentorIds.forEach(fetchMentorDetails);
      } else {
        console.error('Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchMentorDetails = async (mentorId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_by_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorId }), // Send mentorId in the request
      });

      const result = await response.json();

      if (result.success && result.mentor) {
        setMentors(prevMentors => ({
          ...prevMentors,
          [mentorId]: result.mentor.name, // Store the mentor name keyed by mentorId
        }));
      }
    } catch (error) {
      console.error('Error fetching mentor details:', error);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Leave Requests
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{ textTransform: 'capitalize', fontWeight: 'bold', borderRadius: 2, px: 3 }}
        >
          Add Leave Request
        </Button>
        <AddLeaveRequestDialog
  open={open}
  handleClose={handleClose}
  handleSubmit={handleLeaveSubmit}
  formData={formData} // Passing formData
  handleChange={handleChange}
/>

      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee</TableCell>
             
              <TableCell>From Date</TableCell>
              <TableCell>To Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveRequests.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{mentors[row.mentorId] || 'Load...'}</TableCell>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.endDate}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default LeaveRequestData;
