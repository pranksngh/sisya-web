
import { Box } from '@mui/material';
import React from 'react';
import MentorLeavesData from '../../components/Tables/MentorLeavesData';


function MentorLeaves(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <MentorLeavesData/>
            </Box>
      );
}

export default MentorLeaves;