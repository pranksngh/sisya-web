
import { Box } from '@mui/material';
import React from 'react';
import AddClassData from '../../components/Tables/AddClassData';


function AddClass(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <AddClassData/>
            </Box>
      );
}

export default AddClass;