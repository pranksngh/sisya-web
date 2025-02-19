import React, { useState } from 'react';
import { Box, TextField, Button, Snackbar, Alert, Typography } from '@mui/material';
import { getUser } from '../../Functions/Login';

function ChangePassword() {
    const user = getUser();
    const [formData, setFormData] = useState({
        existingPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // "success" or "error"
    const [openToast, setOpenToast] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.existingPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage('All fields are required');
            setMessageType('error');
            setOpenToast(true);
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('New password and confirm password do not match');
            setMessageType('error');
            setOpenToast(true);
            return;
        }

        try {
            // API Call
            const response = await fetch('https://sisyabackend.in/teacher/update_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.mentor.id,
                    newPass: formData.newPassword,
                    currentPass: formData.existingPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password changed successfully');
                setMessageType('success'); // ✅ This ensures the toast color is green
                setFormData({
                    existingPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                setMessage(data.message || 'Failed to update password');
                setMessageType('error'); // ❌ This ensures the toast color is red
            }
        } catch (error) {
            setMessage('Error connecting to the server');
            setMessageType('error');
        }

        setOpenToast(true);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        }}>
            <Box sx={{
                width: '550px',
                p: 3,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: '#fff',
                textAlign: 'center',
            }}>
                <Typography variant="h6" gutterBottom>Change Password</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Existing Password"
                        name="existingPassword"
                        type="password"
                        value={formData.existingPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Submit
                    </Button>
                </form>
            </Box>

            {/* Success/Error Toast */}
            <Snackbar open={openToast} autoHideDuration={3000} onClose={() => setOpenToast(false)}>
                <Alert severity={messageType} onClose={() => setOpenToast(false)}>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ChangePassword;
