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


const AddHomeworkData = () => {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = location.state || {};
  const [homeworkData, setHomeworkData] = useState({
    startTime: session.startTime,
    endTime: session.endTime,
    duration: 60, // Duration in minutes
    sessionId: session.id,
    mentorId: user.mentor.id,
    questions: [],
  });

  const [questionType, setQuestionType] = useState("multipleChoice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctResponse, setCorrectResponse] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
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
      questions: [...homeworkData.questions, newQuestion],
    });
    setQuestion("");
    setOptions(questionType === "trueFalse" ? ["True", "False"] : ["", "", "", ""]);
    setCorrectResponse("");
  };

  const submitHomework = async () => {
    const response = await fetch("https://sisyabackend.in/teacher/add_session_test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(homeworkData),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Homework Added Successfully");
      navigate("/homework");
    } else {
      console.log("Homework Addition Failed");
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
        Add Homework
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1">Course Name: {session.courseName}</Typography>
        <Typography variant="subtitle1">Session Name: {session.detail}</Typography>
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
              Preview Questions ({homeworkData.questions.length})
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={submitHomework}>
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
          {homeworkData.questions.length === 0 ? (
            <Typography>No questions added yet.</Typography>
          ) : (
            homeworkData.questions.map((q, index) => (
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

export default AddHomeworkData;
