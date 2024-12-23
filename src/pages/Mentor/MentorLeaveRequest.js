
import { Box } from '@mui/material';
import React from 'react';
import MentorListData from '../../components/Tables/MentorListData';
import MentorLeaveRequestData from '../../components/Tables/MentorLeavesRequestData';


function MentorLeaveRequest(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <MentorLeaveRequestData/>
            </Box>
      );
}

export default MentorLeaveRequest;