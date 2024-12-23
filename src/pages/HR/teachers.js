
import { Box } from '@mui/material';
import React from 'react';
import AddClassData from '../../components/Tables/AddClassData';
import TeacherListData from '../../components/Tables/TeachersListData';


function TeachersList(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <TeacherListData/>
            </Box>
      );
}

export default TeachersList;