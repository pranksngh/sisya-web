
import { Box } from '@mui/material';
import React from 'react';
import DoubtsData from '../../components/Tables/DoubtsData';
import PushNotificationData from '../../components/Tables/PushNotificationData';


function PushNotification(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <PushNotificationData/>
            </Box>
      );
}

export default PushNotification;