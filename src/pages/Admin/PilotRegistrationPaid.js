
import { Box } from '@mui/material';
import React from 'react';
import PilotRegistrationPaidData from '../../components/Tables/PilotRegistrationPaidData';



function PilotRegistrationPaid(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
          <PilotRegistrationPaidData/>
            </Box>
      );
}

export default PilotRegistrationPaid;