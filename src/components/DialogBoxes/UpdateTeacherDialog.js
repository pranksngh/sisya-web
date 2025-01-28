import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

const UpdateTeacherDialog = ({ open, handleClose, handleDelete, teacherInfo }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>
      {teacherInfo.isActive ? "Deactivate":"Activate"} Teacher
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem', color: 'text.secondary' }}>
          Are you sure you want to {teacherInfo.isActive ? "Deactivate":"Activate"} the teacher <strong>{teacherInfo.name}</strong>? This action cannot
          be undone.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="secondary"
          sx={{
            textTransform: 'capitalize',
            fontWeight: 'bold',
            px: 3,
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          sx={{
            textTransform: 'capitalize',
            fontWeight: 'bold',
            px: 3,
            borderRadius: 2,
          }}
        >
          {teacherInfo.isActive ? "Deactivate":"Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTeacherDialog;
