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
  IconButton,
} from "@mui/material";
import { getUser } from "../../Functions/Login";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SuperscriptIcon from "@mui/icons-material/Functions";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const commonMathSymbols = [
  "√",
  "π",
  "∞",
  "≈",
  "≤",
  "≥",
  "÷",
  "×",
  "±",
  "ρ",
  "λ",
  "θ",
  "Ω",
  "ω",
  "Σ",
  "⁰",
  "¹",
  "²",
  "³",
  "⁴",
  "⁵",
  "₀",
  "₁",
  "₂",
  "₃",
  "₄",
  "₅",
];

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
  // const [fillInAnswer, setFillInAnswer] = useState(""); // commented out fill in the blanks handling
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctResponse, setCorrectResponse] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Unified toolbar state for emoji, superscript, and math insertion
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // currentField: { field: "question" } or { field: "option", index: number }
  const [currentField, setCurrentField] = useState(null);

  // Math palette modal state
  const [showMathPalette, setShowMathPalette] = useState(false);

  useEffect(() => {
    if (questionType === "trueFalse") {
      setOptions(["True", "False"]);
    } else {
      setOptions(["", "", "", ""]);
    }
    setCorrectResponse("");
  }, [questionType]);

  const handleQuestionTypeChange = (e) => {
    setQuestionType(e.target.value);
    setCorrectResponse("");
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
      option1: options[0] || "",
      option2: options[1] || "",
      option3: questionType === "multipleChoice" ? options[2] || "" : "",
      option4: questionType === "multipleChoice" ? options[3] || "" : "",
      correctResponse,
      // fillInAnswer: questionType === "fillInTheBlanks" ? fillInAnswer : "",
    };
    setHomeworkData({
      ...homeworkData,
      questions: [...homeworkData.questions, newQuestion],
    });
    // Reset fields after adding question
    setQuestion("");
    if (questionType === "multipleChoice") {
      setOptions(["", "", "", ""]);
    } else if (questionType === "trueFalse") {
      setOptions(["True", "False"]);
    }
    // setFillInAnswer("");
    setCorrectResponse("");
  };

  const submitHomework = async () => {
    const response = await fetch(
      "https://sisyabackend.in/teacher/add_session_test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homeworkData),
      }
    );
    const result = await response.json();
    if (result.success) {
      console.log("Homework Added Successfully");
      navigate("../teacher");
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

  // Insert text into the currently focused field
  const insertTextToCurrentField = (text) => {
    if (!currentField) return;
    if (currentField.field === "question") {
      setQuestion(question + text);
    } else if (currentField.field === "option") {
      const idx = currentField.index;
      const newOptions = [...options];
      newOptions[idx] = newOptions[idx] + text;
      setOptions(newOptions);
    }
  };

  // Toolbar button handlers
  const handleInsertSuperscript = () => {
    insertTextToCurrentField("²");
  };

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    insertTextToCurrentField(emoji);
    setShowEmojiPicker(false);
  };

  // Math palette handlers
  const openMathPalette = () => {
    setShowMathPalette(true);
  };

  const closeMathPalette = () => {
    setShowMathPalette(false);
  };

  const handleMathPaletteClick = (symbol) => {
    insertTextToCurrentField(symbol);
    closeMathPalette();
  };

  const getCorrectAnswerText = (q) => {
    if (q.type === "multipleChoice" || q.type === "trueFalse") {
      return q[`option${q.correctResponse}`];
    }
    return "";
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Homework
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1">
          Course Name: {session.courseName}
        </Typography>
        <Typography variant="subtitle1">
          Session Name: {session.detail}
        </Typography>
      </Box>
      <Paper sx={{ padding: 4 }}>
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
          {/*
          <FormControlLabel
            value="fillInTheBlanks"
            control={<Radio />}
            label="Fill in the Blanks"
          />
          */}
        </RadioGroup>
        {/* Unified Toolbar */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <IconButton onClick={handleToggleEmojiPicker}>
            <InsertEmoticonIcon />
          </IconButton>
          <IconButton onClick={handleInsertSuperscript}>
            <SuperscriptIcon />
          </IconButton>
          <IconButton onClick={openMathPalette}>
            <LibraryBooksIcon />
          </IconButton>
        </Box>
        {showEmojiPicker && (
          <Box sx={{ mb: 2 }}>
            {["😀", "😂", "😍", "👍", "🎉"].map((emoji) => (
              <Button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                sx={{ minWidth: "auto", padding: "2px" }}
              >
                {emoji}
              </Button>
            ))}
          </Box>
        )}
        <TextField
          label="Question"
          fullWidth
          multiline
          rows={4}
          value={question}
          onChange={handleQuestionChange}
          onFocus={() => setCurrentField({ field: "question" })}
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
                onFocus={() => setCurrentField({ field: "option", index })}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        )}
        {(questionType === "multipleChoice" ||
          questionType === "trueFalse") && (
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
        )}
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
            <Button
              variant="contained"
              color="success"
              onClick={submitHomework}
            >
              Submit Homework
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Math Palette Modal */}
      <Modal open={showMathPalette} onClose={closeMathPalette}>
        <Paper sx={{ padding: 4, maxWidth: 500, margin: "auto", mt: 8 }}>
          <Typography variant="h6" gutterBottom>
            Common Math Symbols
          </Typography>
          <Grid container spacing={2}>
            {commonMathSymbols.map((symbol, index) => (
              <Grid item xs={4} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleMathPaletteClick(symbol)}
                >
                  {symbol}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={closeMathPalette}>Close</Button>
          </Box>
        </Paper>
      </Modal>
      {/* Preview Modal */}
      <Modal open={isPreviewModalOpen} onClose={closePreviewModal}>
        <Paper sx={{ padding: 4, maxWidth: 600, margin: "auto", mt: 8 }}>
          <Typography variant="h5" gutterBottom>
            Preview Questions
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {homeworkData.questions.length === 0 ? (
              <Typography>No questions added yet.</Typography>
            ) : (
              homeworkData.questions.map((q, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Q: {q.question}</Typography>
                  {q.type === "multipleChoice" && (
                    <>
                      {q.option1 && <Typography>1. {q.option1}</Typography>}
                      {q.option2 && <Typography>2. {q.option2}</Typography>}
                      {q.option3 && <Typography>3. {q.option3}</Typography>}
                      {q.option4 && <Typography>4. {q.option4}</Typography>}
                    </>
                  )}
                  {q.type === "trueFalse" && (
                    <>
                      <Typography>1. {q.option1}</Typography>
                      <Typography>2. {q.option2}</Typography>
                    </>
                  )}
                  {(q.type === "multipleChoice" || q.type === "trueFalse") && (
                    <Typography>
                      <strong>Correct Answer: {getCorrectAnswerText(q)}</strong>
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Box>
          <Button
            variant="contained"
            onClick={closePreviewModal}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default AddHomeworkData;
