
import { Box } from '@mui/material';
import React from 'react';
import EnrolledCoursesData from '../../components/Tables/EnrolledCoursesData';
import AddHomeworkData from '../../components/Tables/AddHomeWorkData';
import AddQuizTestData from '../../components/Tables/AddQuizTestData';


function AddQuiz(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <AddQuizTestData/>
            </Box>
      );
}

export default AddQuiz;