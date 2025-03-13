// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   Tabs,
//   Tab,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   CircularProgress,
//   Box,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
// } from "@mui/material";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import { toast } from "react-toastify"; // if you're using toast for error messages

// const AssignedCourseDetailData = () => {
//   const location = useLocation();
//   const { courseId } = location.state || {};
//   const [courseData, setCourseData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);
//   const [enrolledStudents, setEnrolledStudents] = useState([]);
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);

//   // Fetch course data
//   const fetchCourseData = async () => {
//     try {
//       const response = await fetch(
//         "https://sisyabackend.in/student/get_bg_course_by_id",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ id: courseId }),
//         }
//       );
//       const result = await response.json();
//       console.log(result);
//       if (result.success) {
//         setCourseData(result.courses[0]);
//       }
//     } catch (error) {
//       console.error("Error fetching course data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch enrolled students
//   const fetchEnrolledStudents = async () => {
//     try {
//       const response = await fetch(
//         "https://sisyabackend.in/teacher/get_users_per_course",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ bigCourseId: courseId }),
//         }
//       );
//       const result = await response.json();
//       console.log("first", result);
//       console.log("Enrolled Students API Response:", result);
//       if (result.success && result.users) {
//         setEnrolledStudents(result.users);
//       } else {
//         setEnrolledStudents([]);
//         toast.error(result.message || "Failed to fetch enrolled students");
//       }
//     } catch (error) {
//       console.error("Error fetching enrolled students:", error);
//       toast.error("Error fetching enrolled students");
//     }
//   };

//   // Call both fetch functions once courseId is available
//   useEffect(() => {
//     if (courseId) {
//       fetchCourseData();
//       fetchEnrolledStudents();
//     }
//   }, [courseId]);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const formatDate = (dateString) => {
//     const options = { day: "numeric", month: "short", year: "numeric" };
//     return new Date(dateString).toLocaleDateString("en-GB", options);
//   };

//   const formatTime = (dateString) => {
//     const options = { hour: "numeric", minute: "2-digit", hour12: true };
//     return new Date(dateString).toLocaleTimeString("en-US", options);
//   };

//   // Filter sessions based on their status
//   const sessions = courseData?.session || [];
//   const completedSessions = sessions.filter((session) => session.isDone);
//   const ongoingSessions = sessions.filter((session) => session.isGoingOn);
//   const upcomingSessions = sessions.filter(
//     (session) =>
//       !session.isDone &&
//       !session.isGoingOn &&
//       new Date(session.startTime) > new Date()
//   );

//   // Handler to fetch attendance for a session
//   const handleAttendance = async (sessionId) => {
//     try {
//       const response = await fetch(
//         "https://sisyabackend.in/teacher/get_session_attendance_student_list",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ sessionId }),
//         }
//       );
//       const result = await response.json();
//       console.log(result);
//       if (result.success) {
//         setAttendanceData(result.students);
//         setOpenAttendanceDialog(true);
//       } else {
//         toast.error(result.message || "Failed to fetch attendance data");
//       }
//     } catch (error) {
//       console.error("Error fetching attendance data:", error);
//       toast.error("Error fetching attendance data");
//     }
//   };

//   if (!courseId)
//     return <Typography variant="h6">No course selected</Typography>;
//   if (loading)
//     return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;

//   return (
//     <>
//       <Paper sx={{ p: 3, m: 2 }}>
//         <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
//           {courseData?.name || "Course Details"}
//         </Typography>

//         <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
//           <Tab label={`Upcoming (${upcomingSessions.length})`} />
//           <Tab label={`Ongoing (${ongoingSessions.length})`} />
//           <Tab label={`Completed (${completedSessions.length})`} />
//         </Tabs>

//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>ID</TableCell>
//                 <TableCell>Session Detail</TableCell>
//                 <TableCell>Date</TableCell>
//                 <TableCell>Start Time</TableCell>
//                 <TableCell>End Time</TableCell>
//                 <TableCell align="center">Attendance</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {(tabValue === 0
//                 ? upcomingSessions
//                 : tabValue === 1
//                 ? ongoingSessions
//                 : completedSessions
//               ).map((session) => (
//                 <TableRow key={session.id}>
//                   <TableCell>{session.id}</TableCell>
//                   <TableCell>{session.detail}</TableCell>
//                   <TableCell>{formatDate(session.startTime)}</TableCell>
//                   <TableCell>{formatTime(session.startTime)}</TableCell>
//                   <TableCell>{formatTime(session.endTime)}</TableCell>
//                   <TableCell align="center">
//                     <IconButton
//                       onClick={() => handleAttendance(session.id)}
//                       color="primary"
//                     >
//                       <VisibilityIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {((tabValue === 0 && upcomingSessions.length === 0) ||
//                 (tabValue === 1 && ongoingSessions.length === 0) ||
//                 (tabValue === 2 && completedSessions.length === 0)) && (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center">
//                     <Box py={3}>
//                       <Typography variant="body1">
//                         No sessions found in this category
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       <Dialog
//         open={openAttendanceDialog}
//         onClose={() => setOpenAttendanceDialog(false)}
//       >
//         <DialogTitle>Attendance Details</DialogTitle>
//         <DialogContent>
//           <Typography variant="body1" gutterBottom>
//             Total Enrolled: {enrolledStudents.length}
//           </Typography>
//           <Typography variant="body1" gutterBottom>
//             Present: {attendanceData ? attendanceData.length : 0}
//           </Typography>
//           <Typography variant="body1" gutterBottom>
//             Absent:{" "}
//             {enrolledStudents.length -
//               (attendanceData ? attendanceData.length : 0)}
//           </Typography>
//           {/* You can also list the names/details of present students if needed */}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default AssignedCourseDetailData;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";

const AssignedCourseDetailData = () => {
  const location = useLocation();
  const { courseId } = location.state || {};
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [attendanceTab, setAttendanceTab] = useState(0); // 0 for Present, 1 for Absent

  // Fetch course data
  const fetchCourseData = async () => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/student/get_bg_course_by_id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: courseId }),
        }
      );
      const result = await response.json();
      console.log(result);
      if (result.success) {
        setCourseData(result.courses[0]);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled students
  const fetchEnrolledStudents = async () => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/teacher/get_users_per_course",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bigCourseId: courseId }),
        }
      );
      const result = await response.json();
      console.log("Enrolled Students API Response:", result);
      if (result.success && result.users) {
        setEnrolledStudents(result.users);
      } else {
        setEnrolledStudents([]);
        toast.error(result.message || "Failed to fetch enrolled students");
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      toast.error("Error fetching enrolled students");
    }
  };

  // Call both fetch functions once courseId is available
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchEnrolledStudents();
    }
  }, [courseId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  // Filter sessions based on their status
  const sessions = courseData?.session || [];
  const completedSessions = sessions.filter((session) => session.isDone);
  const ongoingSessions = sessions.filter((session) => session.isGoingOn);
  const upcomingSessions = sessions.filter(
    (session) =>
      !session.isDone &&
      !session.isGoingOn &&
      new Date(session.startTime) > new Date()
  );

  // Handler to fetch attendance for a session
  const handleAttendance = async (sessionId) => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/teacher/get_session_attendance_student_list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setAttendanceData(result.students);
        setAttendanceTab(0); 
        setOpenAttendanceDialog(true);
      } else {
        toast.error(result.message || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Error fetching attendance data");
    }
  };

  const absentStudents =
    attendanceData && enrolledStudents.length
      ? enrolledStudents.filter(
          (student) =>
            !attendanceData.some(
              (presentStudent) => presentStudent.id === student.id
            )
        )
      : [];

  if (!courseId)
    return <Typography variant="h6">No course selected</Typography>;
  if (loading)
    return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;

  return (
    <>
      <Paper sx={{ p: 3, m: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          {courseData?.name || "Course Details"}
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label={`Upcoming (${upcomingSessions.length})`} />
          <Tab label={`Ongoing (${ongoingSessions.length})`} />
          <Tab label={`Completed (${completedSessions.length})`} />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Session Detail</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell align="center">Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(tabValue === 0
                ? upcomingSessions
                : tabValue === 1
                ? ongoingSessions
                : completedSessions
              ).map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.id}</TableCell>
                  <TableCell>{session.detail}</TableCell>
                  <TableCell>{formatDate(session.startTime)}</TableCell>
                  <TableCell>{formatTime(session.startTime)}</TableCell>
                  <TableCell>{formatTime(session.endTime)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleAttendance(session.id)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {((tabValue === 0 && upcomingSessions.length === 0) ||
                (tabValue === 1 && ongoingSessions.length === 0) ||
                (tabValue === 2 && completedSessions.length === 0)) && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={3}>
                      <Typography variant="body1">
                        No sessions found in this category
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Attendance Details Dialog */}
      <Dialog
        open={openAttendanceDialog}
        onClose={() => setOpenAttendanceDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Attendance Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Total Enrolled: {enrolledStudents.length}
          </Typography>

          <Tabs
            value={attendanceTab}
            onChange={(e, newValue) => setAttendanceTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab
              label={`Present (${attendanceData ? attendanceData.length : 0})`}
            />
            <Tab label={`Absent (${absentStudents.length})`} />
          </Tabs>

          {attendanceTab === 0 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Board</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData && attendanceData.length ? (
                    attendanceData.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>{student.board || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No present students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {attendanceTab === 1 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Board</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {absentStudents && absentStudents.length ? (
                    absentStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>{student.board || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No absent students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssignedCourseDetailData;
