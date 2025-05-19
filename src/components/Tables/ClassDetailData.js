import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { format } from "date-fns";

const descendingComparator = (a, b, orderBy) => {
  let valA = a[orderBy];
  let valB = b[orderBy];

  if (orderBy === "date") {
    valA = new Date(a.startTime);
    valB = new Date(b.startTime);
  }

  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
};

const getComparator = (order, orderBy) =>
  order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

const applyFilters = (data, search, filters) => {
  return data.filter((session) => {
    const matchesSearch =
      session.detail.toLowerCase().includes(search.toLowerCase()) ||
      session.courseName.toLowerCase().includes(search.toLowerCase());

    const sessionDate = format(new Date(session.startTime), "yyyy-MM-dd");
    const sessionStartTime = format(new Date(session.startTime), "HH:mm");
    const sessionEndTime = format(new Date(session.endTime), "HH:mm");

    const matchesDate = filters.date ? sessionDate === filters.date : true;

    const matchesStartTime = filters.startTime
      ? sessionStartTime.includes(filters.startTime)
      : true;

    const matchesEndTime = filters.endTime
      ? sessionEndTime.includes(filters.endTime)
      : true;

    return matchesSearch && matchesDate && matchesStartTime && matchesEndTime;
  });
};

const ClassDetailData = () => {
  const [sessionData, setSessionData] = useState([]);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("startTime");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://sisyabackend.in/teacher/get_all_courses",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const result = await response.json();
        if (result.success) {
          const activeCourses = result.bigCourses.filter(
            (course) => course.isActive
          );

          const sessionsWithCourse = activeCourses.flatMap((course) =>
            (course.session || []).map((session) => ({
              ...session,
              courseName: course.name,
            }))
          );

          setSessionData(sessionsWithCourse);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const categorizedSessions = useMemo(() => {
    const now = new Date();
    return {
      ongoing: sessionData.filter((s) => s.isGoingOn),
      upcoming: sessionData.filter(
        (s) => new Date(s.startTime) > now && !s.isGoingOn
      ),
      past: sessionData.filter((s) => new Date(s.endTime) < now),
    };
  }, [sessionData]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (_, newValue) => setTab(newValue);

  const currentCategory =
    tab === 0 ? "ongoing" : tab === 1 ? "upcoming" : "past";

  const filteredData = applyFilters(
    categorizedSessions[currentCategory],
    search,
    filters
  );

  const sortedData = [...filteredData].sort(getComparator(order, orderBy));

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Session Details with Course Name
      </Typography>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label={`Ongoing (${categorizedSessions.ongoing.length})`} />
        <Tab label={`Upcoming (${categorizedSessions.upcoming.length})`} />
        <Tab label={`Past (${categorizedSessions.past.length})`} />
      </Tabs>

      <Box display="flex" gap={2} mb={2}>
        <TextField label="Search" value={search} onChange={handleSearch} />
        <TextField
          label="Date"
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Start Time"
          type="time"
          name="startTime"
          value={filters.startTime}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Time"
          type="time"
          name="endTime"
          value={filters.endTime}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "detail"}
                    direction={orderBy === "detail" ? order : "asc"}
                    onClick={() => handleSort("detail")}
                  >
                    Session Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "courseName"}
                    direction={orderBy === "courseName" ? order : "asc"}
                    onClick={() => handleSort("courseName")}
                  >
                    Course Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "date"}
                    direction={orderBy === "date" ? order : "asc"}
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "startTime"}
                    direction={orderBy === "startTime" ? order : "asc"}
                    onClick={() => handleSort("startTime")}
                  >
                    Start Time
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "endTime"}
                    direction={orderBy === "endTime" ? order : "asc"}
                    onClick={() => handleSort("endTime")}
                  >
                    End Time
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.detail}</TableCell>
                  <TableCell>{row.courseName}</TableCell>
                  <TableCell>
                    {format(new Date(row.startTime), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(row.startTime), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(row.endTime), "HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ClassDetailData;
