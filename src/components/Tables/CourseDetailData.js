import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Grid,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Paper,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getUser } from "../../Functions/Login";
import HomeworkQuestionsModal from "../DialogBoxes/ViewHomeWorkDialog";

const COLORS = ["#36A2EB", "#FF6384"];

const CourseDetailsData = () => {
  const user = getUser();
  const location = useLocation();
  const { courseId } = location.state || {};
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
  const [homeworkModalOpen, sethomeworkModalOpen] = useState(false);

  console.log("course Id is ", courseId);
  console.log(course);

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
      if (result.success) {
        const courseData = result.courses[0] || {};
        setCourse({
          ...courseData,
          session: courseData.session || [], // Ensure session is an array
          ctest: courseData.ctest || [], // Ensure ctest is an array
        });
        if (courseData.session && courseData.session.length > 0) {
          fetchAttendanceData(courseData.session); // Fetch attendance for sessions
        }

        console.log("course data is " + JSON.stringify(courseData));
      } else {
        setCourse({});
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setCourse({});
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
          body: JSON.stringify({ bigCourseId: courseId }), // Send bigCourseId as expected
        }
      );
      const result = await response.json();

      // Debug the result to verify its structure
      console.log("Enrolled Students API Response:", result);

      if (result.success && result.users) {
        setEnrolledStudents(result.users); // Set enrolled students data
      } else {
        setEnrolledStudents([]);
        toast.error(result.message || "Failed to fetch enrolled students");
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      toast.error("Error fetching enrolled students");
    }
  };

  const fetchAttendanceData = async (sessions) => {
    // Your fetch logic...
  };

  const startSession = async (sessionId, session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : null;

    // const joinAllowedTime = new Date(startTime.getTime() - 30 * 60 * 1000);

    // if (now < joinAllowedTime) {
    //   console.log("toooo early");
    //   toast.error(
    //     `Class will start at ${startTime.toLocaleTimeString()}. You are only allowed to join 30 minutes prior to class.`
    //   );
    //   return;
    // }

    // if (endTime && now > endTime) {
    //   console.log("too late!!!!");
    //   toast.error("Class time already passed.");
    //   return;
    // }

    // // if joining on correct time
    // setLoading(true);

    try {
      const response = await fetch(
        "https://sisyabackend.in/teacher/start_session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mentorId, sessionId }),
        }
      );

      const result = await response.json();
      setLoading(false);

      if (result.success) {
        const streamInfo = result.streamInfo;
        navigate("../../liveclassroom", {
          state: {
            streamInfo,
            mentorId,
            sessionId,
          },
        });
      } else {
        alert("Failed to start session");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error starting session:", error);
      alert("Error starting session");
    }
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
    { name: "Completed", value },
    { name: "Remaining", value: 100 - value },
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

  const openModal = (sessionTestQuestions) => {
    setSelectedSessionTest(sessionTestQuestions);
    sethomeworkModalOpen(true);
  };

  const closehomeworkModal = () => {
    sethomeworkModalOpen(false);
    setSelectedSessionTest([]);
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/get_user_by_id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userId }),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };
  const fetchAttendeeUserList = async (attendeeList) => {
    const userList = await Promise.all(
      attendeeList.map((userId) => fetchUserDetails(userId))
    );
    return userList.filter((user) => user !== null);
  };

  const viewRecords = async (attendeeList) => {
    if (!Array.isArray(attendeeList) || attendeeList.length === 0) {
      toast.info("No records found");
      return;
    }

    const userList = await fetchAttendeeUserList(attendeeList);

    if (userList.length === 0) {
      toast.info("No records found");
    } else {
      setAttendeeUserList(userList);
      setIsUserListModalOpen(true);
    }
  };

  return (
    <div className="course-details-container" style={{ padding: "20px" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2" }}
      >
        Course Details
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Course Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enrolled Students
              </Typography>
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
                    {getPieData(enrolledStudents.length || 0).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Sessions
              </Typography>
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
                    {getPieData(course.session?.length || 0).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Tests
              </Typography>
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
                    {getPieData(course.ctest?.length || 0).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 4 }}
      >
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Class Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {course.session.length > 0 ? (
                course.session.map((session, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{session.detail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.startTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          session.isGoingOn
                            ? "Ongoing"
                            : session.isDone
                            ? "Completed"
                            : "Yet to Start"
                        }
                        color={
                          session.isGoingOn
                            ? "success"
                            : session.isDone
                            ? "default"
                            : "warning"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color={session.isDone ? "success" : "primary"}
                        size="small"
                        onClick={() => startSession(session.id, session)}
                        disabled={session.isDone}
                      >
                        {session.isDone ? "Completed" : "Join Now"}
                      </Button>
                      {session.isDone === false &&
                      session.isGoingOn === false ? (
                        <Button
                          sx={{
                            marginLeft: "4px;",
                          }}
                          variant="contained"
                          color={session.isDone ? "success" : "primary"}
                          size="small"
                          onClick={() =>
                            navigate("/dashboard/edit-session", {
                              state: {
                                sessionInfo: session,
                                courseInfo: course,
                              },
                            })
                          }
                        >
                          Edit
                        </Button>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No Classes Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {/* Content for Homework Tab */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Class Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Homework Status</TableCell>
                <TableCell>Submission Record</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {course.session.length > 0 ? (
                course.session.map((session, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{session.detail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.startTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          session.SessionTest?.length > 0
                            ? "Available"
                            : "Not Available"
                        }
                        color={
                          session.SessionTest?.length > 0
                            ? "warning"
                            : "success"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {session.submittedCount ? session.submittedCount : 0}
                    </TableCell>
                    <TableCell>
                      {session.SessionTest?.length > 0 ? (
                        <Button
                          variant="contained"
                          color={session.isDone ? "success" : "primary"}
                          size="small"
                          onClick={() =>
                            openModal(
                              session.SessionTest[0].sessionTestQuestion
                            )
                          }
                        >
                          View
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color={session.isDone ? "success" : "primary"}
                          size="small"
                          onClick={() =>
                            navigate("../add-homework", { state: { session } })
                          }
                          Add
                          Homework
                        >
                          Add Homework
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No Session Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {/* Content for Attendance Tab */}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Class Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Present Record</TableCell>
                <TableCell>Absend Record</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {course.session.length > 0 ? (
                course.session.map((session, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{session.detail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.startTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>{session.attendedCount || 0}</TableCell>
                    <TableCell>{session.absentCount || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color={session.isDone ? "success" : "primary"}
                        size="small"
                        onClick={() => viewRecords(session.atendeeList)}
                      >
                        View Records
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No Session Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        {/* Content for Course Tests Tab */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="div">
            Course Tests
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              console.log("course data is", JSON.stringify(course));
              navigate("../add-test", { state: { course } });
            }}
          >
            Add Test
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Class Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Submissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {course.ctest.length > 0 ? (
                course.ctest.map((test, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{test.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {test.startDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {test.endDate}
                      </Typography>
                    </TableCell>
                    <TableCell>{test.Duration || 0} Mins</TableCell>
                    <TableCell>{0}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No Classes Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <HomeworkQuestionsModal
        selectedSessionTest={selectedSessionTest}
        open={homeworkModalOpen}
        onClose={closehomeworkModal}
      />

       <ToastContainer 
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    </div>
  );
};

export default CourseDetailsData;
