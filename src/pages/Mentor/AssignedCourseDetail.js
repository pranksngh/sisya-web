import { Box } from "@mui/material";
import AssignedCourseDetailData from "../../components/Tables/AssignedCourseDetailData";


const AssignedCourseDetail = () => {
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
      <AssignedCourseDetailData/>
    </Box>
  );
}

export default AssignedCourseDetail