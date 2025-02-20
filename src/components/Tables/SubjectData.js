import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box, Button, TablePagination, TextField } from '@mui/material';
import DeleteBoardDialog from '../DialogBoxes/DeleteBoardDialog';
import EditBoardDialog from '../DialogBoxes/EditBoardDialog';
import AddSubjectDialog from '../DialogBoxes/AddSubjectDialog';
import SubjectStatusDialog from '../DialogBoxes/SubjectStatusDialog';
import EditSubjectDialog from '../DialogBoxes/EditSubjectDialog';

function SubjectData() {
  const [subjects, setSubjects] = useState([]);
  const [boards, setBoards] = useState([]);
  const [open, setOpen] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '1',
    educationBoardId: '',
  });
  const [selectedSubject, setSelectedSubject] = useState({});
  const [page, setPage] = useState(0); // Track the current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Records per page
  const [searchTerm, setSearchTerm] = useState(''); // Search term

  const classes = [
    { value: 1, label: 'Class 1' },
    { value: 2, label: 'Class 2' },
    { value: 3, label: 'Class 3' },
    { value: 4, label: 'Class 4' },
    { value: 5, label: 'Class 5' },
    { value: 6, label: 'Class 6' },
    { value: 7, label: 'Class 7' },
    { value: 8, label: 'Class 8' },
    { value: 9, label: 'Class 9' },
    { value: 10, label: 'Class 10' },
    { value: 11, label: 'Class 11' },
    { value: 12, label: 'Class 12' }
  ];

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
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleUpdateModalOpen = (subject) => {
    setOpenStatusModal(true);
    setSelectedSubject(subject);
  };

  const handleUpdateCloseModal = () => setOpenStatusModal(false);

  const handleEditModalOpen = (subject) => {
    setSelectedSubject(subject);
    setFormData({ name: subject.name, class: subject.gradeLevel, educationBoardId: subject.educationBoardId });
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setSelectedSubject({});
    setFormData({ name: '', class: '1', educationBoardId: '' });
    setOpenEditModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.name,
      educationBoardId: formData.educationBoardId,
      gradeLevel: formData.class,
    };

    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/add_subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        handleClose();
        fetchSubjectData();
      } else {
      //  console.log("Add Subject Failed", JSON.stringify(result.error));
      }
    } catch (error) {
     // console.log("Error adding subject:", error);
    }
  };

  const ChangeSubjectStatus = async () => {
    const payload = {
      name: selectedSubject.name,
      description: selectedSubject.name,
      educationBoardId: parseInt(selectedSubject.educationBoardId, 10),
      gradeLevel: parseInt(selectedSubject.gradeLevel, 10),
      subjectId: selectedSubject ? selectedSubject.id : undefined,
      isActive: !selectedSubject.isActive,
    };

    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/update_subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        fetchSubjectData();
        handleUpdateCloseModal();
     //   console.log("Subject Status Changed Successfully");
      } else {
      //  console.log("Failed to update subject status");
      }
    } catch (error) {
    //  console.log("Error updating subject:", error);
    }
  };

  const handleStatusChange = () => {
    ChangeSubjectStatus();
  };

  const handleEditSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.name,
      educationBoardId: parseInt(formData.educationBoardId, 10),
      gradeLevel: parseInt(formData.class, 10),
      subjectId: selectedSubject ? selectedSubject.id : undefined,
    };

    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/update_subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        fetchSubjectData();
        handleEditModalClose();
     //   console.log("Subject Updated Successfully");
      } else {
      //  console.log("Failed to update subject");
      }
    } catch (error) {
    //  console.log("Error updating subject:", error);
    }
  };

  useEffect(() => {
    fetchSubjectData();
    fetchBoardData();
  }, []);

  const fetchSubjectData = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_all_subjects_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setSubjects(result.subjects);
      } else {
       // console.error("Failed to fetch subjects");
      }
    } catch (error) {
    //  console.error("Error fetching subjects:", error);
    }
  };

  const fetchBoardData = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_all_boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setBoards(result.boards);
      } else {
       // console.error("Failed to fetch boards");
      }
    } catch (error) {
     // console.error("Error fetching boards:", error);
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

  const filteredSubjects = subjects.filter((subject) => {
    const board = boards.find((board) => board.id === subject.educationBoardId);
    const boardName = board ? board.name : '';
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchLower) ||
      subject.gradeLevel.toString().includes(searchLower) ||
      boardName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Subjects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{ textTransform: 'capitalize', fontWeight: 'bold', borderRadius: 2, px: 3 }}
        >
          Add Subject
        </Button>
        <AddSubjectDialog
          open={open}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
          classes={classes}
          boards={boards}
        />
        <EditSubjectDialog
          openEdit={openEditModal}
          handleEditClose={handleEditModalClose}
          handleEditSubmit={handleEditSubmit}
          formData={formData}
          handleChange={handleChange}
          classes={classes}
          boards={boards}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search"
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
              <TableCell>Subject Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Board</TableCell>
              <TableCell>Updated On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const board = boards.find((board) => board.id === row.educationBoardId);
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>Class {row.gradeLevel}</TableCell>
                    <TableCell>{board.name}</TableCell>
                    <TableCell>{formatDate(row.updatedAt)}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: row.isActive === true ? 'green' : 'red',
                          mr: 1,
                        }}
                      />
                      {row.isActive === true ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleEditModalOpen(row)}
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 'bold',
                          borderRadius: 2,
                          borderWidth: 2,
                          boxShadow: 'none',
                          mx: 0,
                          px: 0,
                          '&:hover': {
                            borderColor: 'secondary.main',
                            backgroundColor: 'rgba(255, 0, 0, 0.04)',
                          },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateModalOpen(row)}
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 'normal',
                          borderRadius: 2,
                          boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                          mx: 0.5,
                          px: 0.8,
                        }}
                      >
                        {row.isActive === true ? 'Inactive' : 'Active'}
                      </Button>
                      <SubjectStatusDialog
                        open={openStatusModal}
                        handleClose={handleUpdateCloseModal}
                        handleDelete={handleStatusChange}
                        subjectInfo={selectedSubject}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredSubjects.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default SubjectData;
