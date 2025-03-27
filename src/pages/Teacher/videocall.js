import React, { useEffect, useState, useRef } from 'react';
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../../firebaseConfig';
import { getUser } from '../../Functions/Login';
import { 
  Button, Box, IconButton, Alert, Snackbar, Typography, Avatar, 
  CircularProgress, Paper 
} from "@mui/material";
import { 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, 
  FaPhoneSlash, FaPhone 
} from "react-icons/fa";

export default function VideoCallPage() {
  const userInfo = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, user, videotoken, randomRoomId, userId } = location.state || {};
  const appID = 1500762473;
  const serverSecret = "175fa0e5958efde603f2ec805c7d6120";
  const userName = user?.mentor?.name || "Unknown User";
  const roomID = randomRoomId;
  const videostreamID = "hostvideo_" + uuidv4();
  const screenStreamID = "hostscreen_" + uuidv4();
  
  console.log("my userid is ", userId);
  console.log("my video token is ", videotoken);
  
  // Call state management
  const [callStatus, setCallStatus] = useState('calling'); // 'calling', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const durationTimerRef = useRef(null);
  const navigateRef = useRef(false); // To track if navigation has been triggered
  
  // Zego engine state
  const [zegoEngine, setZegoEngine] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  
  // UI controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  
  // User data
  const studentName = userData?.name || "Student";
  const studentAvatar = userData?.profilePic || null;
  
  // Function to show alerts
  const showAlert = (message, severity = "info") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call duration timer when connected
  const startCallTimer = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    
    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Handle Firebase notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in the foreground:', payload);
      const notificationData = payload.data;
      console.log('Notification Data:', notificationData);

      // Check if the notification type is 'end_call'
      if (notificationData.type === 'end_call') {
        console.log('The call has ended.');
        showAlert('Call ended by the other participant', 'info');
        setCallStatus('ended');
        handleLeaveRoom();
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle leaving room and navigation
  const handleLeaveRoom = () => {
    console.log("leave room hitting");
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    if (zegoEngine && !navigateRef.current) {
      console.log("zego engine working");
      try {
        zegoEngine.stopPublishingStream(videostreamID);
        if (screenStream) {
          zegoEngine.stopPublishingStream(screenStreamID);
        }
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
        console.log('Left room and stopped publishing ' + roomID);
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
      
      // Set the navigation flag to prevent multiple navigations
      navigateRef.current = true;
      
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        navigate("/dashboard", { replace: true });
      }, 300);
    }
  };

  // Initialize Zego engine
  useEffect(() => {
    // Create container for remote streams if it doesn't exist
    const createRemoteStreamContainer = () => {
      if (!document.getElementById('remoteStreams')) {
        const remoteStreamsDiv = document.createElement('div');
        remoteStreamsDiv.id = 'remoteStreams';
        remoteStreamsDiv.style.display = 'none';
        document.body.appendChild(remoteStreamsDiv);
      }
    };

    createRemoteStreamContainer();

    const initZego = async () => {
      try {
        const zg = new ZegoExpressEngine(appID, serverSecret);
        setZegoEngine(zg);

        const result = await zg.checkSystemRequirements();
        if (!result.webRTC) {
          console.log("Browser does not support required WebRTC features.");
          showAlert("Your browser does not support WebRTC features required for video calls.", "error");
          return;
        }

        const userID = userId;
        const token = videotoken;
        console.log("assigned userid is ", userID);
        
        // Register room state change callback
        zg.on('roomStateUpdate', (roomID, state, errorCode, extendedData) => {
          if (state === 'CONNECTED') {
            console.log('Successfully logged into room:', roomID);
            showAlert(`Successfully joined room ${roomID}`, "success");
          } else if (state === 'DISCONNECTED') {
            console.log('Disconnected from room:', roomID, 'Error code:', errorCode);
            if (errorCode !== 0) {
              showAlert(`Failed to connect to room: Error ${errorCode}`, "error");
            }
          } else if (state === 'CONNECTING') {
            console.log('Connecting to room:', roomID);
          }
        });

        // Login to room
        await zg.loginRoom(roomID, token, { userID, userName }, { userUpdate: true });
        console.log("Successfully logged into room");

        zg.setDebugVerbose(false);

        try {
          // Create local stream
          console.log("Creating local stream...");
          const stream = await zg.createStream({
            camera: {
              video: true,
              audio: true,
            }
          });
          console.log("Local stream created successfully");
          setLocalStream(stream);
          
          // Create container for local video
          const remoteDivID = `remoteStream_${videostreamID}`;
          let remoteDiv = document.getElementById(remoteDivID);
          
          if (!remoteDiv) {
            remoteDiv = document.createElement('div');
            remoteDiv.id = remoteDivID;
            remoteDiv.className = 'user-card';
            document.getElementById('remoteStreams')?.appendChild(remoteDiv);
            
            const videoElement = document.createElement('video');
            videoElement.id = `video_${videostreamID}`;
            videoElement.autoplay = true;
            videoElement.muted = true;
            videoElement.style.objectFit = 'cover';
            remoteDiv.appendChild(videoElement);
            
            console.log(`User stream added with ID: ${videostreamID}`);
          }
          
          // Set local stream to video element
          const videoElement = document.getElementById(`video_${videostreamID}`);
          if (videoElement) {
            videoElement.srcObject = stream;
            console.log("Set srcObject for hidden video element");
          }
          
          // IMPORTANT: Set local stream to UI video element
          // This is done immediately and also with a delay to ensure it works
          const setLocalVideoStream = () => {
            const localVideoElement = document.getElementById('localVideo');
            if (localVideoElement) {
              localVideoElement.srcObject = stream;
              console.log("Set srcObject for localVideo element");
            } else {
              console.warn("localVideo element not found");
            }
          };
          
          // Try immediately
          setLocalVideoStream();
          
          // And also try after a short delay to ensure DOM is ready
          setTimeout(setLocalVideoStream, 500);
          
          // Start publishing the stream
          console.log("Starting to publish stream:", videostreamID);
          await zg.startPublishingStream(videostreamID, stream);
          console.log("Publishing started for stream:", videostreamID);
          
        } catch (streamError) {
          console.error("Error creating stream:", streamError);
          showAlert("Failed to access camera and microphone. Please check permissions.", "error");
        }

        // Publisher state updates
        zg.on('publisherStateUpdate', (result) => {
          if (result.state === 'PUBLISHING') {
            console.log('Publishing started');
            showAlert("Stream published successfully", "success");
            initiateCall();
          } else if (result.state === 'NO_PUBLISH') {
            console.log(`Publishing failed with error code: ${result.errorCode}`);
            showAlert(`Failed to publish stream: Error ${result.errorCode}`, "error");
          }
        });

        // Room stream updates
        zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
          console.log("Room stream update type is " + JSON.stringify(updateType));
        
          if (updateType === 'ADD') {
            showAlert(`New stream(s) added to the room`, "info");
            
            // When a stream is added, update call status to connected
            if (callStatus === 'calling') {
              setCallStatus('connected');
              startCallTimer();
            }
            
            for (const stream of streamList) {
              console.log("stream id is " + stream.streamID);
              try {
                console.log("Starting to play stream:", stream.streamID);
                const remoteStream = await zg.startPlayingStream(stream.streamID);
                console.log("Successfully started playing stream:", stream.streamID);
                setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);
          
                const streamType = stream.streamID.startsWith("hostvideo") ? 'Video' : 
                                  stream.streamID.startsWith("hostscreen") ? 'Screen' : 'User';
          
                console.log("stream type is " + streamType);
                
                // Set remote stream to UI video element
                const setRemoteVideoStream = () => {
                  const remoteVideoElement = document.getElementById('remoteVideo');
                  if (remoteVideoElement && streamType === 'User') {
                    remoteVideoElement.srcObject = remoteStream;
                    console.log('Remote video element set up');
                  } else if (streamType === 'User') {
                    console.warn("remoteVideo element not found");
                  }
                };
                
                // Try immediately
                setRemoteVideoStream();
                
                // And also try after a short delay
                setTimeout(setRemoteVideoStream, 500);
              } catch (error) {
                console.error(`Error playing stream ${stream.streamID}:`, error);
              }
            }
          } else if (updateType === 'DELETE') {
            streamList.forEach((stream) => {
              const streamDiv = document.getElementById(`remoteStream_${stream.streamID}`);
              if (streamDiv) {
                streamDiv.remove();
                console.log(`Removed user stream with ID: ${stream.streamID}`);
              }
            });
        
            setRemoteStreams((prevStreams) =>
              prevStreams.filter(s => !streamList.find(st => st.streamID === s.streamID))
            );
            console.log("Streams deleted:", streamList.map(s => s.streamID).join(", "));
          }
        });

        // Message handling
        zg.on('IMRecvBroadcastMessage', (roomID, chatData) => {
          if (chatData && chatData.length > 0) {
            chatData.forEach(data => {
              setMessages(prevMessages => [...prevMessages, {
                userID: data.fromUser.userID,
                userName: data.fromUser.userName,
                message: data.message,
              }]);
            });
          }
        });

        // Room user updates
        zg.on('roomUserUpdate', (roomID, updateType, userList) => {
          console.log("Usertype is " + JSON.stringify(updateType));
          if (updateType === 'ADD') {
            setUserList((prevList) => [...prevList, ...userList].map(e => { e.isMuted = true; return e }));
            userList.forEach(user => {
              zg.muteMicrophone(user.userID, true);
            });
            showAlert(`${userList.length} user(s) joined the room`, "info");
          } else if (updateType === 'DELETE') {
            setUserList((prevList) => prevList.filter(user => !userList.find(u => u.userID === user.userID)));
            showAlert(`User(s) left the room`, "info");
            handleLeaveRoom();
          }
        });

        // Stream extra info updates
        zg.on('streamExtraInfoUpdate', (roomID, streamList) => {
          streamList.forEach((stream) => {
            if (stream.extraInfo && stream.extraInfo.reason === '18') {
              console.log('Stream refused to pull, reason: 18');
              showAlert("Stream access denied", "warning");
            }
          });
        });
        
      } catch (error) {
        console.error("Error initializing Zego:", error);
        showAlert(`Failed to initialize video call: ${error.message}`, "error");
        setTimeout(initZego, 5000);
      }
    };

    initZego();

    // Set a timeout to automatically end the call if not answered
    const callTimeoutId = setTimeout(() => {
      if (callStatus === 'calling') {
        showAlert("Call not answered", "warning");
        handleLeaveRoom();
      }
    }, 60000); // 60 seconds timeout

    return () => {
      clearTimeout(callTimeoutId);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      
      if (zegoEngine && !navigateRef.current) {
        try {
          zegoEngine.stopPublishingStream(videostreamID);
          if (screenStream) {
            zegoEngine.stopPublishingStream(screenStreamID);
          }
          zegoEngine.logoutRoom(roomID);
          zegoEngine.destroyEngine();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
      
      // Clean up the remote streams container
      const remoteStreamsDiv = document.getElementById('remoteStreams');
      if (remoteStreamsDiv) {
        document.body.removeChild(remoteStreamsDiv);
      }
    };
  }, []);

  // Toggle microphone
  const toggleMute = () => {
    if (localStream) {
      if (isMuted) {
        zegoEngine.muteMicrophone(false);
        setIsMuted(false);
        showAlert("Microphone unmuted", "info");
      } else {
        zegoEngine.muteMicrophone(true);
        setIsMuted(true);
        showAlert("Microphone muted", "info");
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
  
      if (isCameraEnabled) {
        videoTrack.enabled = false;
        setIsCameraEnabled(false);
        showAlert("Camera turned off", "info");
      } else {
        videoTrack.enabled = true;
        setIsCameraEnabled(true);
        showAlert("Camera turned on", "info");
      }
    }
  };
  
  // Send call notification
  const initiateCall = async() => {
    const token = localStorage.getItem('notificationToken');
    try {
      const data = {
        notification:{
          title: `${userInfo.mentor.name} is calling` ,
          body: "Doubt Call"
        },
        data:{
         type: 'video_call',
         callerName: userInfo.mentor.name,
         teacherToken: token,
         roomId: randomRoomId,
        },
        apns: {
          headers: {
            "apns-priority": "10",
            "apns-push-type": "background"
          },
          payload: {
            aps: {
              "content-available": 1,
              sound: "default",
              alert: {
                title: `${userInfo.mentor.name} is calling`,
                body: "Doubt Call"
              }
            }
          }
        },
        tokens: [userData.deviceId]
      };
      
      const response = await fetch('https://sisyabackend.in/rkadmin/send_notif2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if(result.success){
        console.log("calling notification sent");
        showAlert("Calling...", "info");
      } else {
        console.log("calling notification sent failed");
        showAlert("Failed to send call notification", "warning");
      }
    } catch (error) {
      console.log('JSON Stringify Error:', error);
      showAlert("Error sending call notification", "error");
    }
  }  

  // End call
  const endCall = async() => {
    try {
      const data = {
        notification:{
          title: "ending call" ,
          body: "Doubt Call"
        },
        data:{
         type: 'end_call' 
        },
        tokens: [userData.deviceId],
      };
      
      const response = await fetch('https://sisyabackend.in/rkadmin/send_notif2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if(result.success){
        console.log("call end working fine !!");
        showAlert("Call ended", "info");
        setCallStatus('ended');
        handleLeaveRoom();
      } else {
        console.log("end call not working");
        handleLeaveRoom();
      }
    } catch (error) {
      console.log('JSON Stringify Error:', error);
      handleLeaveRoom();
    }
  }  

  // Render calling UI
  const renderCallingUI = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 3,
      }}
    >
      <Avatar
        src={studentAvatar}
        alt={studentName}
        sx={{
          width: 120,
          height: 120,
          marginBottom: 3,
          border: '4px solid #4caf50',
          backgroundColor: '#2196f3',
          fontSize: '3rem'
        }}
      >
        {studentName.charAt(0)}
      </Avatar>
      
      <Typography variant="h4" sx={{ color: 'white', marginBottom: 1, textAlign: 'center' }}>
        {studentName}
      </Typography>
      
      <Typography variant="body1" sx={{ color: '#bdbdbd', marginBottom: 4 }}>
        Calling...
      </Typography>
      
      <Box sx={{ marginBottom: 3 }}>
        <CircularProgress size={36} sx={{ color: '#4caf50' }} />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 3, marginTop: 4 }}>
        <IconButton
          onClick={endCall}
          sx={{
            backgroundColor: '#f44336',
            color: 'white',
            width: 60,
            height: 60,
            '&:hover': { backgroundColor: '#d32f2f' },
          }}
        >
          <FaPhoneSlash size={24} />
        </IconButton>
      </Box>
      
      {/* Local video during calling state - visible but small */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 120,
          right: 20,
          width: 80,
          height: 120,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid white',
        }}
      >
        <video
          id="localVideo"
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror effect
          }}
        />
      </Box>
    </Box>
  );

  // Render connected call UI
  const renderConnectedUI = () => (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Remote Video (Full Screen) */}
      <video
        id="remoteVideo"
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
        }}
      />
      
      {/* Call Duration */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 16,
          }}
        >
          <Typography variant="body2">
            {formatDuration(callDuration)}
          </Typography>
        </Paper>
      </Box>
      
      {/* Local Video (PiP) - Increased size and visibility */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 120,
          height: 180,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        }}
      >
        <video
          id="localVideo"
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror effect
            backgroundColor: '#333', // Background color to make it visible even when no stream
          }}
        />
      </Box>
      
      {/* Call Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <IconButton
          onClick={toggleMute}
          sx={{
            backgroundColor: isMuted ? '#f44336' : '#4caf50',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': { backgroundColor: isMuted ? '#d32f2f' : '#388e3c' },
          }}
        >
          {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </IconButton>
        
        <IconButton
          onClick={endCall}
          sx={{
            backgroundColor: '#f44336',
            color: 'white',
            width: 64,
            height: 64,
            '&:hover': { backgroundColor: '#d32f2f' },
          }}
        >
          <FaPhoneSlash size={24} />
        </IconButton>
        
        <IconButton
          onClick={toggleCamera}
          sx={{
            backgroundColor: isCameraEnabled ? '#4caf50' : '#f44336',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': { backgroundColor: isCameraEnabled ? '#388e3c' : '#d32f2f' },
          }}
        >
          {isCameraEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </IconButton>
      </Box>
    </Box>
  );

  // Render ended call UI
  const renderEndedUI = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 3,
      }}
    >
      <Typography variant="h4" sx={{ color: 'white', marginBottom: 2 }}>
        Call Ended
      </Typography>
      
      <Typography variant="body1" sx={{ color: '#bdbdbd', marginBottom: 4 }}>
        {callDuration > 0 ? `Duration: ${formatDuration(callDuration)}` : 'Call was not connected'}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/dashboard", { replace: true })}
        sx={{ marginTop: 3 }}
      >
        Return to Dashboard
      </Button>
    </Box>
  );

  // Main render
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* Alert/Snackbar for notifications */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={3000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Render appropriate UI based on call status */}
      {callStatus === 'calling' && renderCallingUI()}
      {callStatus === 'connected' && renderConnectedUI()}
      {callStatus === 'ended' && renderEndedUI()}
      
      {/* Hidden video elements for screen sharing */}
      <video id="screenVideo" style={{ display: 'none' }} autoPlay playsInline />
    </Box>
  );
}