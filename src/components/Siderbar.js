import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import * as Icons from "@mui/icons-material";
import sidebarConfig from "./SidebarConfig"; // Your sidebar config file
import { getUser } from "../Functions/Login";

const Sidebar = ({ userRole }) => {
  const user = getUser();
  console.log(JSON.stringify(user));
  const [open, setOpen] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = (label) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const markLogout = async () => {
    const user = getUser();
    const role = localStorage.getItem("role");

    console.log("Logging out...");
    console.log("User Role:", role);
    console.log("User Data:", user);

    if (role === "teacher" && user?.mentor?.id) {
      console.log("Sending logout request for mentorId:", user.mentor.id);

      try {
        const response = await fetch(
          "https://sisyabackend.in/teacher/mark_logout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ mentorId: user.mentor.id }),
          }
        );

        const result = await response.json();
        console.log("Logout API Response:", result);
      } catch (error) {
        console.error("Error marking logout:", error);
      }
    } else {
      console.log("No logout request needed.");
    }
  };

  const handleNavigation = async (path) => {
    if (path === "/") {
      // Clear localStorage on logout
      await markLogout();
      localStorage.clear();
    }
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const filteredSidebarConfig = sidebarConfig.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <Box
      sx={{
        width: "250px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{ p: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          SISYA MANAGER
        </Typography>

        <List>
          {filteredSidebarConfig.map((item) => (
            <React.Fragment key={item.label}>
              <ListItem
                button
                onClick={() => {
                  if (item.expandable) {
                    handleToggle(item.label);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
                sx={{
                  backgroundColor: isActive(item.path)
                    ? "#e0f7fa"
                    : "transparent",
                  "&:hover": { backgroundColor: "#e0f7fa" },
                  paddingX: "20px",
                  paddingY: "10px",
                }}
              >
                <ListItemIcon sx={{ color: "#1976d2", minWidth: "35px" }}>
                  {renderIcon(item.icon)}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: isActive(item.path) ? "#1976d2" : "#333",
                  }}
                />
                {item.expandable &&
                  (open[item.label] ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>

              {item.expandable && (
                <Collapse in={open[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems &&
                      item.subItems.map((subItem) => (
                        <ListItem
                          button
                          key={subItem.label}
                          onClick={() => handleNavigation(subItem.path)}
                          sx={{
                            pl: 4,
                            backgroundColor: isActive(subItem.path)
                              ? "#e0f7fa"
                              : "transparent",
                            "&:hover": { backgroundColor: "#e0f7fa" },
                          }}
                        >
                          <ListItemIcon
                            sx={{ color: "#1976d2", minWidth: "35px" }}
                          >
                            {renderIcon(subItem.icon)}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.label}
                            primaryTypographyProps={{
                              fontSize: "0.875rem",
                              color: isActive(subItem.path)
                                ? "#1976d2"
                                : "#666",
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Avatar sx={{ mr: 2, backgroundColor: "#1976d2" }}></Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: "500" }}>
            {userRole === "admin"
              ? "Admin"
              : userRole === "teacher"
              ? user.mentor.name
              : userRole === "mentor"
              ? user.salesman.name
              : ""}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userRole === "teacher"
              ? user.mentor.email
              : userRole === "mentor"
              ? user.salesman.email
              : ""}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
