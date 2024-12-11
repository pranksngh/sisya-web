import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, TextField, IconButton, List, ListItem, ListItemAvatar, Avatar, Typography, Badge, Divider } from '@mui/material';
import { FaPaperPlane, FaSearch, FaEnvelope } from 'react-icons/fa';
import { getUser } from '../../Functions/Login';
import socketService from '../../Sockets/socketConfig';

const ChatLayoutData = () => {
  const user = getUser();
  const fromUUID = user.mentor.uuid;
  const [toUUID, setToUUID] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollViewRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    fetch('https://sisyabackend.in/teacher/get_my_big_course_students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentorId: user.mentor.id }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const uniqueUsers = data.endUsers.filter(
          (user, index, self) => 
            index === self.findIndex((u) => u.uuid === user.uuid)
        );
        setUsers(uniqueUsers);
        setFilteredUsers(uniqueUsers);
      }
    })
    .catch(error => console.error('Error fetching users:', error));
  }, [fromUUID]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      users.filter(user => user.name.toLowerCase().includes(term))
    );
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
      setUnreadCounts((prevCounts) => ({
        ...prevCounts,
        [formattedMessage.fromUUID]: (prevCounts[formattedMessage.fromUUID] || 0) + 1,
      }));
    }

    setMessages((prevMessages) => [...prevMessages, formattedMessage]);

    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [toUUID]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Replace with your auth token
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

    socketService.on('accept_message', handleNewMessage);

    return () => {
      socketService.off('accept_message', handleNewMessage);
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('connect_error');
    };
  }, [handleNewMessage, fromUUID]);

  const fetchConversation = async (toUUID) => {
    setUnreadCounts((prevCounts) => {
      const newCounts = { ...prevCounts };
      delete newCounts[toUUID];
      return newCounts;
    });

    const response = await fetch('https://sisyabackend.in/student/get_conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ toUUID, fromUUID })
    });
    const result = await response.json();
    const messages = result.chat || [];
    
    if (messages.length > 0) {
      const filteredMessages = messages.filter(msg => msg.type === 'text');
      const sortedMessages = filteredMessages.sort((a, b) =>
        new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
      );
      setMessages(sortedMessages);
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setMessages([]);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setToUUID(user.uuid);
    fetchConversation(user.uuid);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        type: 'text',
        content: message,
        from: fromUUID,
        to: toUUID,
      };

      socketService.emit('send_message', newMessage);
      handleNewMessage(newMessage);
      setMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '90vh', overflow: 'hidden',}}>
      {/* Sidebar */}
      <Box sx={{
        width: '30%',
        height: '100%',
        bgcolor: 'white',

        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        marginTop:5,
      }}>
        <TextField 
          fullWidth 
          variant="outlined" 
          placeholder="Search Direct Messages" 
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <IconButton><FaSearch /></IconButton>,
          }}
          sx={{
            borderRadius: '20px', 
            '& .MuiInputBase-root': {
              paddingLeft: '10px',
            },
            marginBottom: 2,
            marginTop:4,
          }}
        />
       
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {filteredUsers.map((user) => (
            <ListItem button onClick={() => handleUserClick(user)} selected={user.uuid === toUUID} key={user.uuid}>
              <ListItemAvatar>
                <Avatar alt={user.name} src={user.image || "https://th.bing.com/th/id/OIP.4oYqJqInuQd2TAlPPdggLgAAAA?rs=1&pid=ImgDetMain"} />
              </ListItemAvatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">{user.email}</Typography>
              </Box>
              {unreadCounts[user.uuid] > 0 && (
                <Badge badgeContent={unreadCounts[user.uuid]} color="primary" />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Window */}
      <Box sx={{
        width: '60%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
  
        background: '#fdfefe',
       
      
      }}>
        {/* Chat Header - Only Show When User is Selected */}
        {selectedUser && (
          <Box sx={{
            bgcolor: '#4CAF50', 
            color: 'white', 
           
          
      
       
            mb:5,
            padding:'20px',
            marginTop:'70px',
          
            display: 'flex', 
            
            alignItems: 'center',
          }}>
            <Avatar alt={selectedUser.name} src={selectedUser.image || "https://th.bing.com/th/id/OIP.4oYqJqInuQd2TAlPPdggLgAAAA?rs=1&pid=ImgDetMain"} />
            <Typography variant="h6" sx={{ ml: 2 }}>{selectedUser.name}</Typography>
          </Box>
        )}

        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#f9f9f9',
     
          
          background: 'url(/path/to/texture.png)',
        }}>
          {selectedUser ? (
            messages.length === 0 ? (
              <Typography variant="body1" color="textSecondary" textAlign="center">Start the conversation!</Typography>
            ) : (
              messages.map((message, index) => (
                <Box key={index} ref={index === messages.length - 1 ? lastMessageRef : null} sx={{
                  display: 'flex',
                  flexDirection: message.fromUUID === fromUUID ? 'row-reverse' : 'row',
                  marginBottom: 1,
                }}>
                  <Box sx={{
                    maxWidth: '70%',
                    padding: 1.5,
                    borderRadius: 2,
                    bgcolor: message.fromUUID === fromUUID ? '#dcf8c6' : '#ececec',
                  }}>
                    <Typography variant="body2">{message.content}</Typography>
                  </Box>
                </Box>
              ))
            )
          ) : (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <FaEnvelope size={40} />
              <Typography variant="body1" color="textSecondary">Select a user to start chatting</Typography>
            </Box>
          )}
        </Box>

        {/* Send Message Input - Fixed at the Bottom */}
        <Box sx={{
          padding: 2, 
          display: 'flex', 
          alignItems: 'center', 
          position: 'sticky', 
          bottom: 0, 
          backgroundColor: 'linear-gradient(to bottom, #f0f0f0 0%, #ffffff 100%)',
 
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{
              borderRadius: '20px',
              '& .MuiInputBase-root': {
                paddingLeft: '10px',
              },
            }}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <FaPaperPlane />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatLayoutData;
