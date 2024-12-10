import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const BannerData = () => {
  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchBannerList();
  }, []);

  const fetchBannerList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_banner_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        setBanners(result.files);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const uploadFile = async (file) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result.split(',')[1];
      const payload = {
        fileList: [
          {
            name: file.name,
            content: base64Content,
          },
        ],
      };
      try {
        const response = await fetch('https://sisyabackend.in/rkadmin/insert_free_banner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.success) {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 'Completed',
          }));
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
          fetchBannerList();
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 'Failed',
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (files.length > 0) {
      const fileToUpload = files[0];
      setUploadProgress((prev) => ({
        ...prev,
        [fileToUpload.name]: 'Uploading',
      }));
      uploadFile(fileToUpload);
    }
  }, [files]);

  const handleView = (banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (bannerName) => {
    try {
      const payload = { FileName: bannerName };
      const response = await fetch('https://sisyabackend.in/rkadmin/remove_banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setBanners(banners.filter((banner) => banner !== bannerName));
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Banner List
      </Typography>

      <Box mb={3}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Upload Banner
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
          />
        </Button>
        <Box mt={2}>
          {files.map((file) => (
            <Box key={file.name} display="flex" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
              <Typography variant="body2">
                {uploadProgress[file.name] || 'Queued'}
              </Typography>
              <Button
                variant="text"
                color="error"
                onClick={() => handleRemoveFile(file.name)}
                disabled={uploadProgress[file.name] === 'Uploading'}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Preview</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.map((banner, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{banner}</TableCell>
                <TableCell>
                  <img
                    src={`https://sisyabackend.in/student/thumbs/banners/all_banners/${banner}`}
                    alt={banner}
                    width="50"
                    height="50"
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleView(banner)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(banner)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          {selectedBanner && (
            <img
              src={`https://sisyabackend.in/student/thumbs/banners/all_banners/${selectedBanner}`}
              alt={selectedBanner}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BannerData;
