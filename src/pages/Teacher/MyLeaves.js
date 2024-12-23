
import { Box } from '@mui/material';
import React from 'react';

import MyLeaveRequestData from '../../components/Tables/MyLeaveData';


function MyLeaves(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <MyLeaveRequestData/>
            </Box>
      );
}

export default MyLeaves;