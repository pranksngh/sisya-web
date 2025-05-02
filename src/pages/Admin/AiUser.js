import { Box } from '@mui/material';
import React from 'react';
import AiUserDetail from '../../components/Tables/AiUserDetail';

function AiUser(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <AiUserDetail/>
        </Box>
      );
}

export default AiUser;