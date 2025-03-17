import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Pagination,
  LinearProgress,
  CircularProgress,
  Alert,
  Typography,
  TableSortLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const EnrolledCoursesData = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://sisyabackend.in/rkadmin/get_course",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const result = await response.json();
        if (result.success) {
          setCourses(result.courses);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let computedData = courses.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      computedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return computedData;
  }, [courses, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleViewCourseDetails = (courseId) => {
    navigate(`../course-details`, { state: { courseId } });
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (error)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        My Courses
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <Select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(e.target.value)}
          sx={{ width: 120 }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </div>

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "id"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "startDate"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("startDate")}
                    >
                      Start Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((item) => (
                  <StyledTableRow
                    key={item.id}
                    onClick={() => handleViewCourseDetails(item.id)}
                    hover
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      {item.isLongTerm ? "Long Term" : "Short Term"}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell>{formatDate(item.startDate)}</TableCell>
                    <TableCell>{formatDate(item.endDate)}</TableCell>
                    <TableCell
                      sx={{
                        color: item.isActive ? "success.main" : "error.main",
                      }}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ mt: 3, display: "flex", justifyContent: "center" }}
            color="primary"
          />
        </>
      )}
    </Paper>
  );
};

export default EnrolledCoursesData;