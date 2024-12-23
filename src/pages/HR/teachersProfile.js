
import { Box } from '@mui/material';
import React from 'react';
import TeacherProfileData from '../../components/Tables/TeacherProfileData';


function TeacherProfile(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <TeacherProfileData/>
            </Box>
      );
}

export default TeacherProfile;