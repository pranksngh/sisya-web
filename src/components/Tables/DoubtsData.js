import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

const DoubtsData = () => {
  const [doubtList, setDoubtList] = useState([]);
  const [mentorNames, setMentorNames] = useState({});
  const [studentDetails, setStudentDetails] = useState({});
  const [totalDoubts, setTotalDoubts] = useState(0);
  const [resolvedDoubts, setResolvedDoubts] = useState(0);
  const [ongoingDoubts, setOngoingDoubts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoubtList();
  }, []);

  const fetchDoubtList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/all_doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      if (result.success) {
        const doubts = result.doubts;
        setDoubtList(doubts);
        setTotalDoubts(doubts.length);
        setResolvedDoubts(doubts.filter((doubt) => doubt.status === 2).length);
        setOngoingDoubts(doubts.filter((doubt) => doubt.status === 1).length);

        fetchMentorNames(doubts);
        fetchStudentDetails(doubts);
      } else {
        setDoubtList([]);
      }
    } catch (error) {
      console.error('Error fetching doubts:', error);
    }
  };

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

  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return { text: 'Created', color: 'warning' };
      case 1:
        return { text: 'Ongoing', color: 'info' };
      case 2:
        return { text: 'Resolved', color: 'success' };
      default:
        return { text: 'Unknown', color: 'error' };
    }
  };

  const filteredDoubtList = doubtList.filter((item) => {
    const mentorName = mentorNames[item.mentorId]?.toLowerCase() || '';
    const studentName = studentDetails[item.userId]?.name?.toLowerCase() || '';
    return mentorName.includes(searchTerm.toLowerCase()) || studentName.includes(searchTerm.toLowerCase());
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Doubts Dashboard
      </Typography>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Doubts</Typography>
              <Typography variant="h4">{totalDoubts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Resolved Doubts</Typography>
              <Typography variant="h4">{resolvedDoubts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Ongoing Doubts</Typography>
              <Typography variant="h4">{ongoingDoubts}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box mb={2}>
        <TextField
          label="Search by student or mentor name"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Mentor Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created On</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDoubtList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => {
                const mentorName = mentorNames[item.mentorId] || 'Loading...';
                const studentName = studentDetails[item.userId]?.name || 'Loading...';
                const studentClass = studentDetails[item.userId]?.class || 'N/A';
                const { text: statusText, color: statusColor } = renderStatus(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{studentName}</TableCell>
                    <TableCell>{studentClass}</TableCell>
                    <TableCell>{item.topic}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{mentorName}</TableCell>
                    <TableCell>
                      <Chip label={statusText} color={statusColor} />
                    </TableCell>
                    <TableCell>{new Date(item.createdOn).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDoubtList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default DoubtsData;
