import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Box, Card, Input, Modal, Select, MenuItem, Checkbox, IconButton, CircularProgress, Typography, TextField, List, ListItem, ListItemText, Divider, Chip, ListItemAvatar, Avatar, Badge } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast, ToastContainer } from 'react-toastify';
import { getUser } from '../../Functions/Login';
import socketService from '../../Sockets/socketConfig';

const GroupChatLayoutData = () => {
  const user = getUser();
  const token = localStorage.getItem('token');
  const fromUUID = user.mentor.uuid;
  const [toUUID, setToUUID] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalsearchTerm, setmodalSearchTerm] = useState('');
  const scrollViewRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [groupImage, setGroupImage] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    fetchGroupList();
  }, [fromUUID]);

  const fetchGroupList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_my_group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UUID: user.mentor.uuid }),
      });
      const data = await response.json();
      if (data.success) {
        setGroupList(data.gc);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchStudentByGrade = async (selectedGrade) => {
    try {
      const response = await fetch('https://sisyabackend.in/teacher/get_student_by_grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: selectedGrade.toString() }),
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.studnetInfo);
        setFilteredUsers(data.studnetInfo);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(users.filter(user => user.name.toLowerCase().includes(term)));
  };

  const handleNewMessage = useCallback((newMessage) => {
    const formattedMessage = {
      type: newMessage.type || 'text',
      content: newMessage.content,
      fromUUID: newMessage.from || newMessage.fromUUID,
      toUUID: newMessage.to || newMessage.toUUID,
      createdOn: newMessage.createdOn || new Date().toISOString(),
    };

    if (formattedMessage.fromUUID !== toUUID) {
      setUnreadCounts(prevCounts => ({
        ...prevCounts,
        [formattedMessage.fromUUID]: (prevCounts[formattedMessage.fromUUID] || 0) + 1,
      }));
    }

    if (formattedMessage.fromUUID === toUUID || formattedMessage.toUUID === toUUID) {
      setMessages(prevMessages => [...prevMessages, formattedMessage]);
    }

    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [toUUID]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    socketService.initializeSocket(token, fromUUID);

    socketService.on('connect', () => {
      console.log('Socket connected');
    });

    socketService.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketService.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
    });

    groupList.map((data) => {
      socketService.emit("join", { roomId: data.groupId });
    });

    socketService.on('gc:message:rescv', handleNewMessage);

    return () => {
      socketService.off('gc:message:rescv', handleNewMessage);
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('connect_error');
    };
  }, [handleNewMessage, fromUUID]);

  const fetchConversation = async (toUUID) => {
    try {
      const response = await fetch('https://sisyabackend.in/student/get_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "isRead": true, toUUID }),
      });
      const result = await response.json();
      if (result.success) {
        const messages = result.messages || [];
        const filteredMessages = messages.filter(msg => msg.type === 'text');
        const sortedMessages = filteredMessages.sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
        setMessages(sortedMessages);
        setTimeout(() => {
          lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.log('Error fetching conversation:', error);
    }
  };

  const handleUserClick = (group) => {
    setSelectedGroup(group);
    setToUUID(group.groupId.toString());
    fetchConversation(group.groupId.toString());
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        type: 'text',
        content: { name: user.mentor.name, msg: message },
        from: fromUUID,
        to: toUUID,
      };
      socketService.emit('gc:message:send', newMessage);
      handleNewMessage(newMessage);
      setMessage('');
    }
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    fetchStudentByGrade(event.target.value);
    setSelectedUsers([]); // Reset selected users when class changes
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCheckboxChange = (id) => {
    setSelectedUsers((prevSelected) => prevSelected.includes(id)
      ? prevSelected.filter((userId) => userId !== id)
      : [...prevSelected, id]
    );
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    const groupId = generateGroupId();
    const students = filteredUsers.filter(user => selectedUsers.includes(user.id)).map(user => user.uuid);

    const groupObject = {
      groupId,
      groupName,
      imageData: imageData || null,
      students,
      admins: [fromUUID]
    };

    try {
      const response = await fetch('https://sisyabackend.in/teacher/create_gc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupObject),
      });
      const result = await response.json();
      if (result.success) {
        setIsLoading(false);
        setIsModalVisible(false);
        fetchGroupList();
        toast.success('Group created successfully.');
      } else {
        setIsLoading(false);
        toast.error(result.error);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Error creating group.');
    }
  };

  const generateGroupId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  return (
    <Box display="flex" height="90vh">
    {/* Sidebar */}
    <Box width="25%" bgcolor="#eaf2f8" p={2} display="flex" flexDirection="column" justifyContent="space-between">
  <Typography variant="h6">Chat Groups</Typography>

  <Box mt={2} mb={2}>
    <TextField
      label="Search Direct Messages"
      variant="outlined"
      fullWidth
      value={searchTerm}
      onChange={handleSearch}
      InputProps={{
        startAdornment: <FaSearch color="action" />,
      }}
    />
  </Box>

  <Box display="flex" flexDirection="column" flexGrow={1} mb={2}>
    <List sx={{ flexGrow: 1, overflowY: 'auto', padding: 0 }}>
      {groupList.map((group) => (
        <ListItem
          button
          onClick={() => handleUserClick(group)}
          selected={group.groupId === toUUID}  // Select the group based on groupId
          key={group.groupId}
          sx={{
            borderRadius:'6px',
            padding: '8px 16px', // Adding padding for better spacing
            backgroundColor: group.groupId === toUUID ? '#85c1e9' : '#fff', // Highlight selected group
            '&:hover': { backgroundColor: '#f1f1f1' }, // Hover effect for list item
          }}
        >
          <ListItemAvatar>
            <Avatar
              alt={group.groupName}
              src={group.image || "https://th.bing.com/th/id/OIP.4oYqJqInuQd2TAlPPdggLgAAAA?rs=1&pid=ImgDetMain"} // Default image
            />
          </ListItemAvatar>
          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {group.groupName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {/* You can add more information, like group description or member count, here */}
            </Typography>
          </Box>
          {unreadCounts[group.groupId] > 0 && (
            <Badge badgeContent={unreadCounts[group.groupId]} color="primary" />
          )}
        </ListItem>
      ))}
    </List>
  </Box>

  {/* Create Group Button at the Bottom Center */}
  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
    <Button variant="contained" color="primary" onClick={showModal}>
      Create Group
    </Button>
  </Box>

  
      {/* Modal for Creating Group */}
      <Modal open={isModalVisible} onClose={handleCancel}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, width: 400 }}>
          <Typography variant="h6" mb={2}>Create Group</Typography>
          <TextField
            label="Group Name"
            variant="outlined"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Select
            value={selectedClass}
            onChange={handleClassChange}
            fullWidth
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>Select Class</MenuItem>
            <MenuItem value="1">Grade 1</MenuItem>
            <MenuItem value="2">Grade 2</MenuItem>
            <MenuItem value="3">Grade 3</MenuItem>
            <MenuItem value="4">Grade 4</MenuItem>
            <MenuItem value="5">Grade 5</MenuItem>
            <MenuItem value="6">Grade 6</MenuItem>
            <MenuItem value="7">Grade 7</MenuItem>
            <MenuItem value="8">Grade 8</MenuItem>
            <MenuItem value="9">Grade 9</MenuItem>
            <MenuItem value="10">Grade 10</MenuItem>
            <MenuItem value="11">Grade 11</MenuItem>
            <MenuItem value="12">Grade 12</MenuItem>
          </Select>
          <TextField
            label="Search Students"
            variant="outlined"
            fullWidth
            value={modalsearchTerm}
            onChange={(e) => setmodalSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box>
            {filteredUsers.filter(user => user.name.toLowerCase().includes(modalsearchTerm.toLowerCase())).map(user => (
              <Box key={user.id} display="flex" alignItems="center">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
                <Typography variant="body2">{user.name}</Typography>
              </Box>
            ))}
          </Box>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreateGroup} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Create Group'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  
    {/* Chat Area */}
    <Box width="75%" display="flex" flexDirection="column" sx={{ backgroundColor: '#eee' }}>
      {/* Display Group Name */}
      <Box sx={{
        backgroundColor: '#85c1e9',
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Typography variant="h6" color="white">
          {selectedGroup && selectedGroup.groupName ? selectedGroup.groupName : "Select a Group"}
        </Typography>
      </Box>
  
      {/* Messages */}
      <Box flex={1} overflow="auto" ref={scrollViewRef} mt={2}>
        <List>
          {messages.map((msg, index) => (
            <ListItem 
              key={index} 
              sx={{
                justifyContent: msg.fromUUID === fromUUID ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}
            >
              <Box
                sx={{
                  backgroundColor: msg.fromUUID === fromUUID ? '#1976d2' : '#f1f1f1',
                  color: msg.fromUUID === fromUUID ? 'white' : 'black',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '14px' }}>
                  {msg.content.msg}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
  
      {/* Message Input */}
      {selectedGroup && (
        <Box display="flex" mt={2} p={3}>
          <TextField
            label="Type a message"
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{
              mr: 2,
              backgroundColor: '#fff',
              '& .MuiInputBase-root': { color: '#000' },
              '& .MuiInputLabel-root': { color: '#000' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
            }}
            InputProps={{
              placeholder: 'Type a message',
              style: { color: 'black' },
            }}
          />
          <IconButton onClick={handleSendMessage} color="primary">
            <FaPaperPlane />
          </IconButton>
        </Box>
      )}
    </Box>
  </Box>
  
  );
};

export default GroupChatLayoutData;
