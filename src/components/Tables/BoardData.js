import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Box, Button } from '@mui/material';
import AddBoardDialog from '../DialogBoxes/AddBoardDialog';
import { addBoardFunction } from '../../Functions/AddBoard';
import DeleteBoardDialog from '../DialogBoxes/DeleteBoardDialog';
import EditBoardDialog from '../DialogBoxes/EditBoardDialog';



function BoardData() {

  const [boards, setBoards] = useState([]);

  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: 'India', });
  const [selectedBoard, setSelectedBoard] = useState({});
   
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteModalOpen = (board) => {
    setOpenDeleteModal(true);
    setSelectedBoard(board);

  }

  const handleDeleteModalClose = () => setOpenDeleteModal(false);

  const handleEditModalOpen = (board) => {
    setSelectedBoard(board);
    setFormData({ name: board.name, country: board.country }); // Prepopulate the form
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setSelectedBoard({});
    setFormData({ name: '', country: 'India' });
    setOpenEditModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
  

  const handleSubmit = async() => {
    // Add your submission logic here
    console.log('Form Data Submit:', formData);

    try {
        const response = await fetch('https://sisyabackend.in/rkadmin/add_board', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'name':formData.name, 'country':formData.country } ),
        });
    
        const result = await response.json();
    
        if(result.sucess){
            handleClose();
            //refresh board data
            fetchBoardData();
        }else{
            console.log("Add Board Failed", JSON.stringify(result.error));
        }
      } catch (error) {
       // setLoading(false); // Stop loading
        console.log("Error updating/adding board:", error);
      //  setErrorMessage('An error occurred. Please try again.');
      }
   
   
  };

  const ChangeBoardStatus= async() =>{

    const data = {
      educationBoardId: selectedBoard.id,
      name: selectedBoard.name,
      country:selectedBoard.country,
      isActive:!selectedBoard.isActive
    };
    try {
      const updateboardResponse = await fetch('https://sisyabackend.in/rkadmin/update_board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify(data)
      });
      const updateboardResult = await updateboardResponse.json();

      if (updateboardResult.sucess) {
        fetchBoardData();
        handleDeleteModalClose();
        console.log("Boards Deleted successfully");
      } else {
        console.error("Failed to update boards");
      }
    } catch (error) {
      console.error("Error updating boards:", error);
    }
       
  }

  const handleDelete = async()=>{

    console.log("Selected Board is " + JSON.stringify(selectedBoard));
    ChangeBoardStatus();
  }


  const handleEditSubmit = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/update_board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educationBoardId: selectedBoard.id,
          name: formData.name,
          country: formData.country,
        }),
      });
      const result = await response.json();
      if (result.sucess) {
        handleEditModalClose();
        fetchBoardData();
      } else {
        console.error('Edit Board Failed', result.error);
      }
    } catch (error) {
      console.error('Error editing board:', error);
    }
  };



  useEffect(()=>{
    fetchBoardData();
  },[])

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
        Boards
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
        Add Board
      </Button>

      <AddBoardDialog
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
      />
     
    </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Board Name</TableCell>
    
              <TableCell>Created On</TableCell>
              <TableCell>Updated On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{row.name}</TableCell>
            
                <TableCell>
                 
                  {formatDate(row.createdAt)}
                </TableCell>
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
        onClick={()=> handleDeleteModalOpen(row)}
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
      <DeleteBoardDialog
        open={openDeleteModal}
        handleClose={handleDeleteModalClose}
        handleDelete={handleDelete}
        boardInfo={selectedBoard}
      />
      <EditBoardDialog
        open={openEditModal}
        handleClose={handleEditModalClose}
        handleEdit={handleEditSubmit}
        formData={formData}
        handleChange={handleChange}
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

export default BoardData;
