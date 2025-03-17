import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Button,
  Backdrop,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  IconButton,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Snackbar,
  Alert,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as Yup from "yup";
import { Formik } from "formik";
import Logo from "../assets/images/logo.png";
import BackgroundImage from "../assets/images/loginBackground.jpg";
import { hrlogin, login, mentorlogin, teacherlogin } from "../Functions/Login";

export default function AuthLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const showToast = (message, severity = "error") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      if (selectedRole === "admin") {
        await adminLogin(username, password);
      } else if (selectedRole === "teacher") {
        await teacherLogin(username, password);
      } else if (selectedRole === "mentor") {
        await mentorLogin(username, password);
      } else if (selectedRole === "hr") {
        await HRlogin(username, password);
      }
    } catch (error) {
      showToast("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  const adminLogin = async (username, password) => {
    const response = await login(username, password);
    setLoading(false);

    if (response.success) {
      console.log("redirecting to dashboard to admin")
      navigate("/dashboard/admin");
    } else {
    console.log(JSON.stringify(response));
      showToast(response.error || "Admin Login Failed.");
    }
  };

  const teacherLogin = async (username, password) => {
    const response = await teacherlogin(username, password);
    setLoading(false);

    if (response.success) {
      console.log(response);
      if (response.mentor.isActive) {
        try {
          // Mark login API call
          await fetch("https://sisyabackend.in/teacher/mark_login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ mentorId: response.mentor.id }),
          });
        } catch (error) {
          console.error("Error marking login:", error);
        }
        
        navigate("/dashboard/teacher");
      } else {
        showToast("Teacher is not activated");
      }
    } else {
      showToast(response.error || "Teacher Login Failed.");
    }
  };

  const mentorLogin = async (username, password) => {
    const response = await mentorlogin(username, password);
    setLoading(false);

    if (response.success) {
      navigate("/dashboard/mentor");
    } else {
      showToast(response.error || "Mentor Login Failed.");
    }
  };

  const HRlogin = async (username, password) => {
    const response = await hrlogin(username, password);
    setLoading(false);

    if (response.success) {
      navigate("/dashboard/hr");
    } else {
      showToast(response.error || "HR Login Failed.");
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Backdrop for Loading */}
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Left Image Section */}
      <Grid
        item
        xs={12}
        md={7}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          padding: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            backgroundImage: `url(${BackgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.7,
            zIndex: 1,
          },
          zIndex: 2,
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
          sx={{ position: "relative", zIndex: 2 }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", color: "#0f0f0f" }}
          >
            Interactive Live Classes
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: "#0f0f0f" }}>
            Unlock your potential with Expert Teachers
          </Typography>
        </Stack>
      </Grid>

      {/* Right Login Form Section */}
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
        }}
      >
        <Stack spacing={3} sx={{ width: "100%", maxWidth: 360 }}>
          <img
            src={Logo}
            alt="Company Logo"
            style={{ width: "120px", height: "120px", marginBottom: "16px" }}
          />
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Welcome Back!
          </Typography>

          {/* Formik for Form Handling */}
          <Formik
            initialValues={{
              email: "",
              password: "",
              submit: null,
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string()
                .required("Username, email, or phone number is required")
                .test(
                  "valid-identifier",
                  "Must be a valid username, email, or phone number",
                  (value) =>
                    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || // Email
                    /^\d{10}$/.test(value) || // Phone number
                    /^[a-zA-Z0-9_]+$/.test(value) // Username
                ),
              password: Yup.string().max(255).required("Password is required"),
            })}
            onSubmit={(values) => {
              handleLogin(values.email, values.password);
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              values,
            }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-login">Email Address</InputLabel>
                    <OutlinedInput
                      id="email-login"
                      type="email"
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      fullWidth
                      error={Boolean(touched.email && errors.email)}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error>{errors.email}</FormHelperText>
                    )}
                  </Stack>

                  <Stack spacing={1}>
                    <InputLabel htmlFor="password-login">Password</InputLabel>
                    <OutlinedInput
                      id="password-login"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter password"
                      fullWidth
                      error={Boolean(touched.password && errors.password)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {touched.password && errors.password && (
                      <FormHelperText error>{errors.password}</FormHelperText>
                    )}
                  </Stack>

                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      aria-label="user-role"
                      name="user-role"
                      value={selectedRole}
                      onChange={handleRoleChange}
                    >
                      {["admin", "teacher", "mentor", "hr"].map((role) => (
                        <FormControlLabel
                          key={role}
                          value={role}
                          control={<Radio color="primary" />}
                          label={role.charAt(0).toUpperCase() + role.slice(1)}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Button
                    disableElevation
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 2, height: "45px", fontWeight: "bold" }}
                  >
                    Login Now
                  </Button>
                </Stack>
              </form>
            )}
          </Formik>
        </Stack>
      </Grid>
    </Grid>
  );
}
