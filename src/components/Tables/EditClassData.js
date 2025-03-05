import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Autocomplete,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUser } from '../../Functions/Login';
const defaultProfileImage = "https://via.placeholder.com/150"; // Placeholder image URL


const EditClassData = () => {
    const formatDateTimeLocal = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
  const navigate = useNavigate();
  const user = getUser();
  const location = useLocation();
  const { sessionInfo, courseInfo } = location.state || {};
  const [courseList, setCourseList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseInfo);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [mentorDetails, setMentorDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectNames, setSubjectNames] = useState({});
  const [formData, setFormData] = useState({
    title: sessionInfo.detail,
    startTime: formatDateTimeLocal(sessionInfo.startTime),
    endTime: formatDateTimeLocal(sessionInfo.endTime),
    description:sessionInfo.description,
  });

  useEffect(() => {
    console.log("my session info is ", JSON.stringify(sessionInfo));
    fetchCourses();
  }, []);
  useEffect(()=>{
    getSubjectInfo();
    handleCourseSelect(courseInfo);
    handleSubjectSelect(sessionInfo.subjectId);
  },[]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        setCourseList(result.courses || []);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };
 
  const getMentorById = async (mentorId) => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentor_by_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorId }),
      });
      const result = await response.json();
      if (result.success) {
        setMentorDetails(result.mentor);
      }
    } catch (error) {
      console.error('Error fetching mentor details:', error);
    }
  };

  const getSubjectById = async (id) => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_subject_by_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        return result.subjects[0].name;
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
    return null;
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSubjectList(course.subjectList || []);
    setSelectedSubject('');
    setMentorDetails(null);

    course.subjectList.forEach(async (subjectId) => {
      const subjectName = await getSubjectById(subjectId);
      if (subjectName) {
        setSubjectNames((prevState) => ({
          ...prevState,
          [subjectId]: subjectName,
        }));
      }
    });
  };
// storing the default subject values 
  const getSubjectInfo =async ()=>{
    courseInfo.subjectList.forEach(async (subjectId) => {
        const subjectName = await getSubjectById(subjectId);
        if (subjectName) {
          setSubjectNames((prevState) => ({
            ...prevState,
            [subjectId]: subjectName,
          }));
        }
      });
  }

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    const teachIntro = selectedCourse.TeachIntro.find(
      (intro) => intro.subjectId === subjectId && intro.bigCourseId === selectedCourse.id
    );
    if (teachIntro) {
      getMentorById(teachIntro.mentorId);
    } else {
      setMentorDetails(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedStartTime = new Date(formData.startTime).toISOString();
    const formattedEndTime = new Date(formData.endTime).toISOString();

    const submissionData = {
      id:sessionInfo.id,
      mentorId: user.mentor.id,
      bigCourseId: selectedCourse.id,
      detail: formData.title,
      subjectId: selectedSubject,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      description:formData.description,
      isGoingOn:false,
      isDone:false
    };

    try {
      const response = await fetch('https://sisyabackend.in/student/edit_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      const result = await response.json();
      if (result.success) {
        navigate('../teacher');
      } else {
        alert('Failed to add class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('An error occurred while adding the class.');
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Edit Class
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />

        <Autocomplete
          options={courseList}
          getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
          onChange={(event, newValue) => handleCourseSelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Course by ID or Name"
              margin="normal"
              fullWidth
            />
          )}
        />

        {selectedCourse && (
          <>
            <Typography variant="h6" gutterBottom>
              Selected Course: {selectedCourse.name}
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="subject-select-label">Select Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                value={selectedSubject}
                onChange={(e) => handleSubjectSelect(Number(e.target.value))}
              >
                <MenuItem value="">
                  <em>Select Subject</em>
                </MenuItem>
                {subjectList.map((subjectId) => (
                  <MenuItem key={subjectId} value={subjectId}>
                    {subjectNames[subjectId] || subjectId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
            <TextField
              label="Start Time"
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="End Time"
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Submit
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default EditClassData;
