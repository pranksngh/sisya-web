import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Select,
  MenuItem,
  Modal,
  Paper,
  Grid,
} from "@mui/material";
import { getUser } from "../../Functions/Login";


const AddTestData = () => {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};
  const [homeworkData, setHomeworkData] = useState({
    title:"",
    ctestQuestions: [],
    startDate: "", // Initialize startDate
    endDate: "",   // Initialize endDate
    Duration:30,
    bigCourseId: 0,
    subjectId: 0,
    mentorId: user.mentor.id,
  });

  const [questionType, setQuestionType] = useState("multipleChoice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctResponse, setCorrectResponse] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const matchingTeachIntro = course.TeachIntro.find(
      (intro) => intro.mentorId === user.mentor.id
    );
  //  console.log(matchingTeachIntro);
   
      setHomeworkData({
        ...homeworkData,
        bigCourseId: matchingTeachIntro.bigCourseId,
        subjectId: matchingTeachIntro.subjectId,
        mentorId: user.mentor.id,
        
      })
    

   


  //  console.log("my course data is ", JSON.stringify(session));
    if (questionType === "trueFalse") {
      setOptions(["True", "False"]);
    } else {
      setOptions(["", "", "", ""]);
    }
  }, [questionType]);

  const handleQuestionTypeChange = (e) => {
    setQuestionType(e.target.value);
    setCorrectResponse(""); // Reset correct response for new question type
  };

  const handleChange = (field, value) => {
    let formattedValue = value;
  
    // Convert date fields to ISO string format
    if (field === "startDate" || field === "endDate") {
      formattedValue = new Date(value).toISOString();
    }
  
    setHomeworkData((prevData) => ({
      ...prevData,
      [field]: formattedValue,
    }));
  };
  

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleOptionChange = (index, e) => {
    const newOptions = [...options];
    newOptions[index] = e.target.value;
    setOptions(newOptions);
  };

  const handleCorrectResponseChange = (e) => {
    setCorrectResponse(e.target.value);
  };

  const addQuestion = () => {
    const newQuestion = {
      type: questionType,
      question,
      option1: options[0],
      option2: options[1],
      option3: questionType === "multipleChoice" ? options[2] : "",
      option4: questionType === "multipleChoice" ? options[3] : "",
      correctResponse: correctResponse,
    };
    setHomeworkData({
      ...homeworkData,
      ctestQuestions: [...homeworkData.ctestQuestions, newQuestion],
    });
    setQuestion("");
    setOptions(questionType === "trueFalse" ? ["True", "False"] : ["", "", "", ""]);
    setCorrectResponse("");
  };

  const submitTestCreation = async () => {

    const matchingTeachIntro = course.TeachIntro.find(
      (intro) => intro.mentorId === user.mentor.id
    );
  //  console.log(matchingTeachIntro);
   
      setHomeworkData({
        ...homeworkData,
        bigCourseId: matchingTeachIntro.bigCourseId,
        subjectId: matchingTeachIntro.subjectId,
        mentorId: user.mentor.id,
        
      })
    
    
    

 //   console.log("coursetest data is ", JSON.stringify(homeworkData));
    const response = await fetch("https://sisyabackend.in/rkadmin/insert_ctest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(homeworkData),
    });

    const result = await response.json();
    if (result.success) {
    //  console.log("Ctest Added Successfully");
      navigate("/homework");
    } else {
     // console.log("Course Test Addition Failed", JSON.stringify(result));
    }
  };

  const openPreviewModal = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const getCorrectAnswerText = (question) => {
    return question[`option${question.correctResponse}`];
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Test
      </Typography>
      <Box sx={{ mb: 4, }}>
        <Typography variant="subtitle1">Course Name: {course.name}</Typography>
        <Box sx={{ mb: 2 , mt:5}}>
          <TextField
            label="Title"
            fullWidth
            value={homeworkData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2, mt:5 }}>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={homeworkData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={homeworkData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </Box>
      </Box>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <RadioGroup
          row
          value={questionType}
          onChange={handleQuestionTypeChange}
          sx={{ mb: 2 }}
        >
          <FormControlLabel
            value="multipleChoice"
            control={<Radio />}
            label="Multiple Choice"
          />
          <FormControlLabel
            value="trueFalse"
            control={<Radio />}
            label="True/False"
          />
        </RadioGroup>

        <TextField
          label="Question"
          fullWidth
          value={question}
          onChange={handleQuestionChange}
          sx={{ mb: 2 }}
        />

        {questionType === "multipleChoice" && (
          <Box sx={{ mb: 2 }}>
            {options.map((option, index) => (
              <TextField
                key={index}
                label={`Option ${index + 1}`}
                fullWidth
                value={option}
                onChange={(e) => handleOptionChange(index, e)}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        )}

        <Select
          fullWidth
          value={correctResponse}
          onChange={handleCorrectResponseChange}
          displayEmpty
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>
            Select Correct Response
          </MenuItem>
          {options.map((option, index) => (
            <MenuItem key={index} value={index + 1}>
              {option}
            </MenuItem>
          ))}
        </Select>

        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={addQuestion}>
              Add Question
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={openPreviewModal}>
              Preview Questions ({homeworkData.ctestQuestions.length})
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={submitTestCreation}>
              Submit Homework
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Modal open={isPreviewModalOpen} onClose={closePreviewModal}>
        <Paper
          elevation={3}
          sx={{ padding: 4, maxWidth: 600, margin: "auto", mt: 8 }}
        >
          <Typography variant="h5" gutterBottom>
            Preview Questions
          </Typography>
          {homeworkData.ctestQuestions.length === 0 ? (
            <Typography>No questions added yet.</Typography>
          ) : (
            homeworkData.ctestQuestions.map((q, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Q: {q.question}</Typography>
                {q.option1 && <Typography>1. {q.option1}</Typography>}
                {q.option2 && <Typography>2. {q.option2}</Typography>}
                {q.option3 && <Typography>3. {q.option3}</Typography>}
                {q.option4 && <Typography>4. {q.option4}</Typography>}
                <Typography><strong>Correct Answer: {getCorrectAnswerText(q)}</strong></Typography>
              </Box>
            ))
          )}
          <Button variant="contained" onClick={closePreviewModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default AddTestData;
