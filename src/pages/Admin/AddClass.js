import React, { useState, useEffect } from 'react';
import { 
  Container, TextField, Autocomplete, Button, Typography, Card, CardContent, Avatar, MenuItem, Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddClassData = () => {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [mentorDetails, setMentorDetails] = useState(null);
  const [subjectNames, setSubjectNames] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setCourseList(result.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const getSubjectById = async (id) => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_subject_by_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      return result.success ? result.subjects[0].name : null;
    } catch (error) {
      console.error("Error fetching subject details:", error);
      return null;
    }
  };

  const getMentorById = async (mentorId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_by_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId }),
      });
      const result = await response.json();
      setMentorDetails(result.success ? result.mentor : null);
    } catch (error) {
      console.error("Error fetching mentor details:", error);
    }
  };

  const handleCourseChange = async (event, newValue) => {
    setSelectedCourse(newValue);
    setSelectedSubject('');
    setMentorDetails(null);
    if (newValue) {
      const subjects = {};
      for (const subjectId of newValue.subjectList) {
        subjects[subjectId] = await getSubjectById(subjectId) || subjectId;
      }
      setSubjectNames(subjects);
    }
  };

  const handleSubjectChange = (event) => {
    const subjectId = event.target.value;
    setSelectedSubject(subjectId);
    const mentor = selectedCourse?.TeachIntro.find(intro => intro.subjectId === subjectId);
    mentor ? getMentorById(mentor.mentorId) : setMentorDetails(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      mentorId: mentorDetails?.id || null,
      bigCourseId: selectedCourse?.id,
      detail: formData.title,
      subjectId: selectedSubject,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };
    
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/add_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Class added successfully!' });
        setFormData({ title: '', startTime: '', endTime: '' });
        setSelectedCourse(null);
        setSelectedSubject('');
        setMentorDetails(null);
      } else {
        setMessage({ type: 'error', text: 'Failed to add class.' });
      }
    } catch (error) {
      console.error("Error adding class:", error);
      setMessage({ type: 'error', text: 'An error occurred while adding the class.' });
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: 20 }}>
      <Typography variant="h4" gutterBottom>Add Class</Typography>
      {message.text && <Alert severity={message.type}>{message.text}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleInputChange} required margin="normal" />
        
        <Autocomplete
          options={courseList}
          getOptionLabel={(option) => `${option.id} - ${option.name}` || ''}
          value={selectedCourse}
          onChange={handleCourseChange}
          renderInput={(params) => <TextField {...params} label="Select Course" margin="normal" fullWidth />}
        />
        
        {selectedCourse && (
          <TextField fullWidth select label="Select Subject" value={selectedSubject} onChange={handleSubjectChange} margin="normal">
            {selectedCourse.subjectList.map(subjectId => (
              <MenuItem key={subjectId} value={subjectId}>{subjectNames[subjectId] || subjectId}</MenuItem>
            ))}
          </TextField>
        )}

        {selectedSubject && (
          mentorDetails ? (
            <Card variant="outlined" style={{ marginTop: 20 }}>
              <CardContent style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={mentorDetails.profileImage} style={{ marginRight: 10 }} />
                <div>
                  <Typography variant="h6">{mentorDetails.name}</Typography>
                  <Typography variant="body2">{mentorDetails.email}</Typography>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body1" style={{ marginTop: 10, color: 'red' }}>No mentor found</Typography>
          )
        )}

        <TextField fullWidth type="datetime-local" name="startTime" label="Start Time" value={formData.startTime} onChange={handleInputChange} margin="normal" InputLabelProps={{ shrink: true }} />
        <TextField fullWidth type="datetime-local" name="endTime" label="End Time" value={formData.endTime} onChange={handleInputChange} margin="normal" InputLabelProps={{ shrink: true }} />
        
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 20 }}>Submit</Button>
      </form>
    </Container>
  );
};

export default AddClassData;
