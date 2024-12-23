
import { Box } from '@mui/material';
import React from 'react';
import CourseData from '../../components/Tables/CourseData';


function Courses(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <CourseData/>
            </Box>
      );
}

export default Courses;