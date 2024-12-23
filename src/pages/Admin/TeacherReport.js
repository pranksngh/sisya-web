
import { Box } from '@mui/material';
import React from 'react';
import TeacherReportData from '../../components/Tables/TeacherReportData';


function TeacherReport(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <TeacherReportData/>
            </Box>
      );
}

export default TeacherReport;