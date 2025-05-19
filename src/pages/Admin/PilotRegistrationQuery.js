
import { Box } from '@mui/material';
import React from 'react';
import PilotRegistrationQueryData from "../../components/Tables/PilotRegistrationQueryData";



function PilotRegistrationQuery(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
          <PilotRegistrationQueryData/>
            </Box>
      );
}

export default PilotRegistrationQuery;