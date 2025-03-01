import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { toast, ToastContainer } from "react-toastify";
const AddStudent = () => {
  const [formData, setFormData] = useState({
    type: 'student',
    name: '',
    email: '',
    phone: '',
    grade: '',
    educationBoardId: '', // Add educationBoardId to form data as a number
    imageData: '' // Key for the image will be imageData
  });
  const [boardList, setBoardList] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

useEffect(()=>{
  fetchBoardList();
},[]);
  const fetchBoardList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_all_boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const result = await response.json();

      if (result.success) {
        setBoardList(result.boards); // Store the fetched boards in state
        console.log("Boards fetched successfully");
      } else {
        console.error("Failed to fetch boards");
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/create_student",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      console.log("Response:", result);

      if (response.ok) {
      //  alert("Student created successfully!");
      toast.success("Student created successfully!");
      setFormData({ name: "", email: "", phone: "", grade: "",educationalBoardId:'',imageData:null });
      } else {
        alert("Error creating student: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
    <Paper
      elevation={3}
      sx={{
        maxWidth: 500,
        margin: "auto",
        mt: 5,
        p: 4,
        borderRadius: 3,
      }}
    >
      {/* Header */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 3,
        }}
      >
        Add Student
      </Typography>

      {/* Profile Picture Upload */}
      <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            alt="Profile Picture"
            src={
              formData.profilePicture
                ? URL.createObjectURL(formData.profilePicture)
                : undefined
            }
            sx={{
              width: 100,
              height: 100,
            }}
          />
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <AddPhotoAlternateIcon color="primary" />
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleFileChange}
            />
          </IconButton>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Upload Profile Picture
        </Typography>
      </Stack>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />

        {/* Class Dropdown */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="class-label">Class</InputLabel>
          <Select
            labelId="class-label"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            label="Class"
            required
          >
            <MenuItem value="1">Class 1</MenuItem>
            <MenuItem value="2">Class 2</MenuItem>
            <MenuItem value="3">Class 3</MenuItem>
            <MenuItem value="4">Class 4</MenuItem>
            <MenuItem value="5">Class 5</MenuItem>
            <MenuItem value="6">Class 6</MenuItem>
            <MenuItem value="7">Class 7</MenuItem>
            <MenuItem value="8">Class 8</MenuItem>
            <MenuItem value="9">Class 9</MenuItem>
            <MenuItem value="10">Class 10</MenuItem>
            <MenuItem value="11">Class 11</MenuItem>
            <MenuItem value="12">Class 12</MenuItem>
          </Select>
        </FormControl>

        {/* Educational Board Dropdown */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="board-label">Educational Board</InputLabel>
          <Select
            labelId="board-label"
            name="educationBoardId"
            value={formData.educationBoardId}
            onChange={handleChange}
            label="Educational Board"
            required
          >
            {boardList.map(board => (
            <MenuItem value={board.id}>{board.name}</MenuItem>
            ))}
            
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          type="submit"
        >
          Add Student
        </Button>
      </Box>
    </Paper>
    <ToastContainer/>
    </>
  );
};

export default AddStudent;
