
import { Box } from '@mui/material';
import React from 'react';
import CourseDetailsData from '../../components/Tables/CourseDetailData';


function CourseDetails(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <CourseDetailsData/>
            </Box>
      );
}

export default CourseDetails;