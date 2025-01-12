import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Card,
  CardMedia,
  CardContent,
  duration,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
const defaultUserImage = "https://via.placeholder.com/100?text=User";

const AddCourse = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Course Banner", "Course Info", "Subjects", "Teachers"];

  // Step 1 States
  const [banner, setBanner] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // Step 2 States
  const [courseInfo, setCourseInfo] = useState({
    name: "",
    description: "",
    currentPrice: 0.0,
    price: 0.0,
    courseType: "",
    duration: 0.0,
    grade: "",
    startDate: "",
    endDate: "",
  });

  // Step 3 States
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Step 4 States
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedSubjectsForTeachers, setSelectedSubjectsForTeachers] = useState({});

  const [MainImageData, setMainImageData] = useState([]);
  const [BannerImageData, setBannerImageData] = useState([]);
  const [validationError, setValidationError] = useState("");


  const handleNext = () => {
    // Reset validation error
    setValidationError("");
  
    switch (activeStep) {
      case 0:
        // Validate Step 0 (Course Media)
        if (!banner) {
          setValidationError("Please upload a course banner.");
          return;
        }
        if (!mainImage) {
          setValidationError("Please upload a main image.");
          return;
        }
        break;
  
      case 1:
        // Validate Step 1 (Course Information)
        if (!courseInfo.name.trim()) {
          setValidationError("Course name is required.");
          return;
        }
        if (!courseInfo.description.trim()) {
          setValidationError("Course description is required.");
          return;
        }
        if (!courseInfo.currentPrice || courseInfo.currentPrice <= 0) {
          setValidationError("Please provide a valid current price.");
          return;
        }
        if (!courseInfo.price || courseInfo.price <= 0) {
          setValidationError("Please provide a valid MRP.");
          return;
        }
        if (!courseInfo.courseType) {
          setValidationError("Please select a course type.");
          return;
        }
        if (!courseInfo.duration || courseInfo.duration <= 0) {
          setValidationError("Please provide a valid course duration.");
          return;
        }
        if (!courseInfo.grade) {
          setValidationError("Please select a grade.");
          return;
        }
        if (!courseInfo.startDate) {
          setValidationError("Please select a start date.");
          return;
        }
        if (!courseInfo.endDate) {
          setValidationError("Please select an end date.");
          return;
        }
        if (new Date(courseInfo.startDate) > new Date(courseInfo.endDate)) {
          setValidationError("Start date cannot be later than end date.");
          return;
        }
        break;
  
      case 2:
        // Validate Step 2 (Subjects)
        if (selectedSubjects.length === 0) {
          setValidationError("Please select at least one subject.");
          return;
        }
        break;
  
      case 3:
        // Validate Step 3 (Teachers)
        if (selectedTeachers.length === 0) {
          setValidationError("Please assign at least one teacher.");
          return;
        }
        if (
          selectedTeachers.some(
            (teacher) => !teacher.assignedSubject || !teacher.assignedSubject.id
          )
        ) {
          setValidationError(
            "All selected teachers must have an assigned subject."
          );
          return;
        }
        break;
  
      default:
        break;
    }
  
    // Move to next step if validations pass
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleBannerFileUpload = async (e, setFile) => {
    const file = e.target.files[0];
    if (file) {

      const base64 = await convertToBase64(file);
     
      setFile(URL.createObjectURL(file));
      setBannerImageData(base64);


    }
  };
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 part
      reader.onerror = error => reject(error);
    });
  };

  const handleMainFileUpload = async (e, setFile) => {
    const file = e.target.files[0];
    if (file) {

      const base64 = await convertToBase64(file);
      
      setFile(URL.createObjectURL(file));
      setMainImageData(base64);


    }
  };

  const handleRemoveFile = (setFile) => setFile(null);

  const handleCourseInfoChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (name === 'price' || name === 'currentPrice' || name === "duration") {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        parsedValue = ''; // Set to an empty string if parsing fails
      }
    }
    if(name ==="grade" && value !== courseInfo.grade){

        console.log("my grade is " + e.target.value)
        fetchSubjects(e.target.value);
        fetchTeacherList(e.target.value);
    }
    setCourseInfo({ ...courseInfo, [name]: value });
  };

  const toggleChipSelection = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter((i) => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  const addTeacher = (teacher) => {
    // Check if the selected subjectId for the teacher is unique and set it correctly
    const subjectId = selectedSubjects.find(subject => subject.id === teacher.assignedSubject.id);
    if (subjectId) {
      const updatedTeacher = { ...teacher, subjectId: subjectId.id };
      setSelectedTeachers([...selectedTeachers, updatedTeacher]);

      console.log("selected teachers", JSON.stringify(selectedTeachers))
    } else {
      alert("Subject ID not found!");
    }
  
  };

  const fetchSubjects = async (grade) => {
    console.log(grade);
    try {
      const subjectResponse = await fetch('https://sisyabackend.in/student/get_subjects_by_grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grade: parseInt(grade, 10) })
      });
      const subjectResult = await subjectResponse.json();

      if (subjectResult.success) {
        setAvailableSubjects(subjectResult.subjects);
        console.log("Subjects fetched successfully");
      } else {
        console.error("Failed to fetch Subjects", subjectResult.error);
      }
    } catch (error) {
      console.error("Error fetching Subjects:", error);
    }
  };

  const fetchTeacherList = async (selectedGrade) => {
    console.log("selected grade is " , selectedGrade);
    try {
      const mentorResponse = await fetch('https://sisyabackend.in/rkadmin/get_mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const mentorResult = await mentorResponse.json();

      if (mentorResult.success) {
        // Filter mentors based on the selected grade
        const filteredMentors = mentorResult.mentors.filter(mentor =>
          mentor.Grades.includes(selectedGrade.toString())
        );

        console.log("Filtered Mentors List", JSON.stringify(filteredMentors));
        setAvailableTeachers(filteredMentors); // Set the filtered mentors in the state

        console.log("Mentors fetched and filtered successfully");
      } else {
        console.error("Failed to fetch Mentors");
      }
    } catch (error) {
      console.error("Error fetching Mentors:", error);
    }
  };

  const handleImageError = (event) => {
    event.target.src = defaultUserImage;
  };

  const handleSubjectChange = (teacherId, subjectId) => {
    setSelectedSubjectsForTeachers(prevState => ({
      ...prevState,
      [teacherId]: subjectId
    }));
  };

  const isTeacherSelected = (teacher) =>
    selectedTeachers.some((t) => t.id === teacher.id);


  const handleAssignSubject = (teacher) => {
    const subjectId = selectedSubjectsForTeachers[teacher.id];
    const subject = selectedSubjects.find(subject => subject.id === parseInt(subjectId));

    // Check if the subject is already assigned to another teacher
    const isSubjectAlreadyAssigned = selectedTeachers.some(
      selectedTeacher => selectedTeacher.assignedSubject && selectedTeacher.assignedSubject.id === subject.id
    );

    if (isSubjectAlreadyAssigned) {
      alert("This subject is already assigned to another teacher.");
    } else if (teacher && subject) {
      addTeacher({
        ...teacher,
        assignedSubject: subject,
      });
   
    }
  };

  const handleRemoveTeacher = (teacher) => {
    setSelectedTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
  };


  const handleSubmit = async (e) => {
   // e.preventDefault();

    const finalData = {
      name: courseInfo.name,
      description:courseInfo.description,
      price: parseFloat(courseInfo.price),
      currentPrice:parseFloat(courseInfo.currentPrice),
      startDate: courseInfo.startDate,
      endDate:courseInfo.endDate,
      duration: parseInt(courseInfo.duration),
      grade: courseInfo.grade.toString(),
      searchTags: selectedSubjects.map(subject => subject.name.toLowerCase()),
      prerequisites: [],
      syllabus: [],
      category: "Not Available",
      level: "Advanced",
      isLongTerm: courseInfo.courseType === "long" ? true : false,
      isFree: courseInfo.courseType === "free" ? true : false,
      averageRating: 4.8,
      thumbnailUrl: "http://example.com/thumbnail.jpg",
      language: "English",
      subjectList: selectedSubjects.map(subject => subject.id),
      mentorList: selectedTeachers.map(teacher => teacher.id),
      mainImageData: MainImageData,
      imageData:BannerImageData,
      TeachIntroData: selectedTeachers.map(teacher => ({
        comment: "Not Available",
        mentorId: teacher.id,
        subjectId: teacher.subjectId || (selectedSubjects.length > 0 ? selectedSubjects[0].id : null)
      }))
    };

    console.log(JSON.stringify(finalData));
  
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/create_big_course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
      });

      const result = await response.json();

      if (result.success) {
         console.log("Course Added Successfully");
       //  alert("Course Added Successfully");
       navigate('../courses');
      } else {
        console.log("Course Addition Failed");
        alert(JSON.stringify(result.error));
      }
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Course Addition Error", error);
    }

   // setResultModalOpen(true); // Open the result modal
  };
  


  const renderStepContent = (step) => {
    switch (step) {
        case 0:
            return (
              <div style={{ textAlign: "center" }}>
                <Typography variant="h5" style={{ marginBottom: "20px" }}>
                  Upload Course Media
                </Typography>
          
                {/* Banner Upload Section */}
                <div
                  style={{
                    border: "2px dashed #ccc",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "20px",
                    position: "relative",
                    cursor: "pointer",
                    backgroundColor: banner ? "#f5f5f5" : "white",
                  }}
                >
                  {banner ? (
                    <>
                      <div
                        style={{
                          width: "100%",
                          height: "200px",
                          background: `#f5f5f5 url(${banner}) no-repeat center`,
                          backgroundSize: "contain",
                          borderRadius: "10px",
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        style={{ marginTop: "10px" }}
                        onClick={() => handleRemoveFile(setBanner)}
                      >
                        Remove Banner
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" style={{ color: "#888" }}>
                        Click to upload a banner
                      </Typography>
                      <input
                        accept="image/*"
                        id="upload-banner"
                        type="file"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                        onChange={(e) => handleBannerFileUpload(e, setBanner)}
                      />
                    </>
                  )}
                </div>
          
                {/* Main Image Upload Section */}
                <div
                  style={{
                    border: "2px dashed #ccc",
                    borderRadius: "10px",
                    padding: "20px",
                    position: "relative",
                    cursor: "pointer",
                    backgroundColor: mainImage ? "#f5f5f5" : "white",
                  }}
                >
                  {mainImage ? (
                    <>
                      <div
                        style={{
                          width: "100%",
                          height: "200px",
                          background: `#f5f5f5 url(${mainImage}) no-repeat center`,
                          backgroundSize: "contain",
                          borderRadius: "10px",
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        style={{ marginTop: "10px" }}
                        onClick={() => handleRemoveFile(setMainImage)}
                      >
                        Remove Main Image
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" style={{ color: "#888" }}>
                        Click to upload a main image
                      </Typography>
                      <input
                        accept="image/*"
                        id="upload-main-image"
                        type="file"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                        onChange={(e) => handleMainFileUpload(e, setMainImage)}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          
      case 1:
        return (
          <div>
            <TextField
              label="Course Name"
              name="name"
              fullWidth
              margin="normal"
              value={courseInfo.name}
              onChange={handleCourseInfoChange}
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={courseInfo.description}
              onChange={handleCourseInfoChange}
            />
            <TextField
            type="number"
              label="Current Price"
              name="currentPrice"
              fullWidth
              margin="normal"
              value={courseInfo.currentPrice}
              onChange={handleCourseInfoChange}
            />
            <TextField
            type="number"
              label="MRP"
              name="price"
              fullWidth
              margin="normal"
              value={courseInfo.price}
              onChange={handleCourseInfoChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Course Type</InputLabel>
              <Select
                name="courseType"
                value={courseInfo.courseType}
                onChange={handleCourseInfoChange}
              >
                <MenuItem value="long">Long Term</MenuItem>
                <MenuItem value="short">Short Term</MenuItem>
                <MenuItem value="free">Free</MenuItem>
              </Select>
            </FormControl>
            <TextField
            type="number"
              label="Duration"
              name="duration"
              fullWidth
              margin="normal"
              value={courseInfo.duration}
              onChange={handleCourseInfoChange}
            />
           <FormControl fullWidth margin="normal">
        <InputLabel>Grade</InputLabel>
        <Select
          name="grade"
          value={courseInfo.grade}
          onChange={handleCourseInfoChange}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              Class {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={courseInfo.startDate}
              onChange={handleCourseInfoChange}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={courseInfo.endDate}
              onChange={handleCourseInfoChange}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <Typography variant="h6">Select Subjects</Typography>
            {availableSubjects.map((subject) => (
              <Chip
                key={subject.id}
                label={subject.name}
                clickable
                color={selectedSubjects.includes(subject) ? "primary" : "default"}
                onClick={() =>
                  toggleChipSelection(subject, selectedSubjects, setSelectedSubjects)
                }
                style={{ margin: 4 }}
              />
            ))}
          </div>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Select Teachers
            </Typography>
            <Grid container spacing={2}>
              {availableTeachers.map((teacher) => (
                <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                  <Card
                    sx={{
                      border: selectedTeachers.includes(teacher) ? "2px solid #1976d2" : "none",
                      textAlign: "center",
                      padding: 2,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`https://sisyabackend.in/student/thumbs/mentors/${teacher.id}.jpg`} // Replace with teacher's photo URL
                      alt={`${teacher.name}'s photo`}
                      onError={handleImageError}
                      sx={{
                        height: 100,
                        width: 100,
                        borderRadius: "50%",
                        margin: "0 auto",
                        objectFit: "cover",
                      }}
                    />
                    <CardContent>
                      <Typography variant="h6">{teacher.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Email: {teacher.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Qualification: {teacher.qualification}
                      </Typography>
                      <FormControl fullWidth sx={{ marginTop: 2 }}>
                  <InputLabel>Assign Subject</InputLabel>
                  <Select
                    value={selectedSubjectsForTeachers[teacher.id] || ""}
                    onChange={(e) => handleSubjectChange(teacher.id, e.target.value)}
                    label="Assign Subject"
                  >
                    {selectedSubjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                    </CardContent>
                    <Button
                      onClick={() => {
                        isTeacherSelected(teacher)
                      ? handleRemoveTeacher(teacher)
                      : handleAssignSubject(teacher)
                      }}
                      variant="contained"
                      color={isTeacherSelected(teacher) ? "primary" : "default"}
                    >
                     {isTeacherSelected(teacher) ? "Deselect" : "Select"}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 50 }}>
       {validationError && (
    <Alert severity="error" style={{ fontWeight: "bold", textAlign: "left" , marginBottom:20,}}>
      {validationError}
    </Alert>
  )}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div style={{ margin: "20px 0" }}>
    
        {renderStepContent(activeStep)}
        </div>
      <div>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={
            activeStep === steps.length - 1
              ? () => handleSubmit()
              : handleNext
          }
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default AddCourse;
