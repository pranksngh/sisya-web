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
import { useNavigate } from 'react-router-dom';


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
  const navigate = useNavigate();

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
      .catch(error => 
        console.error('Error fetching doubts:'

        ));
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

  const fetchConversation = async (doubt) => {
    const toUUID = doubt.asker.uuid;
    setUnreadCounts((prevCounts) => {
      const newCounts = { ...prevCounts };
      delete newCounts[doubt.id]; // Clear unread count for this specific doubt
      return newCounts;
    });

    setDoubtStatus(doubt.status); // Set the current doubt status

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
      const filteredMessages = messages.filter(msg => msg.type === `doubt-${doubt.id}`); // Only show 'doubt' messages
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

  const handleUserClick = (doubt) => {
    setSelectedUser(doubt.asker);
    setToUUID(doubt.asker.uuid);
    fetchConversation(doubt);
    setdoubtid(doubt.id);
    setdoubtinfo(doubt);
    setUnreadCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      delete newCounts[doubt.id];
      return newCounts;
    });
    setDoubtStatus(doubt.status);
  };
  const handleEndDoubt = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/teacher/update_doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: doubtid,
          status: 2, // Set status to 2, indicating the doubt is resolved
        }),
      });

      const result = await response.json();
      if (result.success) {
        setDoubtStatus(2); // Update local status to 2
       // console.log('Doubt status updated to resolved');

        // Refresh the doubt list after resolving
        fetchDoubtList();

        const notificationResponse = await fetch('https://sisyabackend.in/rkadmin/send_notif2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notification: {
              title: "Demo Notification Sent",
              body: "Write a review for your teacher"
            },
            data: {
              type: "feedback",
              mentorId: user.mentor.id.toString(),  // You already have mentorId
              userId: dobutinfo.asker.id.toString()      // From doubt.asker.id
            },
            tokens: [dobutinfo.asker.deviceId],  // From doubt.asker.deviceId
          })
        });

        const notificationResult = await notificationResponse.json();
        if (notificationResult.success) {
        //  console.log("Notification sent successfully");
        } else {
        //  console.error("Failed to send notification:", notificationResult.message);
        }
      } else {
       // console.error('Failed to update doubt status:', result.message);
      }
    } catch (error) {
     // console.error('Error updating doubt status:', error);
    }
  };

  const handleSendMessage = async () => {
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
      if (messages.filter(msg => msg.fromUUID === fromUUID).length === 0) {
        try {
          const response = await fetch('https://sisyabackend.in/teacher/update_doubt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: doubtid,
              status: 1,
            }),
          });

          const result = await response.json();
          if (result.success) {
          //  console.log('Doubt status updated successfully');

            const notificationResponse = await fetch('https://sisyabackend.in/rkadmin/send_notif2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                notification: {
                  title: "You Doubt Status is Changed, Teacher Responded",
                  body: "Your doubt has been marked as 'In Progress'."
                },
                data: {
                  type: "general",
                  doubt:"1"
                 
                },
                tokens: [dobutinfo.asker.deviceId],  // From doubt.asker.deviceId
              })
            });
  
            const notificationResult = await notificationResponse.json();
            if (notificationResult.success) {
           //   console.log("Notification sent successfully");
            } else {
            //  console.error("Failed to send notification:", notificationResult.message);
            }
          } else {
          //  console.error('Failed to update doubt status:', result.message);
          }
        } catch (error) {
         // console.error('Error updating doubt status:', error);
        }
      }
    }
  };

  const renderMessageContent = (message) => {
    let content = message.content;
    content = content.replace("data:image/jpeg;base64,","");
    const prefixRegex = /^(data:(.*?);name=.*?;base64,).*?(data:(.*?);base64,)/;
    const sanitizedContent = content.replace(prefixRegex, '$3');
    const regex = /data:(.*?);name=(.*?);base64,(.*)/;
    const matches = sanitizedContent.match(regex);

    if (matches) {
      const mimeType = matches[1];
      const fileName = matches[2];
      
   // console.log("mime type is " + mimeType);
      if (mimeType.startsWith('image/')) {
       
        return <img src={content} alt={fileName} className="message-image" style={{width:150,}} />;
      } else {
        return (
          <a href={content} download={fileName}>
            Download {fileName}
          </a>
        );
      }
    } else {
      return <p>{message.content}</p>;
    }
  };

const generateVideoToken = async(userData, roomid)=>{

  const username = user.mentor.name; // Replace with dynamic username if needed
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
  const userId = `${username}_${randomNumber}`;

  const data = {
    userId: userId,
  };
  try{
    const response = await   fetch('https://sisyabackend.in/student/get_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if(response.success){
      const videotoken = response.token;
      navigate("/videocall",{
        state: {
            userData,
            user, // here user means mentor info
            videotoken,
            roomid,
            userId

        }
    });
    }
  }catch(error){
   // console.log("something went wrong", error);
  }
}
  const initiateCall = async (userData)=>{

    const randomRoomId = Math.random().toString(36).substring(2, 10); // Generate a random 8-character alphanumeric string

    try {

      const data = {
        notification:{
          title: `${user.mentor.name} is calling` ,
          body: "Doubt Call",
        },
        data:{
         type: 'video_call',
         callerName: user.mentor.name,
         roomId: randomRoomId
        },
        
        // imageData: imageFile
        //   ? {
        //       name: imageFile.name,
        //       content: base64Image,
        //     }
        //   : null,
        tokens: [userData.deviceId],
      };
      const response = await   fetch('https://sisyabackend.in/rkadmin/send_notif2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
       if(result.success){
        generateVideoToken(userData, randomRoomId);
       
       }
    
    } catch (error) {
     // console.log('JSON Stringify Eror:', error);
    }
  }

  return (
    <Box display="flex" height="90vh">
      <Box width="30%" bgcolor="grey.100" p={2} display="flex"
  flexDirection="column"
  sx={{ height: '86.4vh' }}>
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
      <List sx={{
      flex: 1, // Takes remaining space
      mt: 2,
      overflowY: 'auto', // Enables scrolling
      maxHeight: '80vh', // Prevents overflow
    }}>
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
            <Box display="flex" alignItems="center" justifyContent="flex-start" flex={0.5}>
              <Box display="flex" alignItems="center">
                <Avatar src="https://via.placeholder.com/150" />
                <Typography variant="h6" ml={2}>
                  {selectedUser.name}
                </Typography>
              </Box>
             
              <Box display="flex" justifyContent="flex-end" flex={1}>
                {doubtStatus === 1 && (
                  <>
                    <IconButton onClick={()=>initiateCall(selectedUser)} ><VideoIcon /></IconButton>
                    <IconButton onClick={()=>initiateCall(selectedUser)} ><PhoneIcon /></IconButton>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleEndDoubt()}
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
                {renderMessageContent(message)}
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