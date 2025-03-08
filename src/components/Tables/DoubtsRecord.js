import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
} from "@mui/material";
import { fetchDoubtList } from "../../Functions/Doubts";

function DoubtsRecord() {
  const [doubts, setDoubts] = useState([]);
  const [visibleDoubts, setVisibleDoubts] = useState(15);
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
        const response = await fetch(
          "https://sisyabackend.in/rkadmin/get_mentor_by_id",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mentorId }),
          }
        );
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
        const response = await fetch(
          "https://sisyabackend.in/rkadmin/get_user_by_id",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId }),
          }
        );
        const result = await response.json();
        if (result) {
          studentDetailsMap[userId] = {
            name: result.name,
            class: result.grade || "N/A",
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
      console.log(result);
      if (result.success) {
        const sortedDoubts = result.doubts.sort(
          (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
        );
        setDoubts(sortedDoubts);
        fetchMentorNames(result.doubts);
        fetchStudentDetails(result.doubts);
      } else {
        console.log("Doubt List Issue", JSON.stringify(result));
      }
    } catch (error) {
      console.log("Doubt List Error", JSON.stringify(error));
    }
  };

  const handleShowMore = () => {
    setVisibleDoubts((prev) => prev + 8);
  };

  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return { text: "Created", color: "warning" };
      case 1:
        return { text: "Ongoing", color: "info" };
      case 2:
        return { text: "Resolved", color: "success" };
      default:
        return { text: "Unknown", color: "error" };
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        margin: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
        Doubts Records
      </Typography>
      <TableContainer
        sx={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflowY: "auto",
          height: "510px",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
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
            {doubts.slice(0, visibleDoubts).map((item) => {
              const mentorName = mentorNames[item.mentorId] || "Loading...";
              const studentName =
                studentDetails[item.userId]?.name || "Loading...";
              const studentClass = studentDetails[item.userId]?.class || "N/A";
              const { text: statusText, color: statusColor } = renderStatus(
                item.status
              );
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
                  <TableCell>
                    {new Date(item.createdOn).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {visibleDoubts < doubts.length && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShowMore}
            sx={{ textTransform: "none" }}
          >
            Show More
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default DoubtsRecord;
