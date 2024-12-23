
import { Box } from '@mui/material';
import React from 'react';
import GroupChatLayoutData from '../../components/Tables/GroupChatLayoutData';


function GroupChatLayout(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <GroupChatLayoutData/>
            </Box>
      );
}

export default GroupChatLayout;