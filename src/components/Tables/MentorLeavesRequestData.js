import React, { useState, useEffect } from 'react';
import { Button, Modal, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Box, Paper } from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser } from '../../Functions/Login';

const MentorLeaveRequestData = () => {
  const user = getUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveRequests, setLeaveRequests] = useState([]); // State for leave requests
  const [itemsPerPage] = useState(10);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    mentorId: user.mentorId || '',
  });
  const [leaveErrorMessage, setLeaveErrorMessage] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Fetch pending leaves and mentor details
  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        const response = await fetch('https://sisyabackend.in//teacher/sales/my_leaves', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ salesmanId: user.salesman.id }),
        });

        const result = await response.json();

        if (result.success) {
          setLeaveRequests(result.leaves); // Set the fetched leave requests data
        } else {
        //  console.error('Failed to fetch leaves');
        }
      } catch (error) {
      //  console.error('Error fetching leaves:', error);
      }
    };

    fetchPendingLeaves();
  }, [user.mentorId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Functions for Leave Request Modal
  const openLeaveModal = () => {
    setIsLeaveModalOpen(true);
    setLeaveFormData({
      startDate: '',
      endDate: '',
      reason: '',
      mentorId: user.salesman.id || '',
    });
    setLeaveErrorMessage('');
  };

  const closeLeaveModal = () => {
    setIsLeaveModalOpen(false);
  };

  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData({ ...leaveFormData, [name]: value });
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveLoading(true);
    setLeaveErrorMessage('');

    // Validate dates
    if (new Date(leaveFormData.startDate) > new Date(leaveFormData.endDate)) {
      setLeaveErrorMessage('Start date cannot be after end date.');
      setLeaveLoading(false);
      return;
    }

    const payload = {
      salesmanId: parseInt(user.salesman.id, 10), // Assuming user ID is required
      startDate: new Date(leaveFormData.startDate).toISOString(), // Convert to ISO string
      endDate: new Date(leaveFormData.endDate).toISOString(),     // Convert to ISO string
      reason: leaveFormData.reason,
    };

    try {
      const response = await fetch('https://sisyabackend.in/teacher/sales/new_leave_req', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setLeaveLoading(false);

      if (result.success) {
        closeLeaveModal();
        toast.success('Leave requested successfully.'); // Show success toast
      } else {
        setLeaveErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setLeaveLoading(false);
    //  console.error("Error requesting leave:", error);
      setLeaveErrorMessage('An error occurred. Please try again.');
    }
  };

  const renderStatus = (status) => {
    let statusClass = '';
    switch (status.toLowerCase()) {
      case 'pending':
        statusClass = 'status-pending';
        break;
      case 'accepted':
        statusClass = 'status-approved';
        break;
      case 'denied':
        statusClass = 'status-rejected';
        break;
      default:
        statusClass = '';
        break;
    }
    return <span className={`status-label ${statusClass}`}>{status}</span>;
  };

  const renderTableData = () => {
    const filteredData = leaveRequests.filter((item) =>
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by reason
      item.status.toLowerCase().includes(searchTerm.toLowerCase())    // Search by status
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return currentItems.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{formatDate(item.startDate)}</TableCell>
        <TableCell>{formatDate(item.endDate)}</TableCell>
        <TableCell>{item.reason}</TableCell>
        <TableCell>{renderStatus(item.status)}</TableCell>
      </TableRow>
    ));
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const renderPagination = () => (
    <TablePagination
      rowsPerPageOptions={[itemsPerPage]}
      component="div"
      count={leaveRequests.length}
      rowsPerPage={itemsPerPage}
      page={currentPage - 1}
      onPageChange={handleChangePage}
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Leave Requests
      </Typography>
      <Button variant="contained" color="primary" onClick={openLeaveModal}>
        Request Leave
      </Button>

      <TextField
        variant="outlined"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="leave requests table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderTableData()}</TableBody>
        </Table>
      </TableContainer>

      {renderPagination()}

      {/* Leave Request Modal */}
      <Modal
        open={isLeaveModalOpen}
        onClose={closeLeaveModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ width: 400, backgroundColor: 'white', padding: 4, margin: 'auto', marginTop: '10%' }}>
          <Typography id="modal-title" variant="h6" gutterBottom>
            Request Leave
          </Typography>
          <form onSubmit={handleLeaveSubmit}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={leaveFormData.startDate}
              onChange={handleLeaveInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={leaveFormData.endDate}
              onChange={handleLeaveInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Reason"
              name="reason"
              value={leaveFormData.reason}
              onChange={handleLeaveInputChange}
              fullWidth
              required
              multiline
              rows={4}
              sx={{ marginBottom: 2 }}
            />
            {leaveErrorMessage && <Typography color="error">{leaveErrorMessage}</Typography>}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="submit" variant="contained" color="primary" disabled={leaveLoading}>
                {leaveLoading ? 'Submitting...' : 'Submit'}
              </Button>
              <Button type="button" variant="outlined" onClick={closeLeaveModal} disabled={leaveLoading}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <ToastContainer /> {/* Add ToastContainer for showing toasts */}
    </Box>
  );
};

export default MentorLeaveRequestData;
