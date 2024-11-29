import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

const SubjectStatusDialog = ({ open, handleClose, handleDelete, subjectInfo }) => {
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
      {subjectInfo.isActive ? "Deactivate":"Activate"} Subject
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem', color: 'text.secondary' }}>
          Are you sure you want to {subjectInfo.isActive ? "Deactivate":"Activate"} the subject <strong>{subjectInfo.name}</strong>? This action cannot
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
          {subjectInfo.isActive ? "Deactivate":"Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubjectStatusDialog;
