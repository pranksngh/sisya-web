import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box, Button, TablePagination, TextField } from '@mui/material';
import DeleteBoardDialog from '../DialogBoxes/DeleteBoardDialog';
import EditBoardDialog from '../DialogBoxes/EditBoardDialog';
import AddSubjectDialog from '../DialogBoxes/AddSubjectDialog';
import SubjectStatusDialog from '../DialogBoxes/SubjectStatusDialog';
import EditSubjectDialog from '../DialogBoxes/EditSubjectDialog';

function PilotRegistrationData() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0); // Track the current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Records per page
  const [searchTerm, setSearchTerm] = useState(''); // Search term

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
      const response = await fetch('https://sisyabackend.in/rkadmin/get_all_reg_leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      result.leads.sort((a, b) => {
        return new Date(b.createdOn) - new Date(a.createdOn);
      });
      if (result.success) {
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
    const month = date.toLocaleString('en-US', { month: 'short' }); // Short month name (e.g., "Jan")
    const year = date.getUTCFullYear();

    // Determine the ordinal suffix for the day
    const suffix =
      day === 11 || day === 12 || day === 13
        ? "th"
        : ["st", "nd", "rd"][(day % 10) - 1] || "th";

    return `${day}${suffix} ${month} ${year}`;
  }

  // Filter leads based on search term (name or phone)
  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      lead.phone.includes(searchTerm)
    );
  });

  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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