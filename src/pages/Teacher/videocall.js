import React, { useEffect, useState, useRef } from 'react';
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../../firebaseConfig';
import { getUser } from '../../Functions/Login';
import { 
  Box, IconButton, Alert, Snackbar, Typography, Avatar, 
  CircularProgress, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Button
} from "@mui/material";
import {
  Campaign,
  DesktopWindows,
  ExitToApp,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";

export default function VideoCallPage() {
  const userInfo = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, user, videotoken, randomRoomId, userId } = location.state || {};
  const appID = 1500762473;
  const serverSecret = "175fa0e5958efde603f2ec805c7d6120";
  const userName = user?.mentor?.name || userInfo?.mentor?.name || "Unknown User";
  const roomID = randomRoomId;
  const videostreamID = "hostvideo_" + uuidv4();
  
  // Call state
  const [callState, setCallState] = useState('calling'); // 'calling', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);
  
  // Video call states
  const [zegoEngine, setZegoEngine] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  
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
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in the foreground:', payload);
      const notificationData = payload.data;
      console.log('Notification Data:', notificationData);

      // Check if the notification type is 'end_call'
      if (notificationData.type === 'end_call') {
        console.log('The call has ended.');
        showAlert('Call ended by the other participant', 'info');
        leaveRoom();
      } else if (notificationData.type === 'call_accepted') {
        // If we receive a call_accepted notification, update the state
        console.log('Call was accepted');
        setCallState('connected');
        startCallTimer();
        showAlert('Call connected', 'success');
      }
    });

    return () => unsubscribe();
  }, []);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Standard way to trigger warning
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Main Zego initialization
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

        const userID = userId || userInfo?.mentor?.id?.toString() || "user_" + uuidv4();
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
            
            // When a stream is added, update call state to connected
            if (callState === 'calling') {
              console.log("Remote stream detected, changing to connected state");
              setCallState('connected');
              startCallTimer();
            }
            
            streamList.forEach(async (stream) => {
              console.log("stream id is " + stream.streamID);
              const remoteStream = await zg.startPlayingStream(stream.streamID);
              setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);
        
              // Display the remote stream in the remote video element
              const remoteVideoElement = document.getElementById('remoteVideo');
              if (remoteVideoElement) {
                remoteVideoElement.srcObject = remoteStream;
              } else {
                console.log('Video element with ID "remoteVideo" not found');
              }
            });
          } else if (updateType === 'DELETE') {
            showAlert("Remote participant's stream ended", "info");
            
            // If the remote stream is removed, end the call
            endCall();
          }
        });

        zg.on('roomUserUpdate', (roomID, updateType, userList) => {
          console.log("User update type is " + JSON.stringify(updateType));
          if (updateType === 'ADD') {
            showAlert(`User joined the call`, "info");
            
            // When users join, it's a good indicator that the call is connected
            if (callState === 'calling') {
              console.log("User joined, changing to connected state");
              setCallState('connected');
              startCallTimer();
            }
          } else if (updateType === 'DELETE') {
            showAlert(`User left the call`, "info");
            // When the other user leaves, end the call
            endCall();
          }
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
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
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

  const sendIOSNotification = async() =>{
    const mytoken = localStorage.getItem('notificationToken');
    const data = {
      recipientId: userData.id,
      callerName:userName,
      roomId:randomRoomId,
      teacherToken:mytoken,
      hasVideo:true

    };
    try{
      const response = await fetch('https://sisyabackend.in/student/send_call_ios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if(result.success){
        showAlert("Call notification sent to recipient", "success");
      }else{
        showAlert("IOS Call notification failed", "success");
      }

    }catch(error){
    console.log("failed ios notification", error);
    }
  }
  
  const initiateCall = async() => {
    const mytoken = localStorage.getItem('notificationToken');
    try {
      const data = {
        notification:{
          title: `${userName} is calling`,
          body: "Doubt Call"
        },
        data:{
         type: 'video_call',
         callerName: userName,
         teacherToken: mytoken,
         roomId: randomRoomId,
     
        },
        // apns: {
        //   headers: {
        //     "apns-priority": "10",
        //     "apns-push-type": "background",
        //     "apns-expiration": "0"
        //   },
        //   payload: {
        //     aps: {
        //       "content-available": 1,
        //       sound: "default",
            
        //       alert: {
        //         title: `${userName} is calling`,
        //         body: "Doubt Call"
        //       },
             
        //     }
        //   }
        // },
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
        sendIOSNotification();
     //   showAlert("Call notification sent to recipient", "success");
      } else {
        console.log("calling notification sent failed");
        showAlert("Failed to send call notification", "warning");
      }
    } catch (error) {
      console.log('JSON Stringify Error:', error);
      showAlert("Error sending call notification", "error");
    }
  };

  const confirmEndCall = () => {
    setOpenDialog(false);
    endCall();
  };

  const endCall = async() => {
    try {
      const data = {
        notification:{
          title: "ending call",
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
  };

  const leaveRoom = () => {
    if (zegoEngine) {
      zegoEngine.stopPublishingStream(videostreamID);
      zegoEngine.logoutRoom(roomID);
      zegoEngine.destroyEngine();
      console.log('Left room and stopped publishing' + roomID);
      showAlert("You have left the video call", "info");
      navigate("../teacher");
    }
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
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: '#f44336',
            color: 'white',
            width: 60,
            height: 60,
            '&:hover': { backgroundColor: '#d32f2f' },
          }}
        >
          <ExitToApp size={24} />
        </IconButton>
      </Box>
      
      {/* Hidden local video during calling state */}
      <Box sx={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <video id="localVideo" autoPlay playsInline muted></video>
      </Box>
    </Box>
  );

  // Render the connected call UI (similar to LiveClassRoom layout)
  const renderConnectedUI = () => (
    <Box
      className="App"
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Box
        className={`main-content-classroom`}
        sx={{ display: "flex", flex: 1, backgroundColor: "#f5f5f5" }}
      >
        {/* Left Panel - Main Video (Remote User) */}
        <Box
          className="left-panel"
          sx={{
            flex: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#e0e0e0",
            position: "relative",
          }}
        >
          <video
            id="remoteVideo"
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          ></video>

          {/* Call Duration Overlay */}
          <Box
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
          </Box>
        </Box>

        {/* Right Panel - Local Video */}
        <Box
          className="right-panel"
          sx={{ flex: 3, display: "flex", flexDirection: "column", padding: 2 }}
        >
          <video
            className="host-video"
            autoPlay
            playsInline
            muted
            id="localVideo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
            }}
          ></video>
        </Box>
      </Box>

      {/* Footer with Controls */}
      <Box
        className="footer"
        sx={{
          display: "flex",
          justifyContent: "space-around",
          padding: 2,
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <IconButton
          color={isMuted ? "secondary" : "primary"}
          onClick={toggleMute}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>
        <IconButton
          color={!isCameraEnabled ? "secondary" : "primary"}
          onClick={toggleCamera}
        >
          {isCameraEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpenDialog(true)}
          startIcon={<ExitToApp />}
        >
          End Call
        </Button>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm End Call</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this call?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={confirmEndCall} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
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