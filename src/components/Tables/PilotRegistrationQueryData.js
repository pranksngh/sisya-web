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
  TablePagination,
  TextField,
  Chip,
} from "@mui/material";

const PilotRegistrationQueryData = () => {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/get_all_reg_leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (result.success) {
        const queryLeads = result.leads
          .filter((lead) => lead.status === "query")
          .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn)); // Sort newest first
        console.log(queryLeads);
        setLeads(queryLeads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
  );

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getUTCFullYear();
    const suffix =
      day === 11 || day === 12 || day === 13
        ? "th"
        : ["st", "nd", "rd"][(day % 10) - 1] || "th";
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (isoDateString) => {
    const date = new Date(isoDateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <Paper elevation={0} sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Data from lead form (Query)
      </Typography>

      <TextField
        label="Search by name or phone"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Availblity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeads
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((lead, index) => (
                <TableRow key={index}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.class}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{formatDate(lead.createdOn)}</TableCell>
                  <TableCell>{formatTime(lead.createdOn)}</TableCell>
                  <TableCell>
                    {lead.orderId}
                  </TableCell>
                </TableRow>
              ))}
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No matching results.
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
};

export default PilotRegistrationQueryData;
