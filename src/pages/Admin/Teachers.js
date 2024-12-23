
import { Box } from '@mui/material';
import React from 'react';
import SubjectData from '../../components/Tables/SubjectData';
import TeacherData from '../../components/Tables/TeacherData';



function Teachers(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
          <TeacherData/>
            </Box>
      );
}

export default Teachers;