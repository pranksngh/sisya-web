import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Box,
  CircularProgress,
  Box as MuiBox
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const EditStudentDialog = ({ open, onClose, onSubmit, boards, handleChange, handleFileChange,formData }) => {

  const [loading, setLoading] = useState(false);  // Loading state

  

 

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Student</DialogTitle>
      <DialogContent>
        {/* If loading, show a spinner, else show the form */}
        {loading ? (
          <MuiBox
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <CircularProgress />
          </MuiBox>
        ) : (
          <>
            {/* Profile Picture Upload */}
            <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  alt="Profile Picture"
                  src={
                    formData.imageData || undefined
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

            {/* Form Fields */}
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
                <MenuItem value={"1"}>Class 1</MenuItem>
                <MenuItem value={"2"}>Class 2</MenuItem>
                <MenuItem value={"3"}>Class 3</MenuItem>
                <MenuItem value={"4"}>Class 4</MenuItem>
                <MenuItem value={"5"}>Class 5</MenuItem>
                <MenuItem value={"6"}>Class 6</MenuItem>
                <MenuItem value={"7"}>Class 7</MenuItem>
                <MenuItem value={"8"}>Class 8</MenuItem>
                <MenuItem value={"9"}>Class 9</MenuItem>
                <MenuItem value={"10"}>Class 10</MenuItem>
                <MenuItem value={"11"}>Class 11</MenuItem>
                <MenuItem value={"12"}>Class 12</MenuItem>
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
              {boards.map((board) => (
                <MenuItem key={board.id} value={board.id}>
                  {board.name}
                </MenuItem>
              ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? 'Submitting...' : 'Update Student'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentDialog;
