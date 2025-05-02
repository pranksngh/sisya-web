import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
} from "@mui/material";

const AiUserDetail = () => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchStudentName = async (externalUserId) => {
    try {
      const res = await fetch(
        "https://sisyabackend.in/rkadmin/get_user_by_id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: +externalUserId }),
        }
      );

      const json = await res.json();
      console.log("Response JSON for ID", externalUserId, ":", json);
      return json.name || "Unknown";
    } catch (error) {
      console.error("Error fetching student name:", error);
      return "Unknown";
    }
  };

  const fetchData = async (page, rowsPerPage) => {
    setLoading(true);
    try {
      const offset = page * rowsPerPage;
      const res = await fetch(
        `https://sisyabackend.in/edtech/admin/conversations/recent?limit=${rowsPerPage}&offset=${offset}`
      );
      const json = await res.json();
      const items = await Promise.all(
        json.map(async (item) => {
          const studentName = await fetchStudentName(item.external_user_id);
          return {
            id: item.id,
            studentName,
            grade: item.grade_level,
            subject: item.subject,
            createdAt: new Date(item.created_at).toLocaleString(),
            updatedAt: new Date(item.updated_at).toLocaleString(),
          };
        })
      );
      setData(items);
      setTotalCount(100);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 2 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell>{row.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Paper>
  );
};

export default AiUserDetail;
