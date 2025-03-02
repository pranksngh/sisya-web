// // import React, { useState, useEffect } from "react";
// // import {
// //   TextField,
// //   Card,
// //   CardContent,
// //   Typography,
// //   Autocomplete,
// //   Grid,
// // } from "@mui/material";

// // const EnrollStudent = () => {
// //   const [students, setStudents] = useState([]);
// //   const [searchText, setSearchText] = useState("");
// //   const [filteredSuggestions, setFilteredSuggestions] = useState([]);
// //   const [selectedStudent, setSelectedStudent] = useState(null);

// //   // Fetch all students
// //   useEffect(() => {
// //     const fetchStudents = async () => {
// //       try {
// //         const response = await fetch(
// //           "https://sisyabackend.in/rkadmin/get_recent_users",
// //           {
// //             method: "POST",
// //             headers: {
// //               "Content-Type": "application/json",
// //             },
// //             body: JSON.stringify({ id: 1, amount: 100 }), // Adjust API payload if needed
// //           }
// //         );

// //         const data = await response.json();
// //         if (data.studentList) {
// //           setStudents(data.studentList);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching students:", error);
// //       }
// //     };

// //     fetchStudents();
// //   }, []);

// //   // Filter suggestions as the user types
// //   useEffect(() => {
// //     if (searchText.length > 0) {
// //       const filtered = students.filter(
// //         (student) =>
// //           student.name.toLowerCase().includes(searchText.toLowerCase()) ||
// //           student.grade.toLowerCase().includes(searchText.toLowerCase())
// //       );
// //       setFilteredSuggestions(filtered);
// //     } else {
// //       setFilteredSuggestions([]);
// //     }
// //   }, [searchText, students]);

// //   const handleSearchInputChange = (event, value) => {
// //     setSearchText(value);
// //   };

// //   const handleSelectStudent = (event, value) => {
// //     if (!value) {
// //       setSelectedStudent(null);
// //       return;
// //     }

// //     const studentName = value.split(" (")[0];

// //     const student = students.find((s) => s.name === studentName);

// //     setSelectedStudent(student || null);
// //   };

// //   return (
// //     <div
// //       style={{
// //         margin: "20px",
// //         maxWidth: "600px",
// //         marginLeft: "auto",
// //         marginRight: "auto",
// //       }}
// //     >
// //       <Grid container spacing={2}>
// //         <Grid item xs={12}>
// //           <Autocomplete
// //             freeSolo
// //             options={filteredSuggestions.map(
// //               (option) => `${option.name} (${option.grade})` // Shows Name + Class
// //             )}
// //             inputValue={searchText}
// //             onInputChange={handleSearchInputChange}
// //             onChange={handleSelectStudent}
// //             renderInput={(params) => (
// //               <TextField
// //                 {...params}
// //                 label="Search by Name or Class"
// //                 variant="outlined"
// //                 fullWidth
// //               />
// //             )}
// //           />
// //         </Grid>
// //       </Grid>

// //       {selectedStudent && (
// //         <Card style={{ marginTop: "20px", maxWidth: "100%" }}>
// //           <CardContent>
// //             <Typography variant="h5">{selectedStudent.name}</Typography>
// //             <Typography>Email: {selectedStudent.email}</Typography>
// //             <Typography>Phone: {selectedStudent.phone}</Typography>
// //             <Typography>Class: {selectedStudent.grade}</Typography>
// //           </CardContent>
// //         </Card>
// //       )}
// //     </div>
// //   );
// // };

// // export default EnrollStudent;

// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Card,
//   CardContent,
//   Typography,
//   Autocomplete,
//   Grid,
//   Button,
// } from "@mui/material";

// const EnrollStudent = () => {
//   const [students, setStudents] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [filteredSuggestions, setFilteredSuggestions] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedCourse, setSelectedCourse] = useState(null);

//   // Fetch all students and courses
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch students
//         const studentResponse = await fetch(
//           "https://sisyabackend.in/rkadmin/get_recent_users",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ id: 1, amount: 100 }),
//           }
//         );
//         const studentData = await studentResponse.json();
//         if (studentData.studentList) {
//           setStudents(studentData.studentList);
//         }

//         // Fetch courses
//         const courseResponse = await fetch(
//           "https://sisyabackend.in/rkadmin//get_all_courses",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         const courseData = await courseResponse.json();
//         console.log(courseData.bigCourses);
//         if (courseData.bigCourses) {
//           setCourses(courseData.bigCourses);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter student suggestions
//   useEffect(() => {
//     if (searchText.length > 0) {
//       const filtered = students.filter(
//         (student) =>
//           student.name.toLowerCase().includes(searchText.toLowerCase()) ||
//           student.grade.toLowerCase().includes(searchText.toLowerCase())
//       );
//       setFilteredSuggestions(filtered);
//     } else {
//       setFilteredSuggestions([]);
//     }
//   }, [searchText, students]);

//   const handleSearchInputChange = (event, value) => {
//     setSearchText(value);
//   };

//   const handleSelectStudent = (event, value) => {
//     if (!value) {
//       setSelectedStudent(null);
//       return;
//     }
//     const studentName = value.split(" (")[0];
//     const student = students.find((s) => s.name === studentName);
//     setSelectedStudent(student || null);
//     setSelectedCourse(null); // Reset course selection when student changes
//   };

//   const handleEnroll = async () => {
//     if (selectedStudent && selectedCourse) {
//       const basePrice = selectedCourse.currentPrice;
//       const sgst = (9 / 100) * basePrice;
//       const cgst = (9 / 100) * basePrice;
//       const purchasePrice = basePrice + sgst + cgst;

//       const enrollmentData = {
//         basePrice: basePrice,
//         discount: 0,
//         sgst: sgst,
//         cgst: cgst,
//         PurchasePrice: purchasePrice,
//         endUsersId: selectedStudent.id,
//         bigCourseId: selectedCourse.id,
//         OrderId: "12345",
//       };

//       console.log("Enrollment Data:", enrollmentData);

//       try {
//         const response = await fetch(
//           "https://sisyabackend.in/student/create_big_course_subscription",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(enrollmentData),
//           }
//         );

//         const result = await response.json();

//         if (result.success) {
//           alert("Enrollment successful!");
//         } else {
//           alert("Enrollment failed: " + result.message);
//         }
//       } catch (error) {
//         console.error("Error enrolling student:", error);
//         alert("An error occurred while enrolling.");
//       }
//     } else {
//       alert("Please select a student and a course before enrolling.");
//     }
//   };


//   return (
//     <div style={{ maxWidth: "600px", margin: "0 auto" }}>
//       <Grid container spacing={2}>
//         <Grid item xs={12}>
//           <Autocomplete
//             freeSolo
//             options={filteredSuggestions.map(
//               (option) => `${option.name} (${option.grade})`
//             )}
//             inputValue={searchText}
//             onInputChange={handleSearchInputChange}
//             onChange={handleSelectStudent}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Search by Name or Class"
//                 variant="outlined"
//                 fullWidth
//               />
//             )}
//           />
//         </Grid>
//       </Grid>

//       {selectedStudent && (
//         <Card style={{ marginTop: "20px", padding: "16px" }}>
//           <CardContent>
//             <Typography variant="h5" gutterBottom>
//               {selectedStudent.name}
//             </Typography>
//             <Typography>Email: {selectedStudent.email}</Typography>
//             <Typography>Phone: {selectedStudent.phone}</Typography>
//             <Typography>Class: {selectedStudent.grade}</Typography>

//             <Autocomplete
//               options={courses}
//               getOptionLabel={(option) => option.name}
//               value={selectedCourse}
//               onChange={(event, newValue) => setSelectedCourse(newValue)}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Select Course"
//                   variant="outlined"
//                   fullWidth
//                   margin="normal"
//                 />
//               )}
//             />

//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleEnroll}
//               disabled={!selectedCourse}
//               fullWidth
//               style={{ marginTop: "16px" }}
//             >
//               Enroll Student
//             </Button>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default EnrollStudent;

import React, { useState, useEffect } from "react";
import {
  TextField,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  Grid,
  Button,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
const EnrollStudent = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [orderId, setOrderId] = useState(""); // New state for OrderId

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await fetch(
          "https://sisyabackend.in/rkadmin/get_recent_users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: 1, amount: 100 }),
          }
        );
        const studentData = await studentResponse.json();
        if (studentData.studentList) {
          setStudents(studentData.studentList);
        }

        const courseResponse = await fetch(
          "https://sisyabackend.in/rkadmin/get_all_courses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const courseData = await courseResponse.json();
        if (courseData.bigCourses) {
          setCourses(courseData.bigCourses);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchText.toLowerCase()) ||
          student.grade.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchText, students]);

  const handleSearchInputChange = (event, value) => {
    setSearchText(value);
  };

  const handleSelectStudent = (event, value) => {
    if (!value) {
      setSelectedStudent(null);
      return;
    }
  
    setSelectedStudent(value);
    setSelectedCourse(null);
    setOrderId(""); // Reset OrderId when student changes
  };

  const handleEnroll = async () => {
    if (selectedStudent && selectedCourse && orderId.trim()) {
      const basePrice = selectedCourse.currentPrice;
      const sgst = (9 / 100) * basePrice;
      const cgst = (9 / 100) * basePrice;
      const purchasePrice = basePrice + sgst + cgst;

      const enrollmentData = {
        basePrice: basePrice,
        discount: 0,
        sgst: sgst,
        cgst: cgst,
        PurchasePrice: purchasePrice,
        endUsersId: selectedStudent.id,
        bigCourseId: selectedCourse.id,
        OrderId: orderId, // Use entered OrderId
      };

      console.log("Enrollment Data:", enrollmentData);

      try {
        const response = await fetch(
          "https://sisyabackend.in/student/create_big_course_subscription",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(enrollmentData),
          }
        );

        const result = await response.json();

        if (result.success) {
          setSelectedStudent(null);
          setSelectedCourse(null);
          toast.success("Student Enrolled Successfully");
        } else {
          toast.error("something went wrong ! Try again");
        }
      } catch (error) {
       // console.log("Error enrolling student:", error);
       toast.error("something went wrong ! Try again");
      }
    } else {
      toast.error(
        "Please select a student, a course, and enter an Order ID before enrolling."
      );
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) => `${option.id} - ${option.name} - ${option.phone}` || ''}
          value={selectedStudent}
          onChange={handleSelectStudent}
          renderInput={(params) => <TextField {...params} label="Select Student" margin="normal" fullWidth />}
        />
          {/* <Autocomplete
            freeSolo
            options={filteredSuggestions.map(
              (option) => `${option.name} (${option.phone})`
            )}
            inputValue={searchText}
            onInputChange={handleSearchInputChange}
            onChange={handleSelectStudent}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by Name or Class"
                variant="outlined"
                fullWidth
              />
            )}
          /> */}
        </Grid>
      </Grid>

      {selectedStudent && (
        <Card style={{ marginTop: "20px", padding: "16px" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {selectedStudent.name}
            </Typography>
            <Typography>Email: {selectedStudent.email}</Typography>
            <Typography>Phone: {selectedStudent.phone}</Typography>
            <Typography>Class: {selectedStudent.grade}</Typography>

            <Autocomplete
              options={courses}
              getOptionLabel={(option) => `${option.id}-Class${option.grade}-${option.name}`}
              value={selectedCourse}
              onChange={(event, newValue) => setSelectedCourse(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Course"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <TextField
              label="Enter Order ID"
              variant="outlined"
              fullWidth
              margin="normal"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleEnroll}
              disabled={!selectedCourse || !orderId.trim()}
              fullWidth
              style={{ marginTop: "16px" }}
            >
              Enroll Student
            </Button>
          </CardContent>
        </Card>
      )}
      <ToastContainer/>
    </div>
  );
};

export default EnrollStudent;

