import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box, Button } from '@mui/material';
import DeleteBoardDialog from '../DialogBoxes/DeleteBoardDialog';
import EditBoardDialog from '../DialogBoxes/EditBoardDialog';
import AddSubjectDialog from '../DialogBoxes/AddSubjectDialog';
import SubjectStatusDialog from '../DialogBoxes/SubjectStatusDialog';
import EditSubjectDialog from '../DialogBoxes/EditSubjectDialog';



function SubjectData() {

  const [subjects, setSubjects] = useState([]);
  const [boards,setBoards] = useState([]);
  const [open, setOpen] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '1',
    educationBoardId: '',
  });
  const [selectedSubject, setSelectedSubject] = useState({});
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
   
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleUpdateModalOpen = (subject) => {
    setOpenStatusModal(true);
    setSelectedSubject(subject);

  }

  const handleUpdateCloseModal = () => setOpenStatusModal(false);

  const handleEditModalOpen = (subject) => {
    console.log("selected subject to edit" + JSON.stringify(subject));
    setSelectedSubject(subject);
   setFormData({  name: subject.name,
    class: subject.gradeLevel,
    educationBoardId: subject.educationBoardId, }); // Prepopulate the form
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setSelectedSubject({});
   setFormData({ name: '', country: 'India' });
    setOpenEditModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async() => {
    // Add your submission logic here

    const payload = {
        name: formData.name,
        description: formData.name, // Use subject name as the description
        educationBoardId: formData.educationBoardId, // Ensure it's a number
        gradeLevel: formData.class, // Ensure it's a number
    
      };

    try {
        const response = await fetch('https://sisyabackend.in/rkadmin/add_subject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
    
        const result = await response.json();
    
        if(result.success){
            handleClose();
            //refresh subject data
            fetchSubjectData();
        }else{
            console.log("Add Subject Failed", JSON.stringify(result.error));
        }
      } catch (error) {
       // setLoading(false); // Stop loading
        console.log("Error updating/adding subject:", error);
      //  setErrorMessage('An error occurred. Please try again.');
      }
   
   
  };

  const ChangeSubjectStatus= async() =>{

    const payload = {
        name: selectedSubject.name,
        description: selectedSubject.name, // Use subject name as the description
        educationBoardId: parseInt(selectedSubject.educationBoardId, 10), // Ensure it's a number
        gradeLevel: parseInt(selectedSubject.gradeLevel, 10), // Ensure it's a number
        subjectId: selectedSubject ? selectedSubject.id : undefined,
        isActive: selectedSubject.isActive === true? false:true,
      };
      console.log(JSON.stringify(payload));
    try {
      const updatSubjectResponse = await fetch('https://sisyabackend.in/rkadmin/update_subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify(payload)
      });
      const updateSujectResult = await updatSubjectResponse.json();

      if (updateSujectResult.success) {
        fetchSubjectData();
        handleUpdateCloseModal();
        console.log("Subject Status Changed Successfully");
      } else {
        console.log("Failed to update subject status");
      }
    } catch (error) {
      console.log("Error updating subject:", error);
    }
       
  }

  const handleStatusChange = async()=>{

    console.log("Selected Subject is " + JSON.stringify(selectedSubject));
    ChangeSubjectStatus();
  }


  const handleEditSubmit = async () => {
    const payload = {
        name: formData.name,
        description: formData.name, // Use subject name as the description
        educationBoardId: parseInt(formData.educationBoardId, 10), // Ensure it's a number
        gradeLevel: parseInt(formData.class, 10), // Ensure it's a number
        subjectId: selectedSubject ? selectedSubject.id : undefined,
    
      };
      console.log(JSON.stringify(payload));
    try {
      const updatSubjectResponse = await fetch('https://sisyabackend.in/rkadmin/update_subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify(payload)
      });
      const updateSujectResult = await updatSubjectResponse.json();

      if (updateSujectResult.success) {
        fetchSubjectData();
        handleEditModalClose();
        console.log("Subject Status Changed Successfully");
      } else {
        console.log("Failed to update subject status");
      }
    } catch (error) {
      console.log("Error updating subject:", error);
    }
  };



  useEffect(()=>{
    fetchSubjectData();
    fetchBoardData();
  },[])

  const fetchSubjectData = async () => {
    try {
        const subjectResponse = await fetch('https://sisyabackend.in/student/get_all_subjects_data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        const subjectResult = await subjectResponse.json();
  
        if (subjectResult.success) {
          setSubjects(subjectResult.subjects);
        
          console.log("Subjects fetched successfully");
        } else {
          console.error("Failed to fetch Subjects");
        }
      } catch (error) {
        console.error("Error fetching Subjects:", error);
      }

    }


    const fetchBoardData = async () => {
        try {
          const boardResponse = await fetch('https://sisyabackend.in/student/get_all_boards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
          });
          const boardResult = await boardResponse.json();
    
          if (boardResult.success) {
            setBoards(boardResult.boards);
            console.log("Boards fetched successfully");
          } else {
            console.error("Failed to fetch boards");
          }
        } catch (error) {
          console.error("Error fetching boards:", error);
        }
      };


  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: '16px' }}>
         <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 // Add bottom margin if needed
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Subjects
      </Typography>
     <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{
          textTransform: 'capitalize',
          fontWeight: 'bold',
          borderRadius: 2,
          px: 3,
        }}
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
     
    </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Updated On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>Class {row.gradeLevel}</TableCell>
                <TableCell>
                 
                  {row.createdAt}
                </TableCell>
                <TableCell>{row.updatedAt}</TableCell>
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
                  {row.isActive === true ? "Active" : "Inactive"}
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
        onClick={()=> handleUpdateModalOpen(row)}
        sx={{
          textTransform: 'capitalize',
          fontWeight: 'normal',
          borderRadius: 2,
          boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
          mx: 0.5, // Add horizontal margin between buttons
          px: 0.8, // Padding inside the button for a balanced look
        }}
      >
        {row.isActive === true ? "Inactive":"Active"}
      </Button>
      <SubjectStatusDialog
        open={openStatusModal}
        handleClose={handleUpdateCloseModal}
        handleDelete={handleStatusChange}
        subjectInfo={selectedSubject}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default SubjectData;