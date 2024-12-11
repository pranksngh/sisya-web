import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
} from '@mui/material';

const HomeworkQuestionsModal = ({ selectedSessionTest, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Homework Questions
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {selectedSessionTest && selectedSessionTest.length > 0 ? (
          selectedSessionTest.map((question, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{ p: 2, mb: 2, border: '1px solid #ddd' }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Question {index + 1}: {question.question}
              </Typography>
              <Grid container spacing={1}>
                {question.option1 && (
                  <Grid item xs={12}>
                    <Typography variant="body1">1. {question.option1}</Typography>
                  </Grid>
                )}
                {question.option2 && (
                  <Grid item xs={12}>
                    <Typography variant="body1">2. {question.option2}</Typography>
                  </Grid>
                )}
                {question.option3 && question.option3 !== '' && (
                  <Grid item xs={12}>
                    <Typography variant="body1">3. {question.option3}</Typography>
                  </Grid>
                )}
                {question.option4 && question.option4 !== '' && (
                  <Grid item xs={12}>
                    <Typography variant="body1">4. {question.option4}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No questions available.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HomeworkQuestionsModal;
