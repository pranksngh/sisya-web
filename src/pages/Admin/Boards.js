
import { Box } from '@mui/material';
import React from 'react';
import BoardData from '../../components/Tables/BoardData';


function Boards(){

    return (
        <Box sx={{ paddingLeft:'15px', paddingRight:'15px',  width: '95%', flexDirection: 'column', justifyContent:'center', alignItems:'center' ,alignSelf:'center', alignContent:'center' }}>
             <BoardData/>
            </Box>
      );
}

export default Boards;