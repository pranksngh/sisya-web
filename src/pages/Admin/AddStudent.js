import React, { useState } from 'react';
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
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    class: '',
    board: '',
    profilePicture: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  //  console.log('Form Data Submitted:', formData);
    // Add API call or validation logic here
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 500,
        margin: 'auto',
        mt: 5,
        p: 4,
        borderRadius: 3,
      }}
    >
      {/* Header */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 3,
        }}
      >
        Add Student
      </Typography>

      {/* Profile Picture Upload */}
      <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
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
              position: 'absolute',
              bottom: 0,
              left: 0,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <AddPhotoAlternateIcon color="primary" />
            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
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
            name="class"
            value={formData.class}
            onChange={handleChange}
            label="Class"
            required
          >
            <MenuItem value="10th">10th</MenuItem>
            <MenuItem value="11th">11th</MenuItem>
            <MenuItem value="12th">12th</MenuItem>
          </Select>
        </FormControl>

        {/* Educational Board Dropdown */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="board-label">Educational Board</InputLabel>
          <Select
            labelId="board-label"
            name="board"
            value={formData.board}
            onChange={handleChange}
            label="Educational Board"
            required
          >
            <MenuItem value="CBSE">CBSE</MenuItem>
            <MenuItem value="ICSE">ICSE</MenuItem>
            <MenuItem value="State Board">State Board</MenuItem>
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
  );
};

export default AddStudent;
