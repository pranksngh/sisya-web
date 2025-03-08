import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const TeacherAttendanceDialog = ({ open, onClose, attendanceData }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    const diff = new Date(checkOut) - new Date(checkIn);
    return (diff / (1000 * 60 * 60)).toFixed(1) + " hrs";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Attendance Records</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="center">Check In</TableCell>
                {/* <TableCell align="center">Check Out</TableCell> */}
                {/* <TableCell align="center">Total Hours</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.length > 0 ? (
                attendanceData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(record.loginTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      {formatTime(record.loginTime)}
                    </TableCell>
                    {/* <TableCell align="center">
                      {formatTime(record.logoutTime)}
                    </TableCell>
                    <TableCell align="center">
                      {calculateHours(record.checkIn, record.checkOut)}
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No attendance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherAttendanceDialog;
