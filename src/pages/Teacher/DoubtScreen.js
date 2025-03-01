
import { Box } from '@mui/material';
import React from 'react';
import ChatLayoutData from '../../components/Tables/ChatLayoutData';
import DoubtScreenLayoutData from '../../components/Tables/DoubtScreenLayoutData';


function DoubtScreen(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <DoubtScreenLayoutData/>
            </Box>
      );
}

export default DoubtScreen;