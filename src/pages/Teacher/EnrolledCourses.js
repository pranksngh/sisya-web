
import { Box } from '@mui/material';
import React from 'react';
import EnrolledCoursesData from '../../components/Tables/EnrolledCoursesData';


function EnrolledCourses(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <EnrolledCoursesData/>
            </Box>
      );
}

export default EnrolledCourses;