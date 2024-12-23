
import { Box } from '@mui/material';
import React from 'react';
import MentorLeavesData from '../../components/Tables/MentorLeavesData';
import TeacherLeavesData from '../../components/Tables/TeacherLeavesData';


function TeacherLeaves(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <TeacherLeavesData/>
            </Box>
      );
}

export default TeacherLeaves;