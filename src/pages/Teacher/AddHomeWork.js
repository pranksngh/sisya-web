
import { Box } from '@mui/material';
import React from 'react';
import EnrolledCoursesData from '../../components/Tables/EnrolledCoursesData';
import AddHomeworkData from '../../components/Tables/AddHomeWorkData';


function AddHomeWork(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <AddHomeworkData/>
            </Box>
      );
}

export default AddHomeWork;