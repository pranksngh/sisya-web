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
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
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
import {
  LuCamera,
  LuCameraOff,
  LuLogOut,
  LuMic,
  LuMicOff,
  LuMonitor,
  LuMonitorUp,
  LuPower,
  LuSendHorizontal,
} from "react-icons/lu";

export default function LiveClassRoom() {
  const userInfo = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { streamInfo, mentorId, sessionId } = location.state || {};
  const appID = 1500762473; // Your App ID
  const userName = userInfo.mentor.name;
  const roomID = 1234;
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
  const [openDialogEndClass, setOpenDialogEndClass] = useState(false);
  const [activeTab, setActiveTab] = useState("CHAT"); // "CHAT","USERS","REQUESTS"

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
        const zg = new ZegoExpressEngine(appID, "wss://webliveroom1500762473-api.coolzcloud.com/ws");
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

  //end class -> my addition
  const confirmEndClass = () => {
    setOpenDialogEndClass(false);
    endSession();
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
    // setIsUserListVisible(!isUserListVisible);
    // setIsSpeakRequestVisible(false);
    setActiveTab((prev) => (prev === "USERS" ? "CHAT" : "USERS"));
  };

  const toggleSpeakRequestList = () => {
    // setIsSpeakRequestVisible(!isSpeakRequestVisible);
    // setIsUserListVisible(false);
    setActiveTab((prev) => (prev === "REQUESTS" ? "CHAT" : "REQUESTS"));
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

  return (
    <Box
      className="App"
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Box
        className={`main-content-classroom`}
        sx={{
          display: "flex",
          flex: 1,
          backgroundColor: "#f5f5f5",
        }}
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
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <Box
                  sx={{
                    mb: 4,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    p: 3,
                    mx: "auto",
                    display: "inline-block",
                  }}
                >
                  <LuMonitor size={56} color="white" />
                </Box>
                <Typography variant="h6">Start sharing your screen</Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Click the screen share button to begin
                </Typography>
              </Box>
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

          {/* Footer */}
          <Box
            className="footer"
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              p: 1,
              bgcolor: "rgba(255, 255, 255, 0.7)",
              borderRadius: 10,
            }}
          >
            <Tooltip title={isMuted ? "Unmute" : "Mute"}>
              <IconButton
                sx={{ width: 48, height: 48 }}
                color={isMuted ? "error" : "primary"}
                onClick={toggleMute}
              >
                {isMuted ? <LuMicOff size={20} /> : <LuMic size={20} />}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
            >
              <IconButton
                sx={{ width: 48, height: 48 }}
                color={!isCameraEnabled ? "error" : "primary"}
                onClick={toggleCamera}
              >
                {isCameraEnabled ? <LuCamera /> : <LuCameraOff />}
              </IconButton>
            </Tooltip>
            <Tooltip title={isScreenShared ? "Stop sharing" : "Share screen"}>
              <IconButton
                onClick={isScreenShared ? stopScreenShare : startScreenShare}
                sx={{ width: 48, height: 48 }}
                color={isScreenShared ? "error" : "primary"}
              >
                <LuMonitorUp size={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Users">
              <IconButton
                color={activeTab === "USERS" ? "primary" : "default"}
                onClick={toggleUserList}
                sx={{ width: 48, height: 48 }}
              >
                <Badge badgeContent={userList.length} color="primary">
                  <Group />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Speak Request">
              <IconButton
                color={activeTab === "REQUESTS" ? "primary" : "default"}
                onClick={toggleSpeakRequestList}
                sx={{ width: 48, height: 48 }}
              >
                <Badge badgeContent={speakRequests.length} color="primary">
                  <Campaign />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Leave room">
              <IconButton
                onClick={() => setOpenDialog(true)}
                sx={{ width: 48, height: 48 }}
                color="error"
              >
                <LuLogOut size={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="End class">
              <IconButton
                onClick={() => setOpenDialogEndClass(true)}
                sx={{ width: 48, height: 48 }}
                color="error"
              >
                <LuPower size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Right Panel */}
        <Box
          className="right-panel"
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            borderLeft: 1,
            borderColor: "black",
          }}
        >
          <video
            className="host-video"
            autoPlay
            muted
            style={{
              display: isCameraEnabled ? "block" : "none",
              width: "100%",
              height: "300px", // Fixed height for the host video
              objectFit: "cover", // Ensures the video scales properly within the fixed height
              borderBottom: "1px solid #E0E0E0",
            }}
          ></video>
          <Box
            sx={{
              flex: isCameraEnabled ? "1" : "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                variant="fullWidth"
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="black"
                indicatorColor="black"
                TabIndicatorProps={{ sx: { backgroundColor: "#333" } }}
              >
                <Tab label="Chat" value="CHAT" />
                <Tab
                  label={`Users (${userList.length})`}
                  value="USERS"
                  sx={{ color: "black" }}
                />
                <Tab
                  label={`Requests (${speakRequests.length})`}
                  value="REQUESTS"
                  sx={{ color: "black" }}
                />
              </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              {activeTab === "CHAT" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: isCameraEnabled
                      ? "calc(100vh - 360px)"
                      : "calc(100vh - 60px)",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      p: 2,
                      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {messages.length === 0 ? (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "text.secondary",
                        }}
                      >
                        <Paper
                          sx={{
                            mb: 2,
                            borderRadius: "50%",
                            backgroundColor: "rgba(0,0,0,0.1)",
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: 32, height: 32 }}
                          >
                            <path d="M8 9h8" />
                            <path d="M8 13h6" />
                            <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
                          </svg>
                        </Paper>
                        <Typography align="center">No messages yet</Typography>
                        <Typography
                          align="center"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          Start the conversation!
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {messages.map((msg, index) => (
                          <Box
                            key={index}
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography sx={{ fontWeight: 500 }}>
                                {msg.userName}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {msg.message}
                            </Typography>
                          </Box>
                        ))}
                        <div ref={messagesEndRef} />
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      gap: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <IconButton
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      color="primary"
                    >
                      <LuSendHorizontal />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {activeTab === "USERS" && (
                <List>
                  {userList.map((user, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={user.userName || user.userID} />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => toggleUserMic(user.userID)}>
                          {user.isMuted ? (
                            <MicOff size={20} />
                          ) : (
                            <Mic size={20} />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {activeTab === "REQUESTS" && (
                <List>
                  {speakRequests.map((request, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={request.userName || request.userID}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            handleAcceptSpeakRequest(request.userID)
                          }
                          sx={{ mr: 1 }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            handleDeclineSpeakRequest(request.userID)
                          }
                        >
                          Decline
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* {activeTab === "CHAT" && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <Grid container spacing={1}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      size="small"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                  </Grid>
                  <Grid item>
                    <IconButton onClick={sendMessage} color="primary">
                      <Send size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            )} */}
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog for leave room*/}
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

      {/* confirm Dialog for end class */}
      <Dialog
        open={openDialogEndClass}
        onClose={() => setOpenDialogEndClass(false)}
      >
        <DialogTitle>End Classroom</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end the class for all student?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogEndClass(false)} color="primary">
            No
          </Button>
          <Button onClick={confirmEndClass} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
