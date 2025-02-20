import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Tab,
  Tabs,
  Typography,
  TextField,
  Paper,
  Avatar,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';

const gazettedHolidays = [
    { date: '2024-01-26', name: 'Republic Day' },
    { date: '2024-08-15', name: 'Independence Day' },
    { date: '2024-10-02', name: 'Gandhi Jayanti' },
    { date: '2024-12-25', name: 'Christmas Day' }
  ];
const locales = {
    'en-US': require('date-fns/locale/en-US'),
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });
const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const ProfileImage = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginRight: theme.spacing(2),
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  boxShadow: theme.shadows[5],
}));

const MentorProfileData = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [mentorDetails, setMentorDetails] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [modalInfo, setModalInfo] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const location = useLocation();
  const { id } = location.state || {};

  useEffect(() => {
    if (id) {
      fetchMentorDetails(id);
      fetchMentorLeaves(id);
      fetchAttendanceRecords(id);
    }
  }, [id]);

  const fetchMentorDetails = async (id) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/hr/get_salesman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }) // Pass the mentor ID to the API
      });

      const result = await response.json();

      if (result.success) {
        setMentorDetails(result.salesman); // Store mentor details in state
      } else {
       // console.error('Failed to fetch mentor details');
      }
    } catch (error) {
     // console.error('Error fetching mentor details:', error);
    }
  };

  // Function to fetch mentor leaves dynamically
  const fetchMentorLeaves = async (mentorId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/hr/get_leaves_by_salesman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salesmanId : mentorId }) // Pass the mentor ID to the API
      });

      const result = await response.json();

      if (result.success) {
        // Only include leaves with "accepted" status
        const acceptedLeaves = result.leaveRequests
          .filter((leave) => leave.status === 'accepted')
          .map((leave) => ({
            date: leave.startDate.split('T')[0], // Extracting only the date part
            name: leave.reason || 'Leave'
          }));

        setLeaves([...gazettedHolidays, ...acceptedLeaves]); // Combine gazetted holidays with accepted leaves
      } else {
      //  console.error('Failed to fetch mentor leaves');
      }
    } catch (error) {
    //  console.error('Error fetching mentor leaves:', error);
    }
  };
  const fetchAttendanceRecords = async () => {

    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/hr/get_date_range_sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesmanId: id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAttendanceRecords(result.records || []); // Set fetched attendance records
      } else {
       // console.error('Failed to fetch attendance data');
      }
    } catch (error) {
     // console.error('Error fetching attendance data:', error);
    }
  };


  const renderInfoTab = () => (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Name"
            value={mentorDetails?.name || ''}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Email"
            value={mentorDetails?.email || ''}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
       
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Grades
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {mentorDetails?.classes?.length ? (
              mentorDetails.classes.map((grade, index) => (
                <Paper key={index} elevation={1} sx={{ padding: 1.5 }}>
                  {`Class ${grade}`}
                </Paper>
              ))
            ) : (
              <Typography>No grades available</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderLeavesTab = () => (
    <Paper elevation={3} sx={{ padding: 2 }}>
    <Typography variant="h6">Leave Calendar</Typography>
    <Calendar
      localizer={localizer}
      events={leaves.map((leave) => ({
        title: `Leave: ${leave.reason || 'No reason'}`,
        start: new Date(leave.from),
        end: new Date(leave.to),
      }))}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500, marginTop: '16px' }}
    />
  </Paper>
  );

  const renderAttendanceTab = () => (
    <Paper elevation={3} sx={{ padding: 2 }}>
    <Typography variant="h6">Attendance Calendar</Typography>
    <Calendar
      localizer={localizer}
      events={attendanceRecords.map((entry) => ({
        title: entry.status,
        start: new Date(entry.date),
        end: new Date(entry.date),
      }))}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500, marginTop: '16px' }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.title === 'Present' ? 'green' : 'red',
          color: 'white',
        },
      })}
    />
  </Paper>
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      <ProfileHeader>
        <ProfileImage
          src="https://randomuser.me/api/portraits/men/75.jpg"
          alt="Teacher Profile"
        />
        <Typography variant="h4">
          {mentorDetails?.name || 'Teacher Profile'}
        </Typography>
      </ProfileHeader>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Teacher Info" value="info" />
        <Tab label="Leaves" value="leaves" />
        <Tab label="Attendance" value="attendance" />
      </Tabs>

      <ContentContainer>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'leaves' && renderLeavesTab()}
        {activeTab === 'attendance' && renderAttendanceTab()}
      </ContentContainer>

      <Modal
        open={!!modalInfo}
        onClose={() => setModalInfo(null)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalContent>
          <Typography id="modal-title" variant="h6">
            {modalInfo?.name}
          </Typography>
          <Typography id="modal-description">{modalInfo?.date}</Typography>
          <Button onClick={() => setModalInfo(null)}>Close</Button>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MentorProfileData;
