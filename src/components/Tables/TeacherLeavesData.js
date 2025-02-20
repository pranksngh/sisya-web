import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getUser } from '../../Functions/Login';

const TeacherLeavesData = () => {
  const user = getUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [mentors, setMentors] = useState({});
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const userEmail = localStorage.getItem('email');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [leaveFormData, setLeaveFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    mentorId: user.mentorId || '',
  });
  const [leaveErrorMessage, setLeaveErrorMessage] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);

  const fetchPendingLeaves = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/hr/get_pending_leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setLeaveRequests(result.leaveRequests);
        const uniqueMentorIds = [...new Set(result.leaveRequests.map(item => item.mentorId))];
        uniqueMentorIds.forEach(fetchMentorDetails);
      } else {
     //   console.error('Failed to fetch leaves');
      }
    } catch (error) {
     // console.error('Error fetching leaves:', error);
    }
  };

  const fetchMentorDetails = async (mentorId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_by_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorId }),
      });

      const result = await response.json();
      if (result.success && result.mentor) {
        setMentors(prevMentors => ({
          ...prevMentors,
          [mentorId]: result.mentor.name,
        }));
      }
    } catch (error) {
     // console.error('Error fetching mentor details:', error);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, [user.mentorId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const refreshLeaveRequests = () => {
    fetchPendingLeaves();
  };

  const handleApprove = async (leaveId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/hr/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: leaveId, actor: userEmail }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Leave approved successfully.');
        refreshLeaveRequests();
      } else {
        toast.error('Failed to approve leave.');
      }
    } catch (error) {
      toast.error('Error approving leave.');
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/hr/deny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: leaveId, actor: userEmail }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Leave rejected successfully.');
        refreshLeaveRequests();
      } else {
        toast.error('Failed to reject leave.');
      }
    } catch (error) {
      toast.error('Error rejecting leave.');
    //  console.error('Error rejecting leave:', error);
    }
  };

  const openLeaveModal = () => {
    setIsLeaveModalOpen(true);
    setLeaveFormData({
      startDate: '',
      endDate: '',
      reason: '',
      mentorId: user.mentorId || '',
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

    if (new Date(leaveFormData.startDate) > new Date(leaveFormData.endDate)) {
      setLeaveErrorMessage('Start date cannot be after end date.');
      setLeaveLoading(false);
      return;
    }

    const payload = {
      mentorId: parseInt(user.mentor.id, 10),
      startDate: new Date(leaveFormData.startDate).toISOString(),
      endDate: new Date(leaveFormData.endDate).toISOString(),
      reason: leaveFormData.reason,
    };

    try {
      const response = await fetch('https://epilot.in/teacher/requestLeave', {
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
        toast.success('Leave requested successfully.');
        refreshLeaveRequests();
      } else {
        setLeaveErrorMessage(result.message || 'Something went wrong. Please try again.');
        toast.error(result.message || 'An error occurred.');
      }
    } catch (error) {
      setLeaveLoading(false);
      setLeaveErrorMessage('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
   //   console.error('Error requesting leave:', error);
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
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return currentItems.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{formatDate(item.startDate)}</TableCell>
        <TableCell>{formatDate(item.endDate)}</TableCell>
        <TableCell>{mentors[item.mentorId] || 'Loading...'}</TableCell>
        <TableCell>{item.reason}</TableCell>
        <TableCell>{renderStatus(item.status)}</TableCell>
        <TableCell>
          {item.status.toLowerCase() === 'pending' ? (
            <div className="action-buttons">
              <Button variant="contained" color="primary" onClick={() => handleApprove(item.id)}>
                Approve
              </Button>
              <Button variant="contained" color="secondary" onClick={() => handleReject(item.id)}>
                Reject
              </Button>
            </div>
          ) : (
            <span>N/A</span>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  const renderPagination = () => {
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={leaveRequests.length}
        rowsPerPage={itemsPerPage}
        page={currentPage - 1}
        onPageChange={(event, newPage) => setCurrentPage(newPage + 1)}
        onRowsPerPageChange={(event) => setItemsPerPage(+event.target.value)}
      />
    );
  };

  return (
    <div className="data-table-container">
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        Leave Requests
      </Typography>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <TextField
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginRight: '10px' }}
          InputProps={{
            startAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Mentor Name</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableData()}
          </TableBody>
        </Table>
      </TableContainer>

      {renderPagination()}

      <Dialog open={isLeaveModalOpen} onClose={closeLeaveModal}>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent>
          <form onSubmit={handleLeaveSubmit}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={leaveFormData.startDate}
              onChange={handleLeaveInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={leaveFormData.endDate}
              onChange={handleLeaveInputChange}
              fullWidth
              required
              style={{ marginTop: '15px' }}
              InputLabelProps={{
                shrink: true,
              }}
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
              style={{ marginTop: '15px' }}
            />

            {leaveErrorMessage && <Typography color="error" style={{ marginTop: '10px' }}>{leaveErrorMessage}</Typography>}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLeaveModal} color="default">Cancel</Button>
          <Button onClick={handleLeaveSubmit} color="primary" disabled={leaveLoading}>
            {leaveLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherLeavesData;
