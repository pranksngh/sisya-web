
import { Box } from '@mui/material';
import React from 'react';
import MentorListData from '../../components/Tables/MentorListData';
import MentorProfileData from '../../components/Tables/MentorProfileData';


function MentorProfile(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <MentorProfileData/>
            </Box>
      );
}

export default MentorProfile;