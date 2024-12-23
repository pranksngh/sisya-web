import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Checkbox, Divider, FormControlLabel, FormHelperText, Grid, Link, InputAdornment, IconButton, InputLabel, OutlinedInput, Stack, Typography, Backdrop, CircularProgress, FormControl, Radio, RadioGroup } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Logo from '../assets/images/logo.png';
import BackgroundImage from '../assets/images/loginBackground.jpg';
import { useNavigate } from 'react-router-dom';
import { hrlogin, login, mentorlogin, teacherlogin } from '../Functions/Login';
export default function AuthLogin() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const navigate = useNavigate();
  // Use the login function from context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('admin');
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };
  const handleLogin = async (username,password) => {
    console.log(selectedRole);
    setLoading(true);

    if(selectedRole === "admin"){
      adminLogin(username,password);
    }else if(selectedRole === "teacher"){
      teacherLogin(username,password);
    }else if(selectedRole === "mentor"){
      mentorLogin(username,password);
    }else if(selectedRole ==="hr"){
      HRlogin(username,password)
    }
   

   
    

      // Redirect based on user role
      
  

    
  };

  const adminLogin = async(username, password)=>{
    
      const response = await login(username,password);

      if(response.success){
        setLoading(false);
        navigate('/dashboard/admin');
      }else{
        console.log("Admin Login Error: ", response.error);
        setLoading(false);
      }

    
    
  }

  const teacherLogin = async(username, password)=>{
    console.log("hitting teacher login");
    const response = await teacherlogin(username,password);

    if(response.success){
      setLoading(false);
      console.log("teacher login successfull", JSON.stringify(response));
      navigate('/dashboard/teacher');
    }else{
      console.log("Teacher Login Error: ", response.error);
      setLoading(false);
    }
  }

  const mentorLogin = async(username,password)=>{
    const response = await mentorlogin(username,password);

    if(response.success){
      setLoading(false);
     return navigate('/dashboard/mentor');
    }else{
      console.log("Teacher Login Error: ", response.error);
      setLoading(false);
    }

  }
  const HRlogin = async(username,password)=>{
    const response = await hrlogin(username,password);

    if(response.success){
      setLoading(false);
     return navigate('/dashboard/hr');
    }else{
      console.log("HR Login Error: ", response.error);
      setLoading(false);
    }

  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Loading screen */}
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Left Image Section */}
      <Grid item xs={12} md={7} 
      
      sx={{
        display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          padding: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            backgroundImage: `url(${BackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.7, // Adjust this value to reduce or increase opacity
            zIndex: 1,
          },
          zIndex: 2,
      }}
      >
        <Stack alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
          {/* Dummy Logo and Branding Text */}
          <Typography variant="h3" sx={{ fontWeight: 'bold', color:'#0f0f0f'}}>Interactive Live Classes</Typography>
          <Typography variant="body1" align="center" sx={{color:'#0f0f0f'}}>
           Unlock your potential with Expert Teachers
          </Typography>
         
        </Stack>
      </Grid>

      {/* Right Login Form Section */}
      <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
        <Stack spacing={3} sx={{ width: '100%', maxWidth: 360 }}>
        <img src={Logo} alt="Company Logo" style={{ width: '120px', height: '120px', marginBottom: '16px' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Welcome Back!</Typography>
         

          {/* Formik for form handling */}
          <Formik
            initialValues={{
              email: '',
              password: '',
              submit: null
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string()
              .required('Username, email, or phone number is required')
              .test(
                'valid-identifier',
                'Must be a valid username, email, or phone number',
                (value) =>
                  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || // Valid email
                  /^\d{10}$/.test(value) || // Valid phone number
                  /^[a-zA-Z0-9_]+$/.test(value) // Valid username (alphanumeric)
              ),
              password: Yup.string().max(255).required('Password is required')
            })}
            onSubmit={(values) => {
              handleLogin(values.email, values.password); // Only set this once in Formik
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  {/* Email Input */}
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
                      sx={{
                        paddingY: 0,
                        fontSize: '0.875rem',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#c4c4c4',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                        },
                        '& .MuiInputBase-input': {
                          padding: '9px',
                        },
                      }}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error>{errors.email}</FormHelperText>
                    )}
                  </Stack>

                  {/* Password Input */}
                  <Stack spacing={1}>
                    <InputLabel htmlFor="password-login">Password</InputLabel>
                    <OutlinedInput
                      id="password-login"
                      type={showPassword ? 'text' : 'password'}
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
                      sx={{
                        paddingY: 0,
                        fontSize: '0.875rem',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#c4c4c4',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                        },
                        '& .MuiInputBase-input': {
                          padding: '9px',
                        },
                      }}
                    />
                    {touched.password && errors.password && (
                      <FormHelperText error>{errors.password}</FormHelperText>
                    )}
                  </Stack>
                  {/* Role Selection */}
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      aria-label="user-role"
                      name="user-role"
                      value={selectedRole}
                      onChange={handleRoleChange}
                    >
                      {['admin', 'teacher', 'mentor','hr'].map((role) => (
                        <FormControlLabel
                          key={role}
                          value={role}
                          control={<Radio color="primary" />}
                          label={role === "admin"? "Admin": role ==="teacher"?"Teacher":role ==="mentor"?"Mentor":"HR"}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>

                  {/* Keep Me Signed In and Forgot Password */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(event) => setChecked(event.target.checked)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Keep me signed in</Typography>}
                    />
                    <Link variant="body2" component={RouterLink} to="/forgot-password" sx={{ fontSize: '0.875rem' }}>
                      Forgot Password?
                    </Link>
                  </Stack>

                  {/* Submit Button */}
                  <Button
                    disableElevation
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      height: '45px',
                      fontWeight: 'bold',
                    }}
                  >
                    Login Now
                  </Button>
                   

                  {/* Social Login Divider */}
                  {/* <Divider sx={{ my: 2 }}>
                    <Typography variant="caption">or login with</Typography>
                  </Divider> */}

                  {/* Social Login Button */}
                  {/* <Button variant="outlined" fullWidth sx={{ color: 'text.primary', borderColor: '#c4c4c4' }}>
                    Login with Google
                  </Button> */}
                </Stack>
              </form>
            )}
          </Formik>
        </Stack>
      </Grid>
    </Grid>
  );
}
