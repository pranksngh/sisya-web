import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Button, Chip } from '@mui/material';
import { fetchDoubtList } from '../../Functions/Doubts';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
ChartJS.register(ArcElement, Tooltip, Legend);

function DoubtAnalysis() {
  const [doubts, setDoubts] = useState([]);
  const [mentorNames, setMentorNames] = useState({});
  const [studentDetails, setStudentDetails] = useState({});

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchMentorNames = async (doubts) => {
    const mentorNamesMap = {};
    const mentorIds = [...new Set(doubts.map((doubt) => doubt.mentorId))];

    for (const mentorId of mentorIds) {
      try {
        const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_by_id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentorId }),
        });
        const result = await response.json();
        if (result.success && result.mentor) {
          mentorNamesMap[mentorId] = result.mentor.name;
        }
      } catch (error) {
        console.error(`Error fetching mentor ${mentorId}:`, error);
      }
    }
    setMentorNames(mentorNamesMap);
  };

  const fetchStudentDetails = async (doubts) => {
    const studentDetailsMap = {};
    const userIds = [...new Set(doubts.map((doubt) => doubt.userId))];

    for (const userId of userIds) {
      try {
        const response = await fetch('https://sisyabackend.in/rkadmin/get_user_by_id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });
        const result = await response.json();
        if (result) {
          studentDetailsMap[userId] = {
            name: result.name,
            class: result.grade || 'N/A',
          };
        }
      } catch (error) {
        console.error(`Error fetching student ${userId}:`, error);
      }
    }
    setStudentDetails(studentDetailsMap);
  };

  const fetchDoubts = async () => {
    try {
      const result = await fetchDoubtList();
      if (result.success) {
        setDoubts(result.doubts);
        fetchMentorNames(result.doubts);
        fetchStudentDetails(result.doubts);
      } else {
        console.log('Doubt List Issue', JSON.stringify(result));
      }
    } catch (error) {
      console.log('Doubt List Error', JSON.stringify(error));
    }
  };

  const getStatusCount = (doubts) => {
    let created = 0;
    let resolved = 0;

    doubts.forEach((doubt) => {
      if (doubt.status === 0) created += 1;
      else if (doubt.status === 2) resolved += 1;
    });

    return { created, resolved };
  };

  const { created, resolved } = getStatusCount(doubts);

  const chartData = {
    labels: ['Created', 'Resolved'],
    datasets: [
      {
        data: [created, resolved],
        backgroundColor: ['#FF9F43', '#28A745'], // Orange for Created, Green for Resolved
        hoverBackgroundColor: ['#FF7A29', '#218838'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Paper elevation={0} sx={{ margin: 'auto', padding: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 , textAlign:'center'}}>
        Doubt Status Analysis
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Pie data={chartData} options={chartOptions} />
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Chip label="Created" color="warning" sx={{ margin: 1 }} />
          <Chip label="Resolved" color="success" sx={{ margin: 1 }} />
        </Box>
      </Box>
     
    </Paper>
  );
}

export default DoubtAnalysis;
