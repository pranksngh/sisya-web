
import { Box } from '@mui/material';
import React from 'react';
import EditClassData from '../../components/Tables/EditClassData';


function EditClass(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <EditClassData/>
            </Box>
      );
}

export default EditClass;