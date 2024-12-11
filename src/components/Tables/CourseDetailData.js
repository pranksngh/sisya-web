import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Grid, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogTitle, Chip, Paper, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getUser } from '../../Functions/Login';

const COLORS = ['#36A2EB', '#FF6384'];

const CourseDetailsData = ({ courseId }) => {
    const user = getUser();
    const [course, setCourse] = useState({ session: [], ctest: [] });
    const [selectedSessionTest, setSelectedSessionTest] = useState(null);
    const [attendeeUserList, setAttendeeUserList] = useState([]);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [ctestSubmissions, setCtestSubmissions] = useState([]);
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const mentorId = user.mentor.id.toString();
    const [courseid, setCourseId] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const fetchCourseData = async () => {
        // Your fetch logic...
    };

    const fetchEnrolledStudents = async () => {
        // Your fetch logic...
    };

    const fetchAttendanceData = async (sessions) => {
        // Your fetch logic...
    };

    const startSession = async (sessionId) => {
        // Your session start logic...
    };

    const closeModal = () => {
        setSelectedSessionTest(null);
        setIsUserListModalOpen(false);
        setAttendeeUserList([]);
    };

    useEffect(() => {
        setCourseId(courseId);
        if (courseId) {
            fetchCourseData();
            fetchEnrolledStudents();
        }
    }, [courseId]);

    const getPieData = (value) => [
        { name: 'Completed', value },
        { name: 'Remaining', value: 100 - value },
    ];

    if (loading) {
        return <CircularProgress size={100} className="loading-screen" />;
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // TabPanel component to display the content of each tab
    const TabPanel = ({ value, index, children }) => {
        return value === index && <div>{children}</div>;
    };

    return (
        <div className="course-details-container" style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Course Details
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Course Stats Cards */}
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Enrolled Students</Typography>
                            <ResponsiveContainer width="100%" height={100}>
                                <PieChart>
                                    <Pie
                                        data={getPieData(enrolledStudents.length || 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={40}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {getPieData(enrolledStudents.length || 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Total Sessions</Typography>
                            <ResponsiveContainer width="100%" height={100}>
                                <PieChart>
                                    <Pie
                                        data={getPieData(course.session?.length || 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={40}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {getPieData(course.session?.length || 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Total Tests</Typography>
                            <ResponsiveContainer width="100%" height={100}>
                                <PieChart>
                                    <Pie
                                        data={getPieData(course.ctest?.length || 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={40}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {getPieData(course.ctest?.length || 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ mb: 4 }}>
                <Tab label="Enrolled Students" />
                <Tab label="Classes" />
                <Tab label="Homework" />
                <Tab label="Attendance" />
                <Tab label="Course Tests" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {enrolledStudents.length > 0 ? (
                                enrolledStudents.map((student, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.phone}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>No students enrolled</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {/* Content for Classes Tab */}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                {/* Content for Homework Tab */}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                {/* Content for Attendance Tab */}
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
                {/* Content for Course Tests Tab */}
            </TabPanel>
        </div>
    );
};

export default CourseDetailsData;
