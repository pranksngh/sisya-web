import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box, Button } from '@mui/material';
import AddBoardDialog from '../DialogBoxes/AddBoardDialog';
import { addBoardFunction } from '../../Functions/AddBoard';
import DeleteBoardDialog from '../DialogBoxes/DeleteBoardDialog';
import EditBoardDialog from '../DialogBoxes/EditBoardDialog';
import AddStudentDialog from '../DialogBoxes/AddStudentDialog';



function StudentData() {

  const [boards, setBoards] = useState([]);
  const [students, setStudentList] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'student',
    name: '',
    email: '',
    phone: '',
    grade: '',
    educationBoardId: '', // Add educationBoardId to form data as a number
    imageData: '' // Key for the image will be imageData
  });
  const [selectedBoard, setSelectedBoard] = useState({});
   
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
 

  

 

 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async()=>{
    if (!formData.name || !formData.email || !formData.phone || !formData.grade || !formData.educationBoardId) {
      alert('Please fill in all required fields.');
      return;
    }
    // Show loading spinner when submission starts
    if (formData.imageData) {
      formData.imageData = formData.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    }
    // Simulate API request or any async task
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/create_student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
      if (result.success) {
        setFormData({
          type: 'student',
          name: '',
          email: '',
          phone: '',
          grade: '',
          educationBoardId: '',
          imageData: ''
        });
       
        fetchStudentData(1, 100); // Refresh the student list
        handleClose();

        
      
      } else {
        console.log('Failed to add student', result.error);
      //  handleClose();
      
      }
    } catch (error) {
      console.log("Error adding student:", error);
    //  handleClose();
     
    }
  }

 

  

 


  useEffect(()=>{
    fetchStudentData();
    fetchBoardData();
  },[]);

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

  const fetchStudentData = async (page, amount) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_recent_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 1,
          amount: 100
        })
      });
      const result = await response.json();

      if (result.success && result.studentList.length > 0) {
        console.log("Student list: ", result.studentList);
        setStudentList(result.studentList);
      } else {
        setStudentList([]);
       
      }
    } catch (error) {
      console.log("Error fetching students:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
    setFormData({ ...formData, imageData: reader.result });
      }
      reader.readAsDataURL(file);
    }
  };


  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: '10px' }}>
         <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 // Add bottom margin if needed
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Students
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
        Add Student
      </Button>
      <AddStudentDialog
       open={open}
       onClose={handleClose}
       onSubmit={handleSubmit}
       boards={boards}
       handleChange={handleChange}
       handleFileChange={handleFileChange}
       formData={formData}
      />
    </Box>
      <TableContainer>
        <Table sx={{
      borderCollapse: 'collapse', // Ensure no space between table cells
      fontSize: '0.8rem', // Reduce font size for the entire table
      '& th, & td': {
        padding: '4px 8px', // Reduce padding in all cells
        textAlign: 'center', // Center-align all text
        verticalAlign: 'middle', // Vertically center-align all text
      },
      '& th': {
        fontWeight: 'bold', // Keep header bold for readability
      },
      textAlign:'center',
      justifyContent:'center',
      alignItems:'center',
      alignSelf:'center'
    }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
    
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Board</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell> {row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>{row.board}</TableCell>
                <TableCell>{row.createdOn}</TableCell>
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
        onClick={() => null}
        sx={{
          textTransform: 'capitalize',
          fontWeight: 'bold',
          borderRadius: 2,
          borderWidth: 2,
          boxShadow: 'none',
          minWidth: '60px',
          
          mx: 1,
          px: 1,
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
        onClick={()=> null}
        sx={{
          textTransform: 'capitalize',
          fontWeight: 'normal',
          borderRadius: 2,
          boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
          mx: 1, // Add horizontal margin between buttons
          px: 1, // Padding inside the button for a balanced look
          minWidth: '40px',
          marginY: '10px'
        }}
      >
       View
      </Button>
    
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default StudentData;
