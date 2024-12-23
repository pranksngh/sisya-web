
import { Box } from '@mui/material';
import React from 'react';
import ChatLayoutData from '../../components/Tables/ChatLayoutData';


function ChatLayout(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <ChatLayoutData/>
            </Box>
      );
}

export default ChatLayout;