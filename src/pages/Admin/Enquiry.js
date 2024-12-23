
import { Box } from '@mui/material';
import React from 'react';
import DoubtsData from '../../components/Tables/DoubtsData';
import EnquiryData from '../../components/Tables/EnquiryData';


function Enquiry(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <EnquiryData/>
            </Box>
      );
}

export default Enquiry;