import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const PushNotificationData = () => {
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudentList(1, 10000);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
  };

  const fetchStudentList = async (page, amount) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_recent_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: (page - 1) * amount + 1,
          amount: amount,
        }),
      });
      const result = await response.json();

      if (result.success && result.studentList.length > 0) {
        setStudentList(result.studentList);
      } else {
        setStudentList([]);
      }
    } catch (error) {
   //   console.error('Error fetching students:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tokens = [];
    let base64Image = '';

    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        base64Image = reader.result.split(',')[1];
        await sendNotification(tokens, base64Image);
      };
    } else {
      await sendNotification(tokens, base64Image);
    }
  };

  const sendNotification = async (tokens, base64Image) => {
    if (selectedClass) {
      // Filter students by the selected class
      const studentsInClass = studentList.filter(
        (student) => student.grade === selectedClass
      );
      tokens.push(...studentsInClass.map((student) => student.deviceId).filter(Boolean));
    } else if (selectedStudents.length > 0) {
      // Send to specific selected students
      tokens.push(
        ...selectedStudents
          .map((student) =>
            studentList.find((s) => s.phone === student)?.deviceId
          )
          .filter(Boolean)
      );
    }

    const data = {
      notification: {
        title: title,
        body: content,
      },
      data: {
        type: 'general',
      },
      tokens: tokens,
    };

    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/send_notif2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
    //  console.error('Error sending notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const classes = Array.from({ length: 12 }, (_, index) => ({
    label: `Class ${index + 1}`,
    value: `${index + 1}`,
  }));

  return (
    <Box p={3} maxWidth="600px" mx="auto">
      <Typography variant="h4" gutterBottom>
        Send Notification
      </Typography>
      <form onSubmit={handleSend}>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Push Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Input push title (max 100 characters)"
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Push Content"
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Input push content (max 256 characters)"
          />
        </Box>
        {/* <Box mb={2}>
          <Typography variant="body1" gutterBottom>
            Upload Image
          </Typography>
          {!imageFile ? (
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </Button>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>{imageFile.name}</Typography>
              <IconButton color="error" onClick={handleRemoveImage}>
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box> */}
        <Box mb={2}>
          <Select
            fullWidth
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select Class</em>
            </MenuItem>
            {classes.map((classOption) => (
              <MenuItem key={classOption.value} value={classOption.value}>
                {classOption.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box mb={2}>
          <Autocomplete
            multiple
            options={studentList.map((student) => student.phone)}
            getOptionLabel={(option) => option}
            value={selectedStudents}
            onChange={(e, newValue) => setSelectedStudents(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Students" variant="outlined" />
            )}
          />
        </Box>
        <Box textAlign="center">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PushNotificationData;
