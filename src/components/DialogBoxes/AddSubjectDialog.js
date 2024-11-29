import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

const AddSubjectDialog = ({
  open,
  handleClose,
  handleSubmit,
  formData,
  handleChange,
  classes, // Array of classes [{ value: 1, label: 'Class 1' }, ...]
  boards, // Array of educational boards [{ id: 1, name: 'CBSE' }, ...]
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
        Add a New Subject
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Enter details for the new subject:
          </Typography>

          {/* Class Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Class</InputLabel>
            <Select
              name="class"
              value={formData.class || ''}
              onChange={handleChange}
              label="Class"
            >
              {classes.map((cls) => (
                <MenuItem key={cls.value} value={cls.value}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Educational Board Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Educational Board</InputLabel>
            <Select
              name="educationBoardId"
              value={formData.educationBoardId || ''}
              onChange={handleChange}
              label="Educational Board"
            >
              {boards.map((board) => (
                <MenuItem key={board.id} value={board.id}>
                  {board.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subject Name */}
          <TextField
            fullWidth
            label="Subject Name"
            name="name"
            value={formData.subjectName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="secondary"
          sx={{
            textTransform: 'capitalize',
            fontWeight: 'bold',
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'capitalize',
            fontWeight: 'bold',
            px: 3,
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubjectDialog;
