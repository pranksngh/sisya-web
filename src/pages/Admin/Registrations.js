
import { Box } from '@mui/material';
import React from 'react';
import DoubtsData from '../../components/Tables/DoubtsData';
import EnquiryData from '../../components/Tables/EnquiryData';
import RegistrationData from '../../components/Tables/RegistrationData';


function Registration(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <RegistrationData/>
            </Box>
      );
}

export default Registration;