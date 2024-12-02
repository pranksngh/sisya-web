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
} from "@mui/material";

const AddCourse = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Course Banner", "Course Info", "Subjects", "Teachers"];

  // Step 1 States
  const [banner, setBanner] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // Step 2 States
  const [courseInfo, setCourseInfo] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    type: "",
    duration: "",
    grade: "",
    startDate: "",
    endDate: "",
  });

  // Step 3 States
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Step 4 States
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const availableTeachers = ["John Doe", "Jane Smith", "Paul Adams", "Lisa Ray"];

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleFileUpload = (e, setFile) => {
    const file = e.target.files[0];
    if (file) setFile(URL.createObjectURL(file));
  };

  const handleRemoveFile = (setFile) => setFile(null);

  const handleCourseInfoChange = (e) => {
    const { name, value } = e.target;
    if(name ==="grade"){

        console.log("my grade is " + e.target.value)
        fetchSubjects(e.target.value);
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
                        onChange={(e) => handleFileUpload(e, setBanner)}
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
                        onChange={(e) => handleFileUpload(e, setMainImage)}
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
              name="price"
              fullWidth
              margin="normal"
              value={courseInfo.price}
              onChange={handleCourseInfoChange}
            />
            <TextField
            type="number"
              label="MRP"
              name="mrp"
              fullWidth
              margin="normal"
              value={courseInfo.mrp}
              onChange={handleCourseInfoChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Course Type</InputLabel>
              <Select
                name="type"
                value={courseInfo.type}
                onChange={handleCourseInfoChange}
              >
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Offline">Offline</MenuItem>
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
            <Typography variant="h6">Select Teachers</Typography>
            {availableTeachers.map((teacher) => (
              <Chip
                key={teacher}
                label={teacher}
                clickable
                color={selectedTeachers.includes(teacher) ? "primary" : "default"}
                onClick={() =>
                  toggleChipSelection(teacher, selectedTeachers, setSelectedTeachers)
                }
                style={{ margin: 4 }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div style={{ margin: "20px 0" }}>{renderStepContent(activeStep)}</div>
      <div>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={
            activeStep === steps.length - 1
              ? () => alert("Course created successfully!")
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
