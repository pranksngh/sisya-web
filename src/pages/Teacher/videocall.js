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
  FaSignOutAlt, FaPhoneSlash 
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
  
  // Call state
  const [callState, setCallState] = useState('calling'); // 'calling', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);
  
  // Original states from your code
  const [zegoEngine, setZegoEngine] = useState(null);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userList, setUserList] = useState([]);
  const [speakRequests, setSpeakRequests] = useState([]);
  const [isSpeakRequestVisible, setIsSpeakRequestVisible] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");

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

  // Start call timer
  const startCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Handle Firebase notifications
  onMessage(messaging, (payload) => {
    console.log('Message received in the foreground:', payload);
    const notificationData = payload.data;
    console.log('Notification Data:', notificationData);

    // Check if the notification type is 'end_call'
    if (notificationData.type === 'end_call') {
      console.log('The call has ended.');
      showAlert('Call ended by the other participant', 'info');
      leaveRoom();
    }
  });

  useEffect(() => {
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
        
        // Register room state change callback to monitor login status
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

        // Attempt to login to the room
        zg.loginRoom(roomID, token, { userID, userName }, { userUpdate: true });

        zg.setDebugVerbose(false);

        try {
          const stream = await zg.createStream({
            camera: {
              video: true,
              audio: true,
            }
          });
          setLocalStream(stream);
          
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
          
          const videoElement = document.getElementById(`video_${videostreamID}`);
          if (videoElement) {
            videoElement.srcObject = stream;
          }
          
          // Set local video preview
          const localVideoElement = document.getElementById('localVideo');
          if (localVideoElement) {
            localVideoElement.srcObject = stream;
          }
          
          // Start publishing the stream
          zg.startPublishingStream(videostreamID, stream);
          
        } catch (streamError) {
          console.error("Error creating stream:", streamError);
          showAlert("Failed to access camera and microphone. Please check permissions.", "error");
        }

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

        zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
          console.log("Room stream update type is " + JSON.stringify(updateType));
        
          if (updateType === 'ADD') {
            showAlert(`New stream(s) added to the room`, "info");
            streamList.forEach(async (stream) => {
              console.log("stream id is " + stream.streamID);
              const remoteStream = await zg.startPlayingStream(stream.streamID);
              setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);
        
              const streamType = stream.streamID.startsWith("hostvideo") ? 'Video' : 
                                stream.streamID.startsWith("hostscreen") ? 'Screen' : 'User';
        
              console.log("stream type is " + streamType);
              if (streamType === 'User') {
                const videoElement = document.getElementById('hostVideo');
                if (videoElement) {
                  videoElement.srcObject = remoteStream;
                  
                  // Change call state to connected when we receive a remote stream
                  setCallState('connected');
                  startCallTimer();
                } else {
                  console.log('Video element with ID "hostVideo" not found');
                }
              }
            });
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
            showAlert(`${userList.length} user(s) left the room`, "info");
          }
        });

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

    // Create remote streams container if it doesn't exist
    if (!document.getElementById('remoteStreams')) {
      const remoteStreamsDiv = document.createElement('div');
      remoteStreamsDiv.id = 'remoteStreams';
      remoteStreamsDiv.style.display = 'none';
      document.body.appendChild(remoteStreamsDiv);
    }

    initZego();

    // Set a timeout to automatically end the call if not answered
    const callTimeoutId = setTimeout(() => {
      if (callState === 'calling') {
        showAlert("Call not answered", "warning");
        leaveRoom();
      }
    }, 60000); // 60 seconds timeout

    return () => {
      clearTimeout(callTimeoutId);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      
      if (zegoEngine) {
        zegoEngine.stopPublishingStream(videostreamID);
        if (screenStream) {
          zegoEngine.stopPublishingStream(screenStreamID);
        }
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
      }
      
      // Clean up the remote streams container
      const remoteStreamsDiv = document.getElementById('remoteStreams');
      if (remoteStreamsDiv) {
        document.body.removeChild(remoteStreamsDiv);
      }
    };
  }, []);

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
  
  const initiateCall = async() => {
    const mytoken = localStorage.getItem('notificationToken');
    try {
      const data = {
        notification:{
          title: `${userInfo.mentor.name} is calling` ,
          body: "Doubt Call"
        },
        data:{
         type: 'video_call',
         callerName: userInfo.mentor.name,
         teacherToken: mytoken,
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
        showAlert("Call notification sent to recipient", "success");
      } else {
        console.log("calling notification sent failed");
        showAlert("Failed to send call notification", "warning");
      }
    } catch (error) {
      console.log('JSON Stringify Error:', error);
      showAlert("Error sending call notification", "error");
    }
  }  

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
        showAlert("Call ended successfully", "success");
        leaveRoom();
      } else {
        console.log("end call not working");
        showAlert("Failed to end call properly", "warning");
        leaveRoom(); // Still try to leave the room
      }
    } catch (error) {
      console.log('JSON Stringify Error:', error);
      showAlert("Error ending call", "error");
      leaveRoom(); // Still try to leave the room
    }
  }  

  const startScreenShare = async () => {
    if (zegoEngine) {
      try {
        const screenStream = await zegoEngine.createStream({
          screen: true,
          video: {
            quality: 4,
            frameRate: 15,
          },
        });
        setScreenStream(screenStream);
        setIsScreenShared(true);
  
        const screenVideoElement = document.getElementById('screenVideo');
        if (screenVideoElement) {
          screenVideoElement.srcObject = screenStream;
        } else {
          console.error("Screen video element not found in DOM");
          showAlert("Screen sharing element not found", "error");
        }
  
        zegoEngine.startPublishingStream(screenStreamID, screenStream);
        showAlert("Screen sharing started", "success");
  
        screenStream.onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
        showAlert(`Failed to share screen: ${error.message}`, "error");
      }
    }
  };
  
  const stopScreenShare = () => {
    if (zegoEngine && screenStream) {
      zegoEngine.stopPublishingStream(screenStreamID);
      setIsScreenShared(false);
      setScreenStream(null);

      // Reset the screen share element
      const screenVideoElement = document.getElementById('screenVideo');
      if (screenVideoElement) {
        screenVideoElement.srcObject = null;
        screenVideoElement.innerHTML = `<div class="no-screen-share"><p>Start sharing your screen</p></div>`;
      }
      
      showAlert("Screen sharing stopped", "info");
    }
  };

  const leaveRoom = () => {
    if (zegoEngine) {
      zegoEngine.stopPublishingStream(videostreamID);
      if (screenStream) {
        zegoEngine.stopPublishingStream(screenStreamID);
      }
      zegoEngine.logoutRoom(roomID);
      zegoEngine.destroyEngine();
      console.log('Left room and stopped publishing' + roomID);
      showAlert("You have left the video call", "info");
      navigate("../teacher");
    }
  };

  const sendMessage = () => {
    if (zegoEngine && message.trim() !== "") {
      zegoEngine.sendBroadcastMessage(roomID, message).then(() => {
        setMessages([...messages, { userID: "prashant90654", userName, message }]);
        setMessage("");
        showAlert("Message sent", "success");
      }).catch(error => {
        console.error("Failed to send message", error);
        showAlert("Failed to send message", "error");
      });
    }
  };

  const toggleUserList = () => {
    setIsUserListVisible(!isUserListVisible);
    setIsSpeakRequestVisible(false);
  };

  const toggleSpeakRequestList = () => {
    setIsSpeakRequestVisible(!isSpeakRequestVisible);
    setIsUserListVisible(false);
  };

  const toggleUserMic = (userID) => {
    setUserList(prevList =>
      prevList.map(user =>
        user.userID === userID ? { ...user, isMuted: !user.isMuted } : user
      )
    );
    const user = userList.find(user => user.userID === userID);
    const newMicStatus = user ? !user.isMuted : false;
    showAlert(`User ${userID} microphone ${newMicStatus ? 'muted' : 'unmuted'}`, "info");
  };

  const handleAcceptSpeakRequest = (userID) => {
    console.log('Accepted speak request for user:', userID);
    setUserList(prevList =>
      prevList.map(user =>
        user.userID === userID ? { ...user, isMuted: false } : user
      )
    );
    setSpeakRequests((prevRequests) => prevRequests.filter(req => req.userID !== userID));
    showAlert(`Accepted speak request from user ${userID}`, "success");
  };

  const handleDeclineSpeakRequest = (userID) => {
    console.log('Declined speak request for user:', userID);
    setUserList(prevList =>
      prevList.map(user =>
        user.userID === userID ? { ...user, isMuted: true } : user
      )
    );
    setSpeakRequests((prevRequests) => prevRequests.filter(req => req.userID !== userID));
    showAlert(`Declined speak request from user ${userID}`, "info");
  };

  // Student name from userData
  const studentName = userData?.name || "Student";
  
  // Render the calling UI
  const renderCallingUI = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 3,
      }}
    >
      <Avatar
        sx={{
          width: 120,
          height: 120,
          marginBottom: 3,
          backgroundColor: '#2196f3',
          fontSize: '3rem',
          border: '4px solid #4caf50',
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
      
      {/* Hidden local video during calling state */}
      <Box sx={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <video id="localVideo" autoPlay playsInline muted></video>
      </Box>
    </Box>
  );

  // Render the connected call UI
  const renderConnectedUI = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: '100vh',
        backgroundColor: "#000",
        position: "relative",
      }}
    >
      {/* Video Section */}
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <video
          id="hostVideo"
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain", // Using contain as requested
            backgroundColor: "#000",
          }}
        ></video>
        
        {/* Call Duration */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
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
        
        {/* Local Video (PiP) */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 100,
            height: 150,
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

        {/* Control Buttons Overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 2,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "10px 20px",
            borderRadius: "30px",
          }}
        >
          <IconButton
            onClick={toggleMute}
            sx={{
              backgroundColor: isMuted ? "#f44336" : "#1976d2",
              color: "#fff",
              "&:hover": { backgroundColor: isMuted ? "#d32f2f" : "#1565c0" },
            }}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </IconButton>
          <IconButton
            onClick={toggleCamera}
            sx={{
              backgroundColor: !isCameraEnabled ? "#f44336" : "#1976d2",
              color: "#fff",
              "&:hover": { backgroundColor: !isCameraEnabled ? "#d32f2f" : "#1565c0" },
            }}
          >
            {isCameraEnabled ? <FaVideo /> : <FaVideoSlash />}
          </IconButton>
          <Button
            onClick={endCall}
            variant="contained"
            color="error"
            startIcon={<FaSignOutAlt />}
            sx={{
              borderRadius: "30px",
              padding: "6px 16px",
            }}
          >
            End Call
          </Button>
        </Box>
      </Box>

      {/* Remote Streams - Hidden but needed for functionality */}
      <Box
        id="remoteStreams"
        sx={{
          display: "none",
        }}
      >
        {/* Remote video streams will be dynamically added here */}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Alert/Snackbar for notifications */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
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

      {/* Render different UI based on call state */}
      {callState === 'calling' ? renderCallingUI() : renderConnectedUI()}
    </>
  );
}