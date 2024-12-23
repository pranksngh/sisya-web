
import { Box } from '@mui/material';
import React from 'react';
import StudentData from '../../components/Tables/StudentData';



function Students(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
          <StudentData/>
            </Box>
      );
}

export default Students;