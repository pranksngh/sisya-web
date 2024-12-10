// src/components/Sidebar.js

import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Collapse, Divider, Typography, Avatar, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard, ExpandLess, ExpandMore, PieChart, BarChart, Chat, CalendarToday, Group,
  AccountCircle, ShoppingCart, Settings, Notifications
} from '@mui/icons-material';

const Sidebar = () => {
  const [open, setOpen] = useState({
    students: false,
    teachers: false,
    courses: false,
    classes: false,
    reports: false,
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ width: '250px', backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: '#1976d2' }}>
          SISYA MANAGER
        </Typography>

        <List>
          {/* Non-expandable Dashboard Item */}
          <ListItem
            button
            onClick={() => handleNavigation('/dashboard/admin')}
            sx={{
                backgroundColor: isActive('/dashboard') ? '#e0f7fa' : 'transparent',
                '&:hover': { backgroundColor: '#e0f7fa' },
                paddingX:'20px',
                paddingY:'10px'
              }}
          >
            <ListItemIcon sx={{ color:'#1976d2' ,minWidth: '35px'}}>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/dashboard') ? '#1976d2' : '#333' }} />
          </ListItem>

          
          <ListItem
            button
            onClick={() => handleNavigation('/dashboard/boards')}
            sx={{
              backgroundColor: isActive('/dashboard/boards') ? '#e0f7fa' : 'transparent',
              '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px'
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2',minWidth: '35px' }}>
              <PieChart />
            </ListItemIcon>
            <ListItemText primary="Boards" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/dashboard/boards') ? '#1976d2' : '#333' }} />
          </ListItem>

         
          <ListItem
            button
            onClick={() => handleNavigation('/dashboard/subjects')}
            sx={{
              backgroundColor: isActive('/dashboard/subjects') ? '#e0f7fa' : 'transparent',
              '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px'
            }}
          >
            <ListItemIcon sx={{ color:  '#1976d2',minWidth: '35px'}}>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Subjects" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/dashboard/subjects') ? '#1976d2' : '#333' }} />
          </ListItem>

        

          {/* Expandable Sections */}
          {/* Students */}
          <ListItem button onClick={() => handleToggle('students')} sx={{paddingX:'20px',
                paddingY:'10px'}}>
            <ListItemIcon sx={{ color: '#1976d2' ,minWidth: '35px'}}>
              <Group />
            </ListItemIcon>
            <ListItemText primary="Students" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: '#333' }} />
            {open.students ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.students} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={() => handleNavigation('students')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('/dashboard/students') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' }, 
                }}
              >
                <ListItemText primary="List Students" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('students') ? '#1976d2' : '#666' }} />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation('addStudent')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('addStudent') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' },
                }}
              >
                <ListItemText primary="Add Student" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('addStudent') ? '#1976d2' : '#666' }} />
              </ListItem>
            </List>
          </Collapse>

         

          {/* Teachers */}
          <ListItem button onClick={() => handleToggle('teachers')} sx={{paddingX:'20px',
                paddingY:'10px'}}>
            <ListItemIcon sx={{ color: '#1976d2' ,minWidth: '35px'}}>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Teachers" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: '#333' }} />
            {open.teachers ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.teachers} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={() => handleNavigation('teachers')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('teachers') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' },
                }}
              >
                <ListItemText primary="List Teachers" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('teachers') ? '#1976d2' : '#666' }} />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation('addTeacher')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('addTeacher') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' },
                }}
              >
                <ListItemText primary="Add Teacher" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('addTeacher') ? '#1976d2' : '#666' }} />
              </ListItem>
            </List>
          </Collapse>

    

          {/* Courses */}
          <ListItem button onClick={() => handleToggle('courses')} sx={{paddingX:'20px',
                paddingY:'10px'}}>
            <ListItemIcon sx={{ color: '#1976d2' ,minWidth: '35px'}}>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Courses" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: '#333' }} />
            {open.courses ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.courses} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={() => handleNavigation('courses')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('courses') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' }
                }}
              >
                <ListItemText primary="List Courses" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('courses') ? '#1976d2' : '#666' }} />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation('addCourse')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('addCourse') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' }, 
                }}
              >
                <ListItemText primary="Add Course" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('addCourse') ? '#1976d2' : '#666' }} />
              </ListItem>
            </List>
          </Collapse>

         

          {/* Reports */}
          <ListItem button onClick={() => handleToggle('reports')} sx={{paddingX:'20px',
                paddingY:'10px'}} >
            <ListItemIcon sx={{ color: '#1976d2',minWidth: '35px' }}>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Reports" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: '#333' }} />
            {open.reports ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.reports} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={() => handleNavigation('student-report')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('student-report') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' },
                }}
              >
                <ListItemText primary="Student Report" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('student-report') ? '#1976d2' : '#666' }} />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation('teacher-report')}
                sx={{
                  pl: 4,
                  backgroundColor: isActive('teacher-report') ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' },
                }}
              >
                <ListItemText primary="Teacher Report" primaryTypographyProps={{ fontSize: '0.875rem', color: isActive('teacher-report') ? '#1976d2' : '#666' }} />
              </ListItem>
            </List>
          </Collapse>

         

          {/* Static Links */}
          <ListItem button onClick={() => handleNavigation('course-purchase-list')} sx={{ backgroundColor: isActive('course-purchase-list') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px' }}>
            <ListItemIcon sx={{ color: '#1976d2',minWidth: '35px' }}><ShoppingCart /></ListItemIcon>
            <ListItemText primary="Purchases" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('course-purchase-list') ? '#1976d2' : '#333' }} />
          </ListItem>

        
          <ListItem button onClick={() => handleNavigation('sales-mentor-list')} sx={{ backgroundColor: isActive('sales-mentor-list') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' },paddingX:'20px',
                paddingY:'10px' }}>
            <ListItemIcon sx={{ color:  '#1976d2',minWidth: '35px' }}><AccountCircle /></ListItemIcon>
            <ListItemText primary="Sales Mentor" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('sales-mentor-list') ? '#1976d2' : '#333' }} />
          </ListItem>

        
          <ListItem button onClick={() => handleNavigation('lead-manager')} sx={{ backgroundColor: isActive('lead-manager') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px'}}>
            <ListItemIcon sx={{ color:  '#1976d2',minWidth: '35px' }}><Settings /></ListItemIcon>
            <ListItemText primary="Lead Manager" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('lead-manager') ? '#1976d2' : '#333' }} />
          </ListItem>

         
          <ListItem button onClick={() => handleNavigation('doubts')} sx={{ backgroundColor: isActive('doubts') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px'}}>
            <ListItemIcon sx={{ color:  '#1976d2',minWidth: '35px' }}><Chat /></ListItemIcon>
            <ListItemText primary="Doubts" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('doubts') ? '#1976d2' : '#333' }} />
          </ListItem>

          
          <ListItem button onClick={() => handleNavigation('/enquiries')} sx={{ backgroundColor: isActive('/enquiries') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' },paddingX:'20px',
                paddingY:'10px' }}>
            <ListItemIcon sx={{ color: '#1976d2',minWidth: '35px' }}><Notifications /></ListItemIcon>
            <ListItemText primary="Enquiries" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/enquiries') ? '#1976d2' : '#333' }} />
          </ListItem>

        
          <ListItem button onClick={() => handleNavigation('/banners')} sx={{ backgroundColor: isActive('/banners') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px' }}>
            <ListItemIcon sx={{ color: '#1976d2',minWidth: '35px' }}><CalendarToday /></ListItemIcon>
            <ListItemText primary="Banners" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/banners') ? '#1976d2' : '#333' }} />
          </ListItem>

        
          <ListItem button onClick={() => handleNavigation('/pushNotification')} sx={{ backgroundColor: isActive('/pushNotification') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px' }}>
            <ListItemIcon sx={{ color:  '#1976d2',minWidth: '35px' }}><Notifications /></ListItemIcon>
            <ListItemText primary="Push Notification" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/pushNotification') ? '#1976d2' : '#333' }} />
          </ListItem>

        
          <ListItem button onClick={() => handleNavigation('/settings')} sx={{ backgroundColor: isActive('/settings') ? '#e0f7fa' : 'transparent', '&:hover': { backgroundColor: '#e0f7fa' }, paddingX:'20px',
                paddingY:'10px' }}>
            <ListItemIcon sx={{ color: isActive('/settings') ? '#1976d2' : '#333',minWidth: '35px' }}><Settings /></ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive('/settings') ? '#1976d2' : '#333' }} />
          </ListItem>
        </List>
      </Box>

      {/* Profile Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
        <Avatar sx={{ mr: 2, backgroundColor: '#1976d2' }}>U</Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: '500' }}>JWT User</Typography>
          <Typography variant="body2" color="textSecondary">UI/UX Designer</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
