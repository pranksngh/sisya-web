
import { Box } from '@mui/material';
import React from 'react';
import LeadManagerData from '../../components/Tables/LeadMangerData';


function LeadManager(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <LeadManagerData/>
            </Box>
      );
}

export default LeadManager;