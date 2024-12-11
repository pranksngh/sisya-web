import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Button,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { getUser } from '../../Functions/Login';
import socketService from '../../Sockets/socketConfig';


const DoubtScreenLayoutData = () => {
  const user = getUser();
  const fromUUID = user.mentor.uuid;
  const [toUUID, setToUUID] = useState('');
  const [doubtid, setdoubtid] = useState(null);
  const [dobutinfo, setdoubtinfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoubtList, setFilteredDoubtList] = useState([]);
  const [doubtList, setDoubtList] = useState([]);
  const [doubtStatus, setDoubtStatus] = useState(null);
  const lastMessageRef = useRef(null);

  const fetchDoubtList = async () => {
    fetch('https://sisyabackend.in/teacher/get_assigned_doubts_list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentorId: user.mentor.id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const sortedDoubts = data.doubts.sort((a, b) =>
            new Date(b.lastMessageTime || b.createdOn) - new Date(a.lastMessageTime || a.createdOn)
          );
          setDoubtList(sortedDoubts);
          setFilteredDoubtList(sortedDoubts);
        }
      })
      .catch(error => console.error('Error fetching doubts:', error));
  };

  useEffect(() => {
    fetchDoubtList();
  }, [user.mentor.id]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = doubtList.filter(
      doubt =>
        doubt.asker.name.toLowerCase().includes(term) ||
        doubt.topic.toLowerCase().includes(term)
    );
    setFilteredDoubtList(filtered);
  };

  const handleNewMessage = useCallback((newMessage) => {
    const formattedMessage = {
      type: newMessage.type || 'text',
      content: newMessage.content,
      fromUUID: newMessage.from || newMessage.fromUUID,
      toUUID: newMessage.to || newMessage.toUUID,
      doubtId: newMessage.doubtId || doubtid,
      createdOn: newMessage.createdOn || new Date().toISOString(),
    };

    if (formattedMessage.doubtId !== doubtid) {
      setUnreadCounts(prevCounts => ({
        ...prevCounts,
        [formattedMessage.doubtId]: (prevCounts[formattedMessage.doubtId] || 0) + 1,
      }));
    }

    setMessages(prevMessages => [...prevMessages, formattedMessage]);
    fetchDoubtList();
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [doubtid]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    socketService.initializeSocket(token, fromUUID);

    socketService.on('connect', () => console.log('Socket connected'));
    socketService.on('disconnect', () => console.log('Socket disconnected'));
    socketService.on('accept_message', handleNewMessage);

    return () => {
      socketService.off('accept_message', handleNewMessage);
      socketService.off('connect');
      socketService.off('disconnect');
    };
  }, [handleNewMessage, fromUUID]);

  const handleUserClick = (doubt) => {
    setSelectedUser(doubt.asker);
    setToUUID(doubt.asker.uuid);
    setdoubtid(doubt.id);
    setdoubtinfo(doubt);
    setUnreadCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      delete newCounts[doubt.id];
      return newCounts;
    });
    setDoubtStatus(doubt.status);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        type: `doubt-${doubtid}`,
        content: message,
        from: fromUUID,
        to: toUUID,
        doubtId: doubtid,
      };

      socketService.emit('send_message', newMessage);
      handleNewMessage(newMessage);
      setMessage('');
    }
  };

  return (
    <Box display="flex" height="90vh">
      <Box width="30%" bgcolor="grey.100" p={2}>
        <TextField
          variant="outlined"
          fullWidth
          size="small"
          placeholder="Search Direct Messages"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
        />
      <List sx={{ mt: 2 }}>
  {filteredDoubtList.map((doubt) => (
    <ListItem
      button
      key={doubt.id}
      selected={doubt.id === doubtid}
      onClick={() => handleUserClick(doubt)}
      sx={{ mb: 1, borderRadius: 2, p: 2, alignItems: 'flex-start' }}
    >
      <Badge
        badgeContent={unreadCounts[doubt.id]}
        color="primary"
        overlap="circular"
        sx={{ mr: 2 , }}
      >
        <Avatar src="https://via.placeholder.com/150"  />
      </Badge>
      <ListItemText
        primary={
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {doubt.asker.name}
          </Typography>
        }
        secondary={
          <Typography variant="body2" color="textSecondary">
            {`${doubt.topic} - ${doubt.description}`}
          </Typography>
        }
      />
    </ListItem>
  ))}
</List>

      </Box>

      <Box flex={1} display="flex" flexDirection="column" border={1} borderColor="#eee">
        {selectedUser ? (
          <Box p={2} borderBottom={1} borderColor="divider">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Avatar src="https://via.placeholder.com/150" />
                <Typography variant="h6" ml={2}>
                  {selectedUser.name}
                </Typography>
              </Box>

              <Box>
                {doubtStatus === 1 && (
                  <>
                    <IconButton><VideoIcon /></IconButton>
                    <IconButton><PhoneIcon /></IconButton>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => console.log('End Doubt')}
                    >
                      End Doubt
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box flex={1} display="flex" alignItems="center" justifyContent="center" >
            <EmailIcon fontSize="large" />
            <Typography variant="h6">Select a user to start the conversation</Typography>
          </Box>
        )}

        <Box flex={1} overflow="auto" p={2}>
          {messages.map((message, index) => (
            <Box
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              textAlign={message.fromUUID === fromUUID ? 'right' : 'left'}
              mb={2}
            >
              <Typography
                variant="body2"
                bgcolor={message.fromUUID === fromUUID ? 'blue.100' : 'grey.300'}
                p={1}
                borderRadius={1}
                display="inline-block"
              >
                {message.content}
              </Typography>
            </Box>
          ))}
        </Box>

        {selectedUser && doubtStatus !== 2 && (
          <Box p={2} display="flex" borderTop={1} borderColor="#eee" bgcolor="#hhh">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message ${selectedUser.name}`}
            />
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DoubtScreenLayoutData;