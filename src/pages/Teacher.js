import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { getUser } from '../Functions/Login';

const TeacherDashboard = () => {
   const user = getUser();
   console.log("Teachers Info", JSON.stringify(user));
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Fetch enrolled students
    const fetchEnrolledStudents = async () => {
        try {
            const response = await fetch('https://sisyabackend.in/teacher/get_my_big_course_students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mentorId: user.mentor.id })
            });
            const result = await response.json();
            console.log('Enrolled Students API Response:', result);

            if (result.success && result.endUsers) {
                // Remove duplicates based on student id
                const uniqueStudents = result.endUsers.filter(
                    (student, index, self) => index === self.findIndex((s) => s.id === student.id)
                );
                setEnrolledStudents(uniqueStudents);
            } else {
                setEnrolledStudents([]);
            }
        } catch (error) {
            console.log('Error fetching enrolled students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    // Fetch teacher's courses
    const fetchTecherCourses = async () => {
        try {
            const response = await fetch('https://sisyabackend.in/teacher/get_all_courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mentorId: user.mentor.id })
            });
            const result = await response.json();
            console.log('Enrolled Courses API Response:', result);

            if (result.success && result.bigCourses) {
                setMyCourses(result.bigCourses);
            } else {
                setMyCourses([]);
            }
        } catch (error) {
            console.log('Error fetching teacher courses:', error);
        } finally {
            setLoadingCourses(false);
        }
    };

    // Fetch data when component mounts
    useEffect(() => {
        fetchEnrolledStudents();
        fetchTecherCourses();
    },[]);

    return (
        <Box display="flex" justifyContent="space-between" gap={4} p={2}>
            {/* Courses Section */}
            <Box flex={1}>
                <Typography variant="h5" gutterBottom>My Courses</Typography>
                <Paper elevation={3}>
                    <TableContainer>
                        <Table aria-label="my-courses-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Course Name</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingCourses ? (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : myCourses.length > 0 ? (
                                    myCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>{course.name}</TableCell>
                                            <TableCell>{course.description}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">No courses available</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Students Section */}
            <Box flex={1}>
                <Typography variant="h5" gutterBottom>Enrolled Students</Typography>
                <Paper elevation={3}>
                    <TableContainer>
                        <Table aria-label="enrolled-students-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell>Email</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingStudents ? (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : enrolledStudents.length > 0 ? (
                                    enrolledStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">No students enrolled</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Box>
    );
};

export default TeacherDashboard;
