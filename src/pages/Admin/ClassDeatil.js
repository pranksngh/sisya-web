import { Box } from '@mui/material';
import ClassDetailData from '../../components/Tables/ClassDetailData';



function ClassDetail(){

    return (
      <Box
        sx={{
          paddingLeft: "15px",
          paddingRight: "15px",
          width: "95%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
          alignContent: "center",
        }}
      >
        <ClassDetailData />
      </Box>
    );
}

export default ClassDetail;