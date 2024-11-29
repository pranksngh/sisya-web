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
} from '@mui/material';

const AddBoardDialog = ({ open, handleClose, handleSubmit, formData, handleChange }) => {
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
        Create a New Board
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Enter details for the new board:
          </Typography>
          <TextField
            fullWidth
            label="Board Name"
            name="name"
            value={formData.name}
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

export default AddBoardDialog;
