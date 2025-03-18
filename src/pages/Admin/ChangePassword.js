import { Box } from "@mui/material";
import ChangePasswordData from "../../components/ChangePasswordData";

const ChangePassword = () => {
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
      <ChangePasswordData/>
    </Box>
  );
};

export default ChangePassword;
