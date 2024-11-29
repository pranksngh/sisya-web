
import { Box } from '@mui/material';
import React from 'react';
import SubjectData from '../../components/Tables/SubjectData';



function Subjects(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
          <SubjectData/>
            </Box>
      );
}

export default Subjects;