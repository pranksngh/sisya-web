import React, { useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  Paper,
  Stack,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useLocation, useNavigate } from "react-router-dom";

const steps = ["Basic Info", "Select Classes", "Qualification", "Add Subjects"];

const EditTeacher = () => {
  const [activeStep, setActiveStep] = useState(0);
  const location = useLocation();
  const teacherData = location.state?.teacher || {};
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: teacherData.name,
    email: teacherData.email,
    phone: teacherData.phone,
    profilePicture: teacherData.imageData,
    classes: teacherData.Grades,
    qualifications: teacherData.qualifications,
    selectedSubjects: teacherData.subjectRecord.map((record, index) => ({
      id: record.id, // Unique ID based on the current list length (index starts from 0)
      class: record.subject.gradeLevel, // Assuming `gradeLevel` corresponds to `class`
      subject: record.subject.name, // The subject name
      comment: record.comment, // The comment
    })),
    dob:teacherData.dateOfBirth.split("T")[0],
    address: teacherData.address,
    profilePicture: `https://sisyabackend.in/student/thumbs/mentors/${teacherData.id}.jpg`
  });
  const [subjectOptions, setSubjectOptions] = useState([]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 // console.log("teacher data" + JSON.stringify(teacherData));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1]; // Remove MIME type and base64 prefix
          setFormData({ ...formData, profilePicture: reader.result, imageData:base64String }); // Store the base64 string in formData
        }
        reader.readAsDataURL(file);
    }
  };

  const toggleClass = (className) => {
    setFormData((prev) => {
      const classes = prev.classes.includes(className)
        ? prev.classes.filter((cls) => cls !== className)
        : [...prev.classes, className];
      return { ...prev, classes };
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const payload = {
      id: teacherData.id,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        dob: formData.dob,
        searchTags: "",
        languages: "",
        Grades: formData.classes, // Submit the array of grades
        qualificationList: formData.qualifications.map(q => ({
          name: q.name,
          level: q.level,
          institution: q.institution,
          year: new Date(q.year).toISOString(), // Format the date as ISO 8601
          mentorId: teacherData.id
        })),
        subjectRecordList: formData.selectedSubjects.map(s => ({
          comment: s.comment,
          subjectId: s.id, // Assuming subjectId is the index
          mentorId: teacherData.id
        })),
        ...(formData.imageData && { imageData: formData.imageData }),
      };
      try {
        const response = await fetch('https://sisyabackend.in/rkadmin/update_mentor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        const result = await response.json();
        if (result.success) {
          setSuccessModalOpen(true);
        } else {
      //   alert("Teacher addition failed", result.error);
      setErrorModalOpen(true);
        }
      } catch (error) {
    //    console.log("Error adding teacher:", error);
      //  alert("An error occurred while adding the teacher.");
      setErrorModalOpen(true);
      }
  
 //   console.log("Form Data Submitted:", payload);
    // Add API call or validation logic here
  };

  const fetchSubjects = async(grade) => {
    const sgrade = parseInt(grade, 10);
    console.log(sgrade);
    try {
      const subjectResponse = await fetch('https://sisyabackend.in/student/get_subjects_by_grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({grade:sgrade})
      });
      const subjectResult = await subjectResponse.json();

      if (subjectResult.success) {
        setSubjectOptions(subjectResult.subjects);
       // console.log("Subjects fetched successfully");
      } else {
      //  console.log("Failed to fetch Subjects");
      }
    } catch (error) {
    //  console.log("Error fetching Subjects:", error);
    }
  };

  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
        case 0:
            return (
              <Box>
                <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      alt="Profile Picture"
                      src={formData.profilePicture || undefined}
                      sx={{ width: 100, height: 100 }}
                    />
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        backgroundColor: "white",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <AddPhotoAlternateIcon color="primary" />
                      <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Upload Profile Picture
                  </Typography>
                </Stack>
          
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                />
          
                {/* Date of Birth */}
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
          
                {/* Address */}
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                />
              </Box>
            );
          
        case 1:
            return (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Classes
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  justifyContent="center" // Center align
                  gap={1} // Space between rows
                >
                  {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((cls) => {
                    const classNumber = cls.split(" ")[1]; // Extract number from "Class 1", "Class 2", etc.
                    return (
                      <Chip
                        key={cls}
                        label={cls}
                        onClick={() => toggleClass(classNumber)} // Pass the numeric value instead of the class name
                        sx={{
                          marginTop: 10,
                          backgroundColor: formData.classes.includes(classNumber) ? "primary.main" : "default",
                          color: formData.classes.includes(classNumber) ? "white" : "black",
                          "&:hover": {
                            backgroundColor: formData.classes.includes(classNumber)
                              ? "primary.dark"
                              : "grey.300",
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            );
          
        case 2:
            return (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Add Qualification
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  {/* Qualification Name */}
                  <TextField
                    fullWidth
                    label="Qualification"
                    name="qualificationInput"
                    value={formData.qualificationInput || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, qualificationInput: e.target.value })
                    }
                  />
                  
                  {/* University Name */}
                  <TextField
                    fullWidth
                    label="University"
                    name="universityInput"
                    value={formData.universityInput || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, universityInput: e.target.value })
                    }
                  />
                  
                  {/* Year of Graduation */}
                  <TextField
                    fullWidth
                    label="Year"
                    name="yearInput"
                    type="number"
                    value={formData.yearInput || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, yearInput: e.target.value })
                    }
                  />
                  
                  {/* Add Qualification Button */}
                  <Button
                    variant="contained"
                    onClick={() => {
                      const newQualification = {
                        name: formData.qualificationInput,
                        level: formData.universityInput, // Using "universityInput" as level for this case
                        institution: formData.universityInput,
                        year: formData.yearInput,
                      };
          
                      // Only add the qualification if all fields are filled
                      if (
                        newQualification.name &&
                        newQualification.level &&
                        newQualification.institution &&
                        newQualification.year
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          qualifications: [
                            ...(prev.qualifications || []),
                            newQualification,
                          ],
                          qualificationInput: "",
                          universityInput: "",
                          yearInput: "",
                        }));
                      }
                    }}
                  >
                    Add
                  </Button>
                </Stack>
          
                <Stack spacing={2}>
                  {/* Displaying the added qualifications */}
                  {(formData.qualifications || []).map((qual, index) => {
                    const date = new Date(qual.year);
                    const year = date.getFullYear();
                    return (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                      }}
                    >
                      <Box>
                        {/* Displaying the qualification details */}
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {qual.name}
                        </Typography>
                        <Typography variant="body2">
                          {qual.institution} ({year})
                        </Typography>
                      </Box>
                      {/* Delete Button for qualifications */}
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            qualifications: prev.qualifications.filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }}
                      >
                        Delete
                      </Button>
                    </Paper>
                  )
                
    })}
                </Stack>
              </Box>
            );
          
          case 3:
            return (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Subjects by Class
                </Typography>
          
                {/* Select Class */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    select
                    label="Select Class"
                    name="selectedClass"
                    value={formData.selectedClass || ""}
                    onChange={(e) => {
                      const selectedClass = e.target.value;
                      setFormData({ ...formData, selectedClass });
          
                      // Fetch subjects dynamically based on selected class
                      fetchSubjects(selectedClass);
                    }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Select Class</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Class {i + 1}
                      </option>
                    ))}
                  </TextField>
                </Stack>
          
                {/* Show Available Subjects */}
                {formData.selectedClass && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Select a Subject for Class {formData.selectedClass}
                    </Typography>
          
                    {/* Dropdown for selecting a single subject */}
                    <TextField
                      fullWidth
                      select
                      label="Select Subject"
                      name="selectedSubject"
                      value={formData.selectedSubject || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value; // Get the selected subject ID
                        const selectedSubject = subjectOptions.find(subject => subject.id === parseInt(selectedId)); // Find the subject object
                        console.log("Selected subject is: ", JSON.stringify(selectedSubject));
                        setFormData({ ...formData, selectedSubject })
                      
                      }}
                      SelectProps={{
                        native: true,
                      }}
                      sx={{ mb: 2 }}
                    >
                      <option value="">Select Subject</option>
                      {subjectOptions.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </TextField>
          
                    {/* Add Subject Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (formData.selectedSubject) {
                          const newSubject = {
                            id: formData.selectedSubject.id,  // Unique ID based on current list length
                            class: formData.selectedClass,
                            subject: formData.selectedSubject.name,
                            comment: `Proficient in ${formData.selectedSubject.name}`,
                          };
          
                          // Add the new subject to the formData.selectedSubjects array
                          setFormData((prev) => ({
                            ...prev,
                            selectedSubjects: [...(prev.selectedSubjects || []), newSubject],
                            selectedSubject: "", // Reset the selected subject after adding
                          }));
                        }
                      }}
                      sx={{ mb: 2 }}
                    >
                      Add Subject
                    </Button>
                  </Box>
                )}
          
                {/* Show Selected Classes and Subjects */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2">Selected Classes and Subjects</Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {formData.selectedSubjects?.map((subject, index) => (
                      <Paper
                        key={index}
                        elevation={2}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {`Class ${subject.class}`}
                          </Typography>
                          <Typography variant="body2">
                            {subject.subject}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "gray" }}>
                            {subject.comment}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setFormData((prev) => {
                              const updatedSubjects = prev.selectedSubjects.filter(
                                (s) => s.id !== subject.id
                              );
                              return { ...prev, selectedSubjects: updatedSubjects };
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Box>
            );
          
          
      default:
        return "Unknown step";
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 800,
        margin: "auto",
        mt: 5,
        p: 4,
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
        Edit Teacher
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 3 }}>{renderStepContent(activeStep)}</Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          color="secondary"
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" color="primary">
            Next
          </Button>
        )}
      </Box>
      <Dialog open={successModalOpen} onClose={closeSuccessModal}>
        <DialogTitle>
          <Typography variant="h5" color="green">
           Teacher Updated Successfully
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Teacher detail have been updated successfully.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={()=>navigate('../teachers')}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={errorModalOpen} onClose={closeErrorModal}>
        <DialogTitle>
          <Typography variant="h5" color="red">
           Teacher Update Failed
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Please try again later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeErrorModal}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>

    
  );
};

export default EditTeacher;
