import { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePasswordData = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://sisyabackend.in/rkadmin/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, password }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Password changed successfully!");
      } else {
        toast.error(result.message || "Error changing password");
      }
    } catch (error) {
      toast.error("Network error, please try again.");
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        p={3}
        border={1}
        borderRadius={2}
        boxShadow={3}
        width={400}
      >
        <Typography variant="h6" fontWeight="bold">
          Change Password
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <TextField
          label="New Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleChangePassword}
          disabled={loading || !user || !password}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Change Password"}
        </Button>
      </Box>
      <ToastContainer position="top-right" />
    </Box>
  );
};

export default ChangePasswordData;
