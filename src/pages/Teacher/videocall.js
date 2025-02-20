import React, { useEffect, useState } from 'react';
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { onMessage } from 'firebase/messaging';
import {messaging} from '../../firebaseConfig';
import { getUser } from '../../Functions/Login';
import { Button, Box, IconButton } from "@mui/material";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaSignOutAlt } from "react-icons/fa";
export default function VideoCallPage() {
  const userInfo = getUser();
  const location = useLocation();
  const navigate = useNavigate();
   const { userData,user, videotoken, roomid,userId  } = location.state || {};
  const appID = 1500762473; // Your App ID
  const serverSecret = "175fa0e5958efde603f2ec805c7d6120"; // Your Server Secret
  const userName = user.mentor.name;
  const roomID = roomid;
  const videostreamID = "hostvideo_"+uuidv4(); 
  const screenStreamID = "hostscreen_"+uuidv4();
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

  onMessage(messaging, (payload) => {
   // console.log('Message received in the foreground:', payload);
    const notificationData = payload.data;
 // console.log('Notification Data:', notificationData);

  // Check if the notification type is 'end_call'
  if (notificationData.type === 'end_call') {
   // console.log('The call has ended.');
    // Handle the 'end_call' action as needed
    leaveRoom();
  }
   });
  useEffect(() => {
  
   //read notification from user

   

    const initZego = async () => {
      try {
        const zg = new ZegoExpressEngine(appID, serverSecret);
        setZegoEngine(zg);

        const result = await zg.checkSystemRequirements();
        if (!result.webRTC) {
        //  console.log("Browser does not support required WebRTC features.");
          return;
        }

     
        const token = videotoken;

        zg.loginRoom(roomID, token, { userId, userName }, { userUpdate: true });

        zg.setDebugVerbose(false);

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
                  // Create a card for each user stream
                  remoteDiv = document.createElement('div');
                  remoteDiv.id = remoteDivID;
                  remoteDiv.className = 'user-card'; // Class for card-like style
                  document.getElementById('remoteStreams').appendChild(remoteDiv);
        
                  // Create inner elements for video and controls (mic, camera icons)
                  const videoElement = document.createElement('video');
                  videoElement.id = `video_${videostreamID}`;
                  videoElement.autoplay = true;
                  videoElement.muted = true; // Ensure audio is played for the user streams
                  videoElement.style.objectFit = 'cover';
                  remoteDiv.appendChild(videoElement);
        
                  // Add icons for mute/unmute and other controls (like the mic and camera shown in the image)
                
        
                 // console.log(`User stream added with ID: ${videostreamID}`);
                }
                document.getElementById(`video_${videostreamID}`).srcObject = stream;

        zg.startPublishingStream(videostreamID, stream);

        zg.on('publisherStateUpdate', (result) => {
          if (result.state === 'PUBLISHING') {
         //   console.log('Publishing started');
            initiateCall();
          } else if (result.state === 'NO_PUBLISH') {
          //  console.log(`Publishing failed with error code: ${result.errorCode}`);
          }
        });

        zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
         // console.log("Room stream update type is " + JSON.stringify(updateType));
        
          if (updateType === 'ADD') {
            streamList.forEach(async (stream) => {
           //   console.log("stream id is " + stream.streamID);
              const remoteStream = await zg.startPlayingStream(stream.streamID);
              setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);
        
              const streamType = stream.streamID.startsWith("hostvideo") ? 'Video' : 
                                 stream.streamID.startsWith("hostscreen") ? 'Screen' : 'User';
        
              // Add stream to a card layout based on the stream type
          //    console.log("stream type is " + streamType);
              if (streamType === 'User') {
                
                  const videoElement = document.getElementById('hostVideo');
                  if (videoElement) {
                    videoElement.srcObject = remoteStream;
                  } else {
                //    console.log('Video element with I "hostVideo" not found');
                  }
               
              }
            });
          } else if (updateType === 'DELETE') {
            streamList.forEach((stream) => {
              const streamDiv = document.getElementById(`remoteStream_${stream.streamID}`);
              if (streamDiv) {
                streamDiv.remove();
              //  console.log(`Removed user stream with ID: ${stream.streamID}`);
              }
            });
        
            setRemoteStreams((prevStreams) =>
              prevStreams.filter(s => !streamList.find(st => st.streamID === s.streamID))
            );
         //   console.log("Streams deleted:", streamList.map(s => s.streamID).join(", "));
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
      //    console.log("Usertype is " + JSON.stringify(updateType));
          if (updateType === 'ADD') {
            setUserList((prevList) => [...prevList, ...userList].map(e=>{e.isMuted=true; return e}));
            userList.forEach(user => {
              zg.muteMicrophone(user.userID, true);
            });
          } else if (updateType === 'DELETE') {
            setUserList((prevList) => prevList.filter(user => !userList.find(u => u.userID === user.userID)));
          }
        });

        zg.on('streamExtraInfoUpdate', (roomID, streamList) => {
          streamList.forEach((stream) => {
            if (stream.extraInfo && stream.extraInfo.reason === '18') {
           //   console.log('Stream refused to pull, reason: 18');
            }
          });
        });
        
      } catch (error) {
        // if (error.message.includes('network timeout') || error.code === 1100002) {
        //  console.log('Network timeout detected, attempting to reconnect...');
          setTimeout(initZego, 5000);
        // }
      }
    };

    initZego();

    return () => {
      if (zegoEngine) {
        zegoEngine.stopPublishingStream(videostreamID);
        if (screenStream) {
          zegoEngine.stopPublishingStream(screenStreamID);
        }
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
      } else {
        zegoEngine.muteMicrophone(true);
        setIsMuted(true);
      }
    }
  };
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];  // Get the video track
  
      if (isCameraEnabled) {
        // Disable the camera (turn off video track)
        videoTrack.enabled = false;  // Disable the video track
        setIsCameraEnabled(false);   // Update the state to indicate the camera is off
      } else {
        // Enable the camera (turn on video track)
        videoTrack.enabled = true;   // Re-enable the video track
        setIsCameraEnabled(true);    // Update the state to indicate the camera is on
  
        // Reattach the stream to the video element
        // const videoElement = document.getElementById('hostVideo');
        // if (videoElement) {
        //   console.log("getting videoElement");
        //   videoElement.srcObject = null; // Clear the current stream
        //   videoElement.srcObject = localStream;  // Reattach the local stream
        //   videoElement.play();  // Play the video stream to ensure it's active
        // }else{
        //   console.log("not getting videoElement")
        // }
      }
    }
  };
  
  
