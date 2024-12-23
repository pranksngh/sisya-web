import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

const AddLeaveRequestDialog = ({ open, handleClose, handleSubmit, formData, handleChange }) => {

  // Ensure formData has the required fields
  const { startDate, endDate, reason } = formData;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Request Leave</DialogTitle>
      <DialogContent>
        <TextField
          name="startDate"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />
        <TextField
          name="endDate"
          label="End Date"
          type="date"
          value={endDate}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />
        <TextField
          name="reason"
          label="Reason"
          value={reason}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLeaveRequestDialog;
