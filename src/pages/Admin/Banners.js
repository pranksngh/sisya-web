
import { Box } from '@mui/material';
import React from 'react';
import BoardData from '../../components/Tables/BoardData';
import BannerData from '../../components/Tables/BannerData';


function Banners(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <BannerData/>
            </Box>
      );
}

export default Banners;