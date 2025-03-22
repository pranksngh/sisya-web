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
  TablePagination,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import DeleteBoardDialog from "../DialogBoxes/DeleteBoardDialog";
import EditBoardDialog from "../DialogBoxes/EditBoardDialog";
import AddSubjectDialog from "../DialogBoxes/AddSubjectDialog";
import SubjectStatusDialog from "../DialogBoxes/SubjectStatusDialog";
import EditSubjectDialog from "../DialogBoxes/EditSubjectDialog";

function PilotRegistrationData() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0); // Track the current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Records per page
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [dedupedLeads, setDedupedLeads] = useState([]);

  const removeDuplicates = (data) => {
    const uniqueEntries = data.reduce((acc, current) => {
      const key = `${current.phone}_${current.name}`; 
      if (
        !acc[key] ||
        new Date(current.createdOn) > new Date(acc[key].createdOn)
      ) {
        acc[key] = current;
      }
      return acc;
    }, {});

    return Object.values(uniqueEntries);
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };

  useEffect(() => {
    fetchSubjectData();
  }, []);

  const fetchSubjectData = async () => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/get_all_reg_leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      console.log(result);
      result.leads.sort((a, b) => {
        return new Date(b.createdOn) - new Date(a.createdOn);
      });
      if (result.success) {
        const uniqueLeads = removeDuplicates(result.leads);
        setDedupedLeads(uniqueLeads);
        setLeads(result.leads);
      } else {
        console.error("Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  function formatDate(isoDateString) {
    const date = new Date(isoDateString);

    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", { month: "short" }); // Short month name (e.g., "Jan")
    const year = date.getUTCFullYear();

    // Determine the ordinal suffix for the day
    const suffix =
      day === 11 || day === 12 || day === 13
        ? "th"
        : ["st", "nd", "rd"][(day % 10) - 1] || "th";

    return `${day}${suffix} ${month} ${year}`;
  }

  const formatTime = (isoDateString) => {
    const date = new Date(isoDateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Filter leads based on search term (name or phone)
 const filteredLeads = dedupedLeads.filter((lead) => {
   const searchLower = searchTerm.toLowerCase();
   return (
     lead.name.toLowerCase().includes(searchLower) ||
     lead.phone.includes(searchTerm)
   );
 });

  const handleWhatsAppMessage = (phone) => {
    const message = encodeURIComponent(
      "Dear Parents,\n\nYou have tried to make payment for enrollment of Brain boosting sisya class program for your child. Click here to complete transaction link"
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const statusColors = {
    Success: "success",
    Failed: "error",
    Pending: "warning",
    Initiated: "info",
  };

  function sendSuccessMessage(courseName, phoneNumber) {
    let templateId;
    if (
      courseName === "Robotic + Coding + Maths + Science 4 Day Class by IITians"
    ) {
      templateId = "67c965c7d6fc056ce10a8363";
    } else if (
      courseName === "SISYA Rank Booster - 10X Smarter Learning by IITians"
    ) {
      templateId = "67c964f7d6fc054f966d7cf2";
    } else if (courseName === "SISYA VEDIC MATHS"){
      templateId = "67dec4a5d6fc0517be3a0333";
    } else if(courseName === "Best Summer Camp For Maths + Chemistry + Physics + 2 Free STEM Class"){
      templateId = "67dec862d6fc0549c91514e2";
    } else {
      console.error("Unknown course type");
      return;
    }
    try {
      fetch("https://sisyabackend.in/student/send_msg_x", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          template: templateId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Success handling if needed
          }
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    } catch (error) {
      console.error("Error in sendSuccessMessage:", error);
    }
  }

  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: "16px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Pilot Course Registration Info
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search by name or phone number"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Send Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeads
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.class}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{formatDate(row.createdOn)}</TableCell>
                    <TableCell>{formatTime(row.createdOn)}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={statusColors[row.status] || "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="success"
                        onClick={() => handleWhatsAppMessage(row.phone)}
                        aria-label="Send WhatsApp message"
                      >
                        <WhatsAppIcon />
                      </IconButton>

                      <IconButton
                        color="primary"
                        onClick={() => sendSuccessMessage(row.name, row.phone)}
                        aria-label="Send message"
                        sx={{
                          backgroundColor: "#1976d210",
                          "&:hover": {
                            backgroundColor: "#1976d220",
                          },
                        }}
                      >
                        <MessageOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredLeads.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default PilotRegistrationData;
