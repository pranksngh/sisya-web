
import { Box } from '@mui/material';
import React from 'react';
import CoursePurchaseListData from '../../components/Tables/CoursePurchaseData';


function CoursePurchaseList(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <CoursePurchaseListData/>
            </Box>
      );
}

export default CoursePurchaseList;