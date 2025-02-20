import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  CircularProgress,
  Box,
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getUser } from '../../Functions/Login';
import { fetchCoursesList } from '../../Functions/courses';

const TimeTable = () => {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const result = await fetchCoursesList();

      if (result.success && result.bigCourses) {
        extractSessions(result.bigCourses);
      } else {
        setSessions([]);
      }
    } catch (error) {
     // console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorNames = async (mentorId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_by_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId }),
      });
      const result = await response.json();
      if (result.success && result.mentor) {
     //   console.log('Mentor detail:', JSON.stringify(result));
        return result.mentor.name;
      }
      return 'Unknown Mentor';
    } catch (error) {
    //  console.error('Error fetching mentor:', error);
      return 'Unknown Mentor';
    }
  };

  const extractSessions = async (courses) => {
    const allSessions = await Promise.all(
      courses.flatMap((course) =>
        course.session.map(async (session) => {
          const mentorName = await fetchMentorNames(session.mentorId);
          return {
            id: session.id,
            title: `${session.detail} - ${mentorName}`,
            start: new Date(session.startTime),
            end: new Date(session.endTime),
            mentorName,
          };
        })
      )
    );

   // console.log('All sessions:', allSessions);
    setSessions(allSessions);
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    // Generate a random color or choose from a predefined palette
    const generateColor = () => {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      return randomColor;
    };
  
    const backgroundColor = generateColor(); // Generate a unique color for each event
  
    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '4px',
        padding: '4px',
        display: 'block',
      },
    };
  };
  
  

  const localizer = momentLocalizer(moment);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Daily TimeTable
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={sessions}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={['day']}
            defaultView="day"
            step={15} // 30-minute intervals
            timeslots={2} // Show 2 timeslots per interval
            min={new Date(2023, 1, 1, 0, 0)} // Start at midnight
            max={new Date(2023, 1, 1, 23, 59)} // End at midnight
            eventPropGetter={eventStyleGetter} // Apply custom styles
          />
        )}
      </Paper>
    </Box>
  );
};

export default TimeTable;
