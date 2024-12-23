import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Collapse, Typography, Avatar, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import sidebarConfig from './SidebarConfig'; // Your sidebar config file

const Sidebar = ({ userRole }) => {
  const [open, setOpen] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = (label) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  // Filter sidebar items based on the user role
  const filteredSidebarConfig = sidebarConfig.filter((item) => {
    if (!item.roles) return true; // Show if no roles specified
    return item.roles.includes(userRole); // Show if the role matches
  });

  return (
    <Box sx={{ width: '250px', backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: '#1976d2' }}>
          SISYA MANAGER
        </Typography>

        <List>
          {filteredSidebarConfig.map((item) => (
            <React.Fragment key={item.label}>
              {/* Main Menu Item */}
              <ListItem
                button
                onClick={() => {
                  if (item.expandable) {
                    handleToggle(item.label);
                  } else {
                    handleNavigation(item.path); // Non-expandable item, navigate directly
                  }
                }}
                sx={{
                  backgroundColor: isActive(item.path) ? '#e0f7fa' : 'transparent',
                  '&:hover': { backgroundColor: '#e0f7fa' },
                  paddingX: '20px',
                  paddingY: '10px',
                }}
              >
                <ListItemIcon sx={{ color: '#1976d2', minWidth: '35px' }}>
                  {renderIcon(item.icon)}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500', color: isActive(item.path) ? '#1976d2' : '#333' }} />
                {item.expandable && (open[item.label] ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>

              {/* Sub Items for Expandable Menu */}
              {item.expandable && (
                <Collapse in={open[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems && item.subItems.map((subItem) => (
                      <ListItem
                        button
                        key={subItem.label}
                        onClick={() => handleNavigation(subItem.path)}
                        sx={{
                          pl: 4,
                          backgroundColor: isActive(subItem.path) ? '#e0f7fa' : 'transparent',
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        }}
                      >
                        <ListItemIcon sx={{ color: '#1976d2', minWidth: '35px' }}>
                          {renderIcon(subItem.icon)}
                        </ListItemIcon>
                        <ListItemText primary={subItem.label} primaryTypographyProps={{ fontSize: '0.875rem', color: isActive(subItem.path) ? '#1976d2' : '#666' }} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
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
