import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getUser } from '../../Functions/Login';

const LeaveCalendar = () => {
  const user = getUser();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

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
      } else {
     //   console.error('Failed to fetch leaves');
      }
    } catch (error) {
     // console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const localizer = momentLocalizer(moment);

  // Convert leaveRequests to events for the calendar
  const events = leaveRequests.map((leave) => ({
    id: leave.id,
    title: leave.reason || 'Leave',
    start: new Date(leave.startDate),
    end: new Date(leave.endDate),
    allDay: true,
  }));

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Leave Calendar
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={['month', 'week', 'day']}
            defaultView="month"
          />
        )}
      </Paper>
    </Box>
  );
};

export default LeaveCalendar;
