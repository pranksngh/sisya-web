import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser } from '../Functions/Login';
const Mentor = () => {
  const user = getUser();
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const [highPotentialLeads, setHighPotentialLeads] = useState(0);
  const [validOrderLeads, setValidOrderLeads] = useState(0);
  const [dialedLead, setDialedLeads] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [convertedLeads, setConvertedLeads] = useState(0);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [imageData, setImageData] = useState('');

  const recordsPerPage = 10;
  const statuses = ['dialed', 'pending', 'payment pending', 'converted'];
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('This Week');

  // Fetch leads data
  const fetchLeadsData = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/teacher/sales/my_leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesmanId: user.salesman.id }),
      });

      const result = await response.json();
      if (result.success) {
        const leads = result.leads;
        setLeadsData(leads);
        setFilteredLeads(leads);
        setTotalLeads(leads.length);
        setConvertedLeads(leads.filter((lead) => lead.status === 'converted').length);
      } else {
        setError('Failed to fetch leads data');
      }
    } catch (error) {
      setError('Error fetching leads data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const handleUpdateClick = (lead) => {
    setSelectedLead(lead);
    setUpdatedStatus(lead.status);
    setRemark(lead.misc);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setImageData(reader.result);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const postData = {
      id: selectedLead.id,
      status: updatedStatus,
      misc: remark,
      ...(updatedStatus === 'converted' && imageData ? { imageData } : {}),
    };

    try {
      const response = await fetch('https://sisyabackend.in/teacher/sales/update_lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Lead updated successfully');
        setIsModalOpen(false);
        fetchLeadsData();
      } else {
        toast.error('Failed to update lead');
      }
    } catch (error) {
      toast.error('An error occurred while updating the lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Mentor Dashboard
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Leads</Typography>
                  <Typography variant="h4">{totalLeads}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Converted Leads</Typography>
                  <Typography variant="h4">{convertedLeads}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Leads Table
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeads.slice(
                    (currentPage - 1) * recordsPerPage,
                    currentPage * recordsPerPage
                  ).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.id}</TableCell>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdateClick(lead)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                width: 400,
              }}
            >
              <Typography variant="h6" mb={2}>
                Update Lead
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  required
                  margin="normal"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  multiline
                  rows={4}
                  required
                  margin="normal"
                />

                {updatedStatus === 'converted' && (
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2 }}
                  >
                    Upload Proof
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ mt: 3 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </Box>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Mentor;
