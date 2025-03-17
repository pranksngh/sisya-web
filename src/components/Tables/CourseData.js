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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import AddBoardDialog from "../DialogBoxes/AddBoardDialog";
import { addBoardFunction } from "../../Functions/AddBoard";
import DeleteBoardDialog from "../DialogBoxes/DeleteBoardDialog";
import EditBoardDialog from "../DialogBoxes/EditBoardDialog";
import { useNavigate } from "react-router-dom";
import {
  Edit as EditIcon,
  CheckCircleOutline as ActiveIcon,
  HighlightOff as InactiveIcon,
} from "@mui/icons-material";

function CourseData() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", country: "India" });
  const [selectedBoard, setSelectedBoard] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [searchClass, setSearchClass] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); //"all","active" & "inactive"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteModalOpen = (board) => {
    setOpenDeleteModal(true);
    setSelectedBoard(board);
  };

  const handleDeleteModalClose = () => setOpenDeleteModal(false);

  const handleEditModalOpen = (board) => {
    setSelectedBoard(board);
    setFormData({ name: board.name, country: board.country }); // Prepopulate the form
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setSelectedBoard({});
    setFormData({ name: "", country: "India" });
    setOpenEditModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    // Add your submission logic here
    console.log("Form Data Submitte:", formData);

    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/add_board",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            country: formData.country,
          }),
        }
      );

      const result = await response.json();

      if (result.sucess) {
        handleClose();
        //refresh board data
        fetchCourses();
      } else {
        console.log("Add Board Failed", JSON.stringify(result.error));
      }
    } catch (error) {
      // setLoading(false); // Stop loading
      console.log("Error updating/adding board:", error);
      //  setErrorMessage('An error occurred. Please try again.');
    }
  };

  const ChangeBoardStatus = async () => {
    const data = {
      id: selectedBoard.id,
      isActive: !selectedBoard.isActive,
    };
    try {
      const updateboardResponse = await fetch(
        "https://sisyabackend.in/rkadmin/update_course",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const updateboardResult = await updateboardResponse.json();

      if (updateboardResult.success) {
        fetchCourses();
        handleDeleteModalClose();
        //  console.log("Boards Deleted successfully");
      } else {
        alert("Failed to Update Course");
      }
    } catch (error) {
      console.error("Error updating boards:", error);
    }
  };

  const handleDelete = async () => {
    console.log("Selected Board is " + JSON.stringify(selectedBoard));
    ChangeBoardStatus();
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/rkadmin/update_board",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            educationBoardId: selectedBoard.id,
            name: formData.name,
            country: formData.country,
          }),
        }
      );
      const result = await response.json();
      if (result.sucess) {
        handleEditModalClose();
        fetchCourses();
      } else {
        console.error("Edit Board Failed", result.error);
      }
    } catch (error) {
      console.error("Error editing board:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const courseResponse = await fetch(
      "https://sisyabackend.in/rkadmin/get_course",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const courseResult = await courseResponse.json();
    console.log(courseResult);

    if (courseResult.success) {
      //sorting the courses based on updatedOn timestamp
      courseResult.courses.sort(
        (a, b) => new Date(b.modifiedOn) - new Date(a.modifiedOn)
      );
      setCourses(courseResult.courses);
      // setFilteredData(courseResult.bigCourses);

      console.log(JSON.stringify(courseResult));
    }
  };

  //searching based on board name, grade & status
  const filteredCourses = courses.filter((course) => {
    const matchesName = course.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass = course.grade
      .toString()
      .toLowerCase()
      .includes(searchClass.toLowerCase());
    let matchesStatus = true;
    if (activeFilter === "active") {
      matchesStatus = course.isActive === true;
    } else if (activeFilter === "inactive") {
      matchesStatus = course.isActive === false;
    }
    return matchesName && matchesClass && matchesStatus;
  });

  // Pagination calculations
  const pageCount = Math.ceil(filteredCourses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchClass, activeFilter, itemsPerPage]);

  return (
    <Paper elevation={0} variant="elevation" sx={{ padding: "16px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2, // Add bottom margin if needed
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Courses
        </Typography>

        <AddBoardDialog
          open={open}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
        />
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mb: 2 }}
      >
        <TextField
          label="Search by Board Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          label="Search by Class"
          variant="outlined"
          size="small"
          value={searchClass}
          onChange={(e) => setSearchClass(e.target.value)}
        />
        <FormControl variant="outlined" size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Board Name</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Updated On</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCourses.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>

                <TableCell>{row.createdOn}</TableCell>
                <TableCell>{row.modifiedOn}</TableCell>
                <TableCell>Class {row.grade}</TableCell>
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
                        color="primary"
                        onClick={() =>
                          navigate("/dashboard/edit-course", {
                            state: { course: row },
                          })
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={row.isActive ? "Deactivate" : "Activate"}>
                      <IconButton
                        color={row.isActive ? "success" : "error"}
                        onClick={() => handleDeleteModalOpen(row)}
                      >
                        {row.isActive ? <ActiveIcon /> : <InactiveIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <DeleteBoardDialog
                    open={openDeleteModal}
                    handleClose={handleDeleteModalClose}
                    handleDelete={handleDelete}
                    boardInfo={selectedBoard}
                  />
                  <EditBoardDialog
                    open={openEditModal}
                    handleClose={handleEditModalClose}
                    handleEdit={handleEditSubmit}
                    formData={formData}
                    handleChange={handleChange}
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

export default CourseData;