const initiateCall = async()=>{

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
       teacherToken: token
      },
      
      // imageData: imageFile
      //   ? {
      //       name: imageFile.name,
      //       content: base64Image,
      //     }
      //   : null,
      tokens: [userData.deviceId]
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
       //   console.log("calling notification sent");
     }else{
      //  console.log("calling notification sent failed");
     }
    
  
  } catch (error) {
  //  console.log('JSON Stringify Error:', error);
  }
}  

const endCall = async()=>{
  try {

    const data = {
      notification:{
        title: "ending call" ,
        body: "Doubt Call"
      },
      data:{
       type: 'end_call'
  
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
       //   console.log("call end working fine !!");
          leaveRoom();
     }else{
      //  console.log("end call not working");
     }
    
  
  } catch (error) {
   // console.log('JSON Stringify Error:', error);
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
        //  console.error("Screen video element not found in DOM");
        }
  
        zegoEngine.startPublishingStream(screenStreamID, screenStream);
        // const updatedStreamInfo = {
        //   ...streamInfo,
        //   screenstreamID: screenStreamID,
        // };
        // socketService.emit('broadcast:session', { token: roomID, data: updatedStreamInfo });
  
        screenStream.onended = () => {
          stopScreenShare();
        };
      } catch (error) {
      //  console.error('Error sharing screen:', error);
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
      screenVideoElement.srcObject = null;
      screenVideoElement.innerHTML = `<div class="no-screen-share"><FaDesktop class="no-screen-icon" /> <p>Start sharing your screen</p></div>`;
    }
  };

  const leaveRoom = () => {
    if (zegoEngine) {

      
      zegoEngine.stopPublishingStream(videostreamID);
      // if (screenStream) {
      //   zegoEngine.stopPublishingStream(screenStreamID);
      // }
      zegoEngine.logoutRoom(roomID);
      zegoEngine.destroyEngine();
   //   console.log('Left room and stopped publishing' + roomID);
      // socketService.emit("class:end",{token: roomID, data:{isClosed:true}});
      // socketService.emit("class:end",{token: streamInfo.Token, data:{isClosed:true}});
      navigate("../teacher");

    }
  };

  const sendMessage = () => {
    if (zegoEngine && message.trim() !== "") {
      zegoEngine.sendBroadcastMessage(roomID, message).then(() => {
        setMessages([...messages, { userID: "prashant90654", userName, message }]);
        setMessage("");
      }).catch(error => {
      //  console.error("Failed to send message", error);
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
  //  socketService.emit('toggle:mic:teacher', { token: roomID, data: { userID, isMuted: newMicStatus, raisedRequest: false } });
  };

  const handleAcceptSpeakRequest = (userID) => {
  //  console.log('Accepted speak request for user:', userID);
  //  socketService.emit('toggle:mic:teacher', { token: roomID, data: { userID, isMuted: false, raisedRequest: true } });
    setUserList(prevList =>
      prevList.map(user =>
        user.userID === userID ? { ...user, isMuted: !user.isMuted } : user
      )
    );
    setSpeakRequests((prevRequests) => prevRequests.filter(req => req.userID !== userID));
  };

  const handleDeclineSpeakRequest = (userID) => {
  //  console.log('Declined speak request for user:', userID);
   // socketService.emit('toggle:mic:teacher', { token: roomID, data: { userID, isMuted: true, raisedRequest: true } });
    setUserList(prevList =>
      prevList.map(user =>
        user.userID === userID ? { ...user, isMuted: !user.isMuted } : user
      )
    );
    setSpeakRequests((prevRequests) => prevRequests.filter(req => req.userID !== userID));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: '100vh',
        backgroundColor: "#f4f4f4",
      }}
    >
      {/* Video Section */}
      <Box
        sx={{
          flexGrow: 1,
          position: "relative", // Important for overlay
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <video
          className="receiver-host-video"
          autoPlay
          id="hostVideo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
            backgroundColor: "#000",
          }}
        ></video>

        {/* Control Buttons Overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: "20px", // Position just above the bottom edge
            left: "50%",
            transform: "translateX(-50%)", // Center horizontally
            display: "flex",
            gap: 2,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
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

      {/* Remote Streams */}
      <Box
        id="remoteStreams"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          mt: 2,
          padding: 2,
        }}
      >
        {/* Remote video streams will be dynamically added here */}
      </Box>
    </Box>
  );
}
