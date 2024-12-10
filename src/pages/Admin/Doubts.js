
import { Box } from '@mui/material';
import React from 'react';
import DoubtsData from '../../components/Tables/DoubtsData';


function Doubts(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <DoubtsData/>
            </Box>
      );
}

export default Doubts;