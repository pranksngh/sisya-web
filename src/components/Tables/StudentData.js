import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import AddStudentDialog from "../DialogBoxes/AddStudentDialog";
import EditStudentDialog from "../DialogBoxes/EditStudentDialog";
import ViewStudentDialog from "../DialogBoxes/ViewStudentModal";
import * as XLSX from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

function StudentData() {
  const [boards, setBoards] = useState([]);
  const [students, setStudentList] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "student",
    name: "",
    email: "",
    phone: "",
    grade: "",
    educationBoardId: "", // Add educationBoardId to form data as a number
    imageData: "", // Key for the image will be imageData
  });
  const [selectedStudent, setSelectedStudent] = useState({});

  //new state for filtering purpose
  const [searchName, setSearchName] = useState("");
  const [searchGrade, setSearchGrade] = useState("");

  //pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleEditModalOpen = (student) => {
    setSelectedStudent(student);
    setFormData({
      type: "student",
      name: student.name,
      email: student.email,
      phone: student.phone,
      grade: student.grade,
      educationBoardId: student.educationBoardId,
      imageData: `https://sisyabackend.in/student/thumbs/users/${student.id}.jpg`,
    });

    setOpenEditModal(true);
  };

  function formatDate(isoDateString) {
    const date = new Date(isoDateString);

    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", { month: "short" }); // Short month name (e.g., "Jan")
    const year = date.getUTCFullYear();

    // Determine the ordinal suffix for the day
    const suffix =
      day === 11 || day === 12 || day === 13
        ? "th"
        : ["st", "nd", "rd"][(day % 10) - 1] || "th";

    return `${day}${suffix} ${month} ${year}`;
  }

  const handleViewModalOpen = (student) => {
    setSelectedStudent(student);
    setFormData({
      type: "student",
      name: student.name,
      email: student.email,
      phone: student.phone,
      grade: student.grade,
      educationBoardId: student.educationBoardId,
      imageData: `https://sisyabackend.in/student/thumbs/users/${student.id}.jpg`,
    });

    setOpenViewModal(true);
  };

  const handleEditModalClose = () => {
    setFormData({
      type: "student",
      name: "",
      email: "",
      phone: "",
      grade: "",
      educationBoardId: "",
      imageData: "",
    });
    setOpenEditModal(false);
  };

  const handleViewModalClose = () => {
    setFormData({
      type: "student",
      name: "",
      email: "",
      phone: "",
      grade: "",
      educationBoardId: "",
      imageData: "",
    });
    setOpenViewModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.grade ||
      !formData.educationBoardId
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    // Show loading spinner when submission starts
    if (formData.imageData) {
      formData.imageData = formData.imageData.replace(
        /^data:image\/[a-z]+;base64,/,
        ""
      );
    }
    // Simulate API request or any async task
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/create_student",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.success) {
        setFormData({
          type: "student",
          name: "",
          email: "",
          phone: "",
          grade: "",
          educationBoardId: "",
          imageData: "",
        });

        fetchStudentData(1, 100); // Refresh the student list
        handleClose();
      } else {
        console.log("Failed to add students", result.error);
        //  handleClose();
      }
    } catch (error) {
      console.log("Error adding student:", error);
      //  handleClose();
    }
  };

  const handleEditSubmit = async () => {
    console.log("Edit Form", JSON.stringify(formData));
    if (formData.imageData) {
      formData.imageData = formData.imageData.replace(
        /^data:image\/[a-z]+;base64,/,
        ""
      );
    }
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/update_student",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, id: selectedStudent.id }),
        }
      );
      const result = await response.json();

      if (result.success) {
        fetchStudentData(1, 1000);
        handleEditModalClose();
      } else {
        console.log("Student Update Failed", result.error);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudentData();
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    try {
      const boardResponse = await fetch(
        "https://sisyabackend.in/student/get_all_boards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const boardResult = await boardResponse.json();

      if (boardResult.success) {
        setBoards(boardResult.boards);
        console.log("Boards fetched successfully");
      } else {
        console.error("Failed to fetch boards");
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const fetchStudentData = async (page, amount) => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/get_recent_users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: 1,
            amount: 100,
          }),
        }
      );
      const result = await response.json();

      if (result.success && result.studentList.length > 0) {
        //sort the list based on createdOn
        result.studentList.sort((a, b) => {
          return new Date(b.createdOn) - new Date(a.createdOn);
        });

        console.log("Student list: ", result.studentList);
        setStudentList(result.studentList);
      } else {
        setStudentList([]);
      }
    } catch (error) {
      console.log("Error fetching students:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  //Filter students based on search inputs
  const filteredStudents = students.filter((student) => {
    const nameMatch = student.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const gradeMatch = student.grade
      .toString()
      .toLowerCase()
      .includes(searchGrade.toLowerCase());
    return nameMatch && gradeMatch;
  });

  // Function to download students data as an Excel file
  const downloadExcel = () => {
    const cleanedData = students.map(({ password, deviceId, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(cleanedData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  // Pagination calculations
  const pageCount = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchGrade, itemsPerPage]);

  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: "10px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2, // Add bottom margin if needed
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Students
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              textTransform: "capitalize",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
            }}
          >
            Add Student
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={downloadExcel}
            sx={{
              marginLeft: "10px",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
            }}
          >
            Download CSV
          </Button>
        </Box>
        <AddStudentDialog
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          boards={boards}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          formData={formData}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          size="small"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <TextField
          label="Search by Class"
          variant="outlined"
          size="small"
          value={searchGrade}
          onChange={(e) => setSearchGrade(e.target.value)}
        />
      </Box>
      <TableContainer>
        <Table
          sx={{
            borderCollapse: "collapse", // Ensure no space between table cells
            fontSize: "0.8rem", // Reduce font size for the entire table
            "& th, & td": {
              padding: "4px 8px", // Reduce padding in all cells
              textAlign: "center", // Center-align all text
              verticalAlign: "middle", // Vertically center-align all text
            },
            "& th": {
              fontWeight: "bold", // Keep header bold for readability
            },
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>

              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Grade</TableCell>

              <TableCell>Created On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentStudents.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell> {row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>{formatDate(row.createdOn)}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: row.isActive === true ? "green" : "red",
                      mr: 1,
                    }}
                  />
                  {row.isActive === true ? "Active" : "Inactive"}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditModalOpen(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewModalOpen(row)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <EditStudentDialog
                    open={openEditModal}
                    onClose={handleEditModalClose}
                    onSubmit={handleEditSubmit}
                    boards={boards}
                    handleChange={handleChange}
                    handleFileChange={handleFileChange}
                    formData={formData}
                  />
                  <ViewStudentDialog
                    open={openViewModal}
                    onClose={handleViewModalClose}
                    boards={boards}
                    handleChange={handleChange}
                    formData={formData}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(e.target.value)}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>

        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          sx={{ my: 2 }}
        />
      </Box>
    </Paper>
  );
}

export default StudentData;
