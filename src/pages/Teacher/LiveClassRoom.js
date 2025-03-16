import React, { useEffect, useRef, useState } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import {
  FaMicrophoneSlash,
  FaMicrophone,
  FaVideo,
  FaVideoSlash,
  FaUsers,
  FaSignOutAlt,
  FaPaperPlane,
  FaDesktop,
  FaBullhorn,
  FaEnvelope,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  Campaign,
  DesktopWindows,
  ExitToApp,
  Group,
  MailOutline,
  Mic,
  MicOff,
  Send,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";
import { getUser } from "../../Functions/Login";
import socketService from "../../Sockets/socketConfig";
import "../../assets/css/liveclass.css";
export default function LiveClassRoom() {
  const userInfo = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { streamInfo, mentorId, sessionId } = location.state || {};
  const appID = 1500762473; // Your App ID
  const serverSecret = "175fa0e5958efde603f2ec805c7d6120"; // Your Server Secret
  const userName = userInfo.mentor.name;
  const roomID = streamInfo.roomId;
  const videostreamID = "hostvideo_" + uuidv4();
  const screenStreamID = "hostscreen_" + uuidv4();
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
  const messagesEndRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const tokenvalue = localStorage.getItem("token");
    const token = "YOUR_AUTH_TOKEN";
    const fromUUID = userInfo.mentor.uuid;
    console.log("token is " + tokenvalue);
    console.log("Initializing socket...");
    socketService.initializeSocket(tokenvalue, fromUUID);

    socketService.on("connect", () => {
      socketService.emit("join", { roomId: roomID });
      socketService.emit("join:session", { token: roomID });
      socketService.emit("role", "mentor");

      const streamInfoInterval = setInterval(() => {
        const updatedStreamInfo = {
          ...streamInfo,
          videostreamID,
          screenstreamID: screenStreamID,
        };
        socketService.emit("broadcast:session", {
          token: roomID,
          data: updatedStreamInfo,
        });
      }, 1000);

      socketService.on("request:mic:teacher", (data) => {
        console.log("got new speak request from user " + JSON.stringify(data));
        setSpeakRequests((prevRequests) => [...prevRequests, data]);
      });

      return () => clearInterval(streamInfoInterval);
    });

    socketService.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketService.on("connect_error", (error) => {
      console.log("Connection error:", error.message);
      if (error.code === 1100002) {
        console.log("Network timeout detected, attempting to reconnect...");
        setTimeout(initZego, 5000);
      }
    });

    const initZego = async () => {
      try {
        const zg = new ZegoExpressEngine(appID, serverSecret);
        setZegoEngine(zg);

        const result = await zg.checkSystemRequirements();
        if (!result.webRTC) {
          console.log("Browser does not support required WebRTC features.");
          return;
        }

        const userID = userInfo.mentor.id.toString();
        const token = streamInfo.Token;

        zg.loginRoom(roomID, token, { userID, userName }, { userUpdate: true });

        zg.setDebugVerbose(false);

        const stream = await zg.createStream({
          camera: {
            video: true,
            audio: true,
          },
        });
        setLocalStream(stream);

        const videoElement = document.getElementById("hostVideo");
        videoElement.srcObject = stream;

        zg.startPublishingStream(videostreamID, stream);

        zg.on("publisherStateUpdate", (result) => {
          if (result.state === "PUBLISHING") {
            console.log("Publishing started");
          } else if (result.state === "NO_PUBLISH") {
            console.log(
              `Publishing failed with error code: ${result.errorCode}`
            );
          }
        });

        zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
          console.log(
            "Room stream update type is " + JSON.stringify(streamList)
          );

          if (updateType === "ADD") {
            streamList.forEach(async (stream) => {
              console.log("stream id is " + stream.streamID);
              const remoteStream = await zg.startPlayingStream(stream.streamID);
              setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);

              const streamType = stream.streamID.startsWith("hostvideo")
                ? "Video"
                : stream.streamID.startsWith("hostscreen")
                ? "Screen"
                : "User";

              // Add stream to a card layout based on the stream type
              if (streamType === "User") {
                const remoteDivID = `remoteStream_${stream.streamID}`;
                let remoteDiv = document.getElementById(remoteDivID);

                if (!remoteDiv) {
                  // Create a card for each user stream
                  remoteDiv = document.createElement("div");
                  remoteDiv.id = remoteDivID;
                  remoteDiv.className = "user-card"; // Class for card-like style
                  document
                    .getElementById("remoteStreams")
                    .appendChild(remoteDiv);

                  // Create inner elements for video and controls (mic, camera icons)
                  const videoElement = document.createElement("video");
                  videoElement.id = `video_${stream.streamID}`;
                  videoElement.autoplay = true;
                  videoElement.muted = false; // Ensure audio is played for the user streams
                  videoElement.style.objectFit = "cover";
                  remoteDiv.appendChild(videoElement);

                  // Add icons for mute/unmute and other controls (like the mic and camera shown in the image)
                  const controlIcons = document.createElement("div");
                  controlIcons.className = "controls";

                  const cameraIcon = document.createElement("button");
                  cameraIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
                  cameraIcon.className = "camera-icon"; // Add styles to show camera icon
                  cameraIcon.style.cursor = "pointer";
                  //   cameraIcon.onclick = () => toggleUserMic(user.userID);
                  controlIcons.appendChild(cameraIcon);

                  remoteDiv.appendChild(controlIcons);

                  console.log(`User stream added with ID: ${stream.streamID}`);
                }
                document.getElementById(`video_${stream.streamID}`).srcObject =
                  remoteStream;
              }
            });
          } else if (updateType === "DELETE") {
            streamList.forEach((stream) => {
              const streamDiv = document.getElementById(
                `remoteStream_${stream.streamID}`
              );
              if (streamDiv) {
                streamDiv.remove();
                console.log(`Removed user stream with ID: ${stream.streamID}`);
              }
            });

            setRemoteStreams((prevStreams) =>
              prevStreams.filter(
                (s) => !streamList.find((st) => st.streamID === s.streamID)
              )
            );
            console.log(
              "Streams deleted:",
              streamList.map((s) => s.streamID).join(", ")
            );
          }
        });

        zg.on("IMRecvBroadcastMessage", (roomID, chatData) => {
          if (chatData && chatData.length > 0) {
            chatData.forEach((data) => {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  userID: data.fromUser.userID,
                  userName: data.fromUser.userName,
                  message: data.message,
                },
              ]);
            });
          }
        });

        zg.on("roomUserUpdate", (roomID, updateType, userList) => {
          console.log("Usertype is " + JSON.stringify(userList));
          if (updateType === "ADD") {
            setUserList((prevList) =>
              [...prevList, ...userList].map((e) => {
                e.isMuted = true;
                return e;
              })
            );
            userList.forEach((user) => {
              zg.muteMicrophone(user.userID, true);
            });
          } else if (updateType === "DELETE") {
            setUserList((prevList) =>
              prevList.filter(
                (user) => !userList.find((u) => u.userID === user.userID)
              )
            );
          }
        });

        zg.on("streamExtraInfoUpdate", (roomID, streamList) => {
          streamList.forEach((stream) => {
            if (stream.extraInfo && stream.extraInfo.reason === "18") {
              console.log("Stream refused to pull, reason: 18");
            }
          });
        });
      } catch (error) {
        if (
          error.message.includes("network timeout") ||
          error.code === 1100002
        ) {
          console.log("Network timeout detected, attempting to reconnect...");
          setTimeout(initZego, 5000);
        }
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

  const confirmLeaveRoom = () => {
    setOpenDialog(false);
    leaveRoom();
  };
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]; // Get the video track

      if (isCameraEnabled) {
        // Disable the camera (turn off video track)
        videoTrack.enabled = false; // Disable the video track
        setIsCameraEnabled(false); // Update the state to indicate the camera is off
      } else {
        // Enable the camera (turn on video track)
        videoTrack.enabled = true; // Re-enable the video track
        setIsCameraEnabled(true); // Update the state to indicate the camera is on

        // Reattach the stream to the video element
        const videoElement = document.getElementById("hostVideo");
        if (videoElement) {
          console.log("getting videoElement");
          videoElement.srcObject = null; // Clear the current stream
          videoElement.srcObject = localStream; // Reattach the local stream
          videoElement.play(); // Play the video stream to ensure it's active
        } else {
          console.log("not getting videoElement");
        }
      }
    }
  };

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

        const screenVideoElement = document.getElementById("screenVideo");
        if (screenVideoElement) {
          screenVideoElement.srcObject = screenStream;
        } else {
          console.error("Screen video element not found in DOM");
        }

        zegoEngine.startPublishingStream(screenStreamID, screenStream);
        const updatedStreamInfo = {
          ...streamInfo,
          screenstreamID: screenStreamID,
        };
        socketService.emit("broadcast:session", {
          token: roomID,
          data: updatedStreamInfo,
        });

        screenStream.onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  const stopScreenShare = () => {
    if (zegoEngine && screenStream) {
      zegoEngine.stopPublishingStream(screenStreamID);
      setIsScreenShared(false);
      setScreenStream(null);

      // Reset the screen share element
      const screenVideoElement = document.getElementById("screenVideo");
      screenVideoElement.srcObject = null;
      screenVideoElement.innerHTML = `<div class="no-screen-share"><FaDesktop class="no-screen-icon" /> <p>Start sharing your screen</p></div>`;
    }
  };
  const endSession = async () => {
    try {
      const response = await fetch(
        "https://sisyabackend.in/student/edit_session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: sessionId,
            isGoingOn: false,
            isDone: true,
          }), // Send bigCourseId as expected
        }
      );
      const result = await response.json();
      if (result.success) {
        zegoEngine.logoutRoom(streamInfo.roomId);
        zegoEngine.destroyEngine();
        console.log("Left room and stopped publishing" + roomID);
        socketService.emit("class:end", {
          token: roomID,
          data: { isClosed: true },
        });
        socketService.emit("class:end", {
          token: streamInfo.Token,
          data: { isClosed: true },
        });
        navigate("../dashboard/teacher");
      } else {
        console.log("update session failed");
      }
    } catch (error) {
      console.log("error updating session", error);
    }
  };
  const leaveRoom = () => {
    if (zegoEngine) {
      zegoEngine.stopPublishingStream(videostreamID);
      if (screenStream) {
        zegoEngine.stopPublishingStream(screenStreamID);
      }

      endSession();
    }
  };

  const sendMessage = () => {
    if (zegoEngine && message.trim() !== "") {
      zegoEngine
        .sendBroadcastMessage(roomID, message)
        .then(() => {
          setMessages([...messages, { userID: mentorId, userName, message }]);
          setMessage("");
        })
        .catch((error) => {
          console.error("Failed to send message", error);
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
    setUserList((prevList) =>
      prevList.map((user) =>
        user.userID === userID ? { ...user, isMuted: !user.isMuted } : user
      )
    );
    const user = userList.find((user) => user.userID === userID);
    const newMicStatus = user ? !user.isMuted : false;
    socketService.emit("toggle:mic:teacher", {
      token: roomID,
      data: { userID, isMuted: newMicStatus, raisedRequest: false },
    });
  };

  const handleAcceptSpeakRequest = (userID) => {
    console.log("Accepted speak request for user:", userID);
    socketService.emit("toggle:mic:teacher", {
      token: roomID,
      data: { userID, isMuted: false, raisedRequest: true },
    });
    setUserList((prevList) =>
      prevList.map((user) =>
        user.userID === userID ? { ...user, isMuted: !user.isMuted } : user
      )
    );
    setSpeakRequests((prevRequests) =>
      prevRequests.filter((req) => req.userID !== userID)
    );
  };

  const handleDeclineSpeakRequest = (userID) => {
    console.log("Declined speak request for user:", userID);
    socketService.emit("toggle:mic:teacher", {
      token: roomID,
      data: { userID, isMuted: true, raisedRequest: true },
    });
    setUserList((prevList) =>
      prevList.map((user) =>
        user.userID === userID ? { ...user, isMuted: !user.isMuted } : user
      )
    );
    setSpeakRequests((prevRequests) =>
      prevRequests.filter((req) => req.userID !== userID)
    );
  };

  const showBuyNowButton = ()=>{
    socketService.emit("teacher:announce",{
      token: roomID,
      data:{link:"https://sisyaclass.com/registration",isActivated:true}
    });
  }

  return (
    <Box
      className="App"
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Box
        className={`main-content-classroom`}
        sx={{ display: "flex", flex: 1, backgroundColor: "#f5f5f5" }}
      >
        {/* Left Panel */}
        <Box
          className="left-panel"
          sx={{
            flex: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#e0e0e0",
            position: "relative", // Set the container to relative
          }}
        >
          <video
            className={`screen-video`}
            autoPlay
            muted
            id="screenVideo"
            style={{
              display: isScreenShared ? "block" : "none",
              width: "100%",
              height: "100%",
              objectFit: "fill",
            }}
          ></video>
          {!isScreenShared && (
            <Box
              className="no-screen-share"
              sx={{ textAlign: "center", color: "#757575" }}
            >
              <DesktopWindows sx={{ fontSize: 50, color: "#bdbdbd" }} />
              <Typography>Start sharing your screen</Typography>
            </Box>
          )}

          <Box
            id="remoteStreams"
            className="stream-cards-container"
            sx={{
              position: "absolute", // Position relative to the parent container
              bottom: 20, // Slight margin from the bottom
              left: "50%", // Center horizontally
              transform: "translateX(-50%)", // Adjust for perfect centering
              display: "flex",
              flexWrap: "nowrap", // Ensure streams are in a single row
              gap: 10, // Add some spacing between streams
              padding: 2,
              //  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: semi-transparent background
              borderRadius: 4, // Optional: rounded corners
            }}
          ></Box>
        </Box>

        {/* Right Panel */}
        <Box
          className="right-panel"
          sx={{ flex: 3, display: "flex", flexDirection: "column", padding: 2 }}
        >
          <video
            className="host-video"
            autoPlay
            muted
            id="hostVideo"
            style={{
              display: isCameraEnabled ? "block" : "none",
              width: "100%",
              height: "300px", // Fixed height for the host video
              objectFit: "cover", // Ensures the video scales properly within the fixed height
            }}
          ></video>

          {isUserListVisible ? (
            <Paper
              className="user-list"
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: 2,
                height: "280px", // Fixed height
                overflow: "auto",
              }}
            >
              {userList.map((user, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Typography>{user.userName || user.userID}</Typography>
                  <IconButton onClick={() => toggleUserMic(user.userID)}>
                    {user.isMuted ? <MicOff /> : <Mic />}
                  </IconButton>
                </Box>
              ))}
            </Paper>
          ) : isSpeakRequestVisible ? (
            <Paper
              className="speak-request-list"
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: 2,
                height: "280px", // Fixed height
                overflow: "auto",
              }}
            >
              {speakRequests.map((request, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Typography>{request.userName || request.userID}</Typography>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleAcceptSpeakRequest(request.userID)}
                      sx={{ marginRight: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleDeclineSpeakRequest(request.userID)}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              ))}
            </Paper>
          ) : (
            <Paper
              className="chat-section"
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: 2,
                height: "280px",
              }}
            >
              <Box
                className="messages"
                sx={{
                  flex: 1,
                  overflowY: "auto", // Scrollable content
                  padding: 2,
                }}
              >
                {messages.length === 0 ? (
                  <Box
                    className="no-chats"
                    sx={{ textAlign: "center", color: "#757575" }}
                  >
                    <MailOutline sx={{ fontSize: 50, color: "#bdbdbd" }} />
                    <Typography>No chats found</Typography>
                  </Box>
                ) : (
                  messages.map((msg, index) => (
                    <Typography key={index} sx={{ marginBottom: 1 }}>
                      <strong>{msg.userName}: </strong>
                      {msg.message}
                    </Typography>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>
              <Box className="chat-input" sx={{ display: "flex", padding: 2 }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send message"
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <IconButton color="primary" onClick={sendMessage}>
                  <Send />
                </IconButton>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Footer */}
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
        <IconButton
          color={isScreenShared ? "primary" : "default"}
          onClick={isScreenShared ? stopScreenShare : startScreenShare}
        >
          <DesktopWindows />
        </IconButton>
        <IconButton color="default" onClick={toggleUserList}>
          <Badge badgeContent={userList.length} color="primary">
            <Group />
          </Badge>
        </IconButton>
        <IconButton color="default" onClick={toggleSpeakRequestList}>
          <Campaign />
        </IconButton>
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpenDialog(true)}
          startIcon={<ExitToApp />}
        >
          Leave Room
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => showBuyNowButton()}
          startIcon={<ExitToApp />}
        >
         Push Button
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Leave</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to leave the class?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={confirmLeaveRoom} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
