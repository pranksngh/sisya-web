
import { Box } from '@mui/material';
import React from 'react';
import SalesMentorListData from '../../components/Tables/SalesMentorListData';


function SalesMentorList(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <SalesMentorListData/>
            </Box>
      );
}

export default SalesMentorList;