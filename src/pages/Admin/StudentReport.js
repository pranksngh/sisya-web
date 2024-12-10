
import { Box } from '@mui/material';
import React from 'react';
import StudentReportData from '../../components/Tables/StudentReportData';


function StudentReport(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <StudentReportData/>
            </Box>
      );
}

export default StudentReport;