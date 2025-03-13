import { Box } from "@mui/material";
import AssignedCourseData from "../../components/Tables/AssignedCourseData";


const AssignedCourse = () => {
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
      <AssignedCourseData/>
    </Box>
  );
}

export default AssignedCourse;