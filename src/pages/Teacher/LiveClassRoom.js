import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";

import { ZegoExpressEngine } from "zego-express-engine-webrtc";

import { getUser } from "../../Functions/Login";
import socketService from "../../Sockets/socketConfig";

import {
  Box,
  Grid,
  Tabs,
  Tab,
  Button,
  TextField,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorUp,
  MonitorX,
  LogOut,
  MessageSquare,
  User,
  Mail,
  Send,
  Speaker,
} from "lucide-react";
import { styled } from "@mui/material/styles";
import RemoteUserCard from "../../components/RemoteUserCard";
import { Announcement, AnnouncementRounded } from "@mui/icons-material";

const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: "#02bdfe",
  },
});

const StyledTab = styled(Tab)({
  minWidth: 0,
  color: "rgba(0, 0, 0, 0.7)",
  "&.Mui-selected": {
    color: "#02bdfe",
    fontWeight: "bold",
  },
});

const LiveClassRoom = () => {
  const userInfo = getUser();
  const location = useLocation();
  const navigate = useNavigate();

  const { streamInfo, mentorId, sessionId,ctype } = location.state || {};

  const appID = 1500762473; // Your App ID
 // const serverSecret = "175fa0e5958efde603f2ec805c7d6120"; // Your Server Secret

  const userName = userInfo.mentor.name;
  const roomID = streamInfo.roomId;
  const videostreamID = "hostvideo_" + uuidv4();
  const screenStreamID = "hostscreen_" + uuidv4();

  const [zegoEngine, setZegoEngine] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [buyNowLink, setBuyNowLink] = useState("");
  const [isBuyNowActive, setIsBuyNowActive] = useState(false);
  const hostVideoRef = useRef(null);
  const hostVideoRef2 = useRef(null);
  const screenShareRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState([]);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [taskID, setTaskID] = useState();
  const [userList, setUserList] = useState([]);

  const [speakRequests, setSpeakRequests] = useState([]);

  const [tabValue, setTabValue] = useState("chats");

  // const [forceRetoggleCamera, setForceRetoggleCamera] = useState(false);

  const userEnterAudio = new Audio("../../../public/user_enter.mp3");
  const messageAudio = new Audio("../../../public/message_recived.mp3");
  const micReqAudio = new Audio("../../../public/mic_req.mp3");

  useEffect(() => {
    const tokenvalue = localStorage.getItem("token") || "";
    // const token = 'YOUR_AUTH_TOKEN';
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

        micReqAudio.play().catch((error) => {
          console.error("Mic request audio play failed:", error);
        });
        setSpeakRequests((prevRequests) => [...prevRequests, data]);
      });

      return () => {
        console.log("clear is called");
        clearInterval(streamInfoInterval);
      };
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

    // const startRecording = async() => {
    //  console.log("course type is ", ctype);
    //  if(ctype === "long"){
    //     try{

    //       const response = await fetch(
    //         "https://cloudrecord-api.zego.im/?Action=StartRecord",
    //         {
    //           method: "POST",
    //           headers: {
    //             "Content-Type": "application/json",
    //           },
    //           body: JSON.stringify({
    //             roomId: roomID,
    //             RecordInputParams: {
    //                 RecordMode: 1,
    //                 StreamType: 3,
    //                 MaxIdleTime: 60
    //              },
    //              RecordOutputParams: {
    //              OutputFileFormat: "mp4",
    //              OutputFolder: "record/"
    //              },
    //              StorageParams: {
    //               Vendor: 10,
    //               Region: "Europe (Stockholm) eu-north-1",
    //                Bucket: "sisyaclassrecordings",
    // }
              
    //           }),
    //         }
    //       );
    //       const result = await response.json();

    //       if(response.Code === 0){
    //          console.log("recording started successfully", JSON.stringify(result));
    //          setTaskID(result.Data.TaskId);

    //       }else{
    //         console.log("recording start failed", JSON.stringify(response));
    //       }
            
    //     }catch(error){
    //       console.log("recording start failed", error);
    //     }
    //  }else{
    //   console.log("invalid course to record");
    //  }
    // }

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
            videoQuality: 4,
            width: 1280,
            height: 720,
            bitrate: 1500,
            frameRate: 20,
          },
        });
        setLocalStream(stream);

        if (hostVideoRef.current) {
          hostVideoRef.current.srcObject = stream;
        }

        if (hostVideoRef2.current) {
          hostVideoRef2.current.srcObject = stream;
        }

        zg.startPublishingStream(videostreamID, stream);

        zg.on("publisherStateUpdate", (result) => {
          if (result.state === "PUBLISHING") {
            console.log("Publishing started😁😁😁😁");

          //  startRecording();
          } else if (result.state === "NO_PUBLISH") {
            console.log(
              `Publishing failed with error code 😒😒😒😒: ${result.errorCode}`
            );
          }
        });

        zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
          console.log(
            "Room stream update type is " + JSON.stringify(streamList)
          );

          if (updateType === "ADD") {
            for (const s of streamList) {
              const stream = await zg.startPlayingStream(s.streamID);
              const audioTrack = stream.getAudioTracks()[0];
              const isMuted = !audioTrack || audioTrack.muted;

              setRemoteStreams((prev) => [
                ...prev,
                { streamID: s.streamID, stream },
              ]);
            }
          }
          if (updateType === "DELETE") {
            setRemoteStreams((prev) =>
              prev.filter(
                (r) => !streamList.some((st) => st.streamID === r.streamID)
              )
            );
          }
        });

        zg.on("IMRecvBroadcastMessage", (roomID, chatData) => {
          if (chatData && chatData.length > 0) {
            messageAudio.play().catch((error) => {
              console.error("Message audio play failed:", error);
            });

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

          userEnterAudio.play().catch((error) => {
            console.error("Audio play failed:", error);
          });

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
        if (error) {
          console.log(error);
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

  // const stopRecording = async() => {
  //   console.log("course type is ", ctype);
  //   if(ctype === "long"){
  //      try{

  //        const response = await fetch(
  //          "https://cloudrecord-api.zego.im/?Action=StopRecord",
  //          {
  //            method: "POST",
  //            headers: {
  //              "Content-Type": "application/json",
  //            },
  //            body: JSON.stringify({  
  //                TaskId: taskID 
  //            }),
  //          }
  //        );
  //        const result = await response.json();

  //        if(response.Code === 0){
  //           console.log("recording stop successfully", JSON.stringify(result));
  //           setTaskID(result.Data.TaskId);
            
  //        }else{
  //          console.log("recording stop failed", JSON.stringify(response));
  //        }
           
  //      }catch(error){
  //        console.log("recording stop failed", error);
  //      }
  //   }else{
  //    console.log("invalid course to record");
  //   }
  //  }

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

        if (hostVideoRef.current) {
          console.log("getting videoElement");
          hostVideoRef.current.srcObject = null; // Clear the current stream

          hostVideoRef.current.srcObject = localStream; // Reattach the local stream
          hostVideoRef.current.play(); // Play the video stream to ensure it's active
        } else {
          console.log("not getting videoElement");
        }
        if (hostVideoRef2.current) {
          console.log("getting videoElement");
          hostVideoRef2.current.srcObject = null; // Clear the current stream

          hostVideoRef2.current.srcObject = localStream; // Reattach the local stream
          hostVideoRef2.current.play(); // Play the video stream to ensure it's active
        } else {
          console.log("not getting videoElement");
        }
      }
    }
  };

  const toggleMute = () => {
    if (localStream) {
      if (!zegoEngine) {
        console.log("zego is not intiated yet");
        return;
      }
      if (isMuted) {
        zegoEngine.muteMicrophone(false);
        setIsMuted(false);
      } else {
        zegoEngine.muteMicrophone(true);
        setIsMuted(true);
      }
    }
  };

  const startScreenShare = async () => {
    if (zegoEngine) {
      try {
        const screenStream = await zegoEngine.createStream({
          screen: {
            audio: true,
            videoQuality: 4,
            width: 1280,
            height: 720,
            bitrate: 1500,
            frameRate: 20,
          },
        });
        setScreenStream(screenStream);
        setIsScreenShared(true);

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
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

        if (screenShareRef.current) {
          screenShareRef.current.onended = () => {
            stopScreenShare();
          };
        }
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

      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
    }
  };

  const sendMessage = () => {
    if (!zegoEngine || message.trim() === "") return;
    zegoEngine
      .sendBroadcastMessage(roomID, message)
      .then(() => {
        setMessages((prev) => [
          ...prev,
          { userID: mentorId, userName, message },
        ]);
        setMessage("");
      })
      .catch((error) => {
        console.error("Failed to send message:", error); // Detailed error logging
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
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
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (!zegoEngine) return;
        zegoEngine.logoutRoom(streamInfo.roomId);
        zegoEngine.destroyEngine();
        console.log("Left room and stopped publishing", roomID);

        socketService.emit("class:end", {
          token: roomID,
          data: { isClosed: true },
        });
        socketService.emit("class:end", {
          token: streamInfo.Token,
          data: { isClosed: true },
        });
      //  stopRecording();

        navigate("../dashboard/teacher");
      } else {
        console.log("Update session failed");
      }
    } catch (error) {
      console.error("Error updating session:", error);
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

   const handleBuyNowSubmit = () => {
        if (buyNowLink.trim() === "") {
          alert("add a link first");
          return;
        }
        socketService.emit("teacher:announce", {
          token: roomID,
          data: { link: buyNowLink, isActivated: true },
        });
        setIsBuyNowActive(true);
        setOpenBuyDialog(false);
      };

      const activateShoutOut = (userInfo) => {
       
        socketService.emit("teacher:announce", {
          token: roomID,
          data: { userData: userInfo, isShoutEnabled: true },
        });
     //   setIsBuyNowActive(true);
       // setOpenBuyDialog(false);
      };
  
      const stopBuyNow = () => {
          socketService.emit("teacher:announce", {
            token: roomID,
            data: { link: buyNowLink, isActivated: false },
          });
          setIsBuyNowActive(false);
        };

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* Left Panel */}
      <Box
        sx={{
          width: "75%",
          height: "100%",
          borderRight: 1,
          borderColor: "divider",
          position: "relative",
        }}
      >
        {/* Host Video */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: !isScreenShared ? "block" : "none",
          }}
        >
          <video
            ref={hostVideoRef}
            autoPlay
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: isCameraEnabled && !isScreenShared ? "block" : "none",
            }}
          />
          {!isCameraEnabled && !isScreenShared && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "rgba(2, 189, 254, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
              }}
            >
              <CameraOff size={80} />
            </Box>
          )}
        </Box>

        {/* Draggable Host Video */}
        {/* <DraggableHostVideo
          isCameraEnabled={isCameraEnabled}
          isScreenShared={isScreenShared}
          hostVideoRef2={hostVideoRef2}
          stream={localStream}
        /> */}
        <video
          ref={hostVideoRef2}
          autoPlay
          muted
          style={{
            width: 256,
            height: 160,
            borderRadius: 4,
            objectFit: "cover",
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 1000,
            display: isScreenShared ? "block" : "none",
          }}
        />
        {!isCameraEnabled && isScreenShared && (
          <Box
            sx={{
              width: 256,
              height: 160,
              bgcolor: "#02bdfe",
              borderRadius: 4,
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              zIndex: 50,
            }}
          >
            <CameraOff size={40} />
          </Box>
        )}

        {/* Screen Share */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: isScreenShared ? "block" : "none",
          }}
        >
          <video
            ref={screenShareRef}
            autoPlay
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "black",
            }}
          />
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                onClick={toggleCamera}
                variant="contained"
                color="primary"
              >
                {isCameraEnabled ? <Camera /> : <CameraOff />}
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={toggleMute} variant="contained" color="primary">
                {isMuted ? <MicOff /> : <Mic />}
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={isScreenShared ? stopScreenShare : startScreenShare}
                variant="contained"
                sx={{
                  bgcolor: isScreenShared ? "error.main" : "primary.main",
                  "&:hover": {
                    bgcolor: isScreenShared ? "error.dark" : "primary.dark",
                  },
                }}
              >
                {!isScreenShared ? <MonitorUp /> : <MonitorX />}
              </Button>
            </Grid>
            <Grid item>
              {!isBuyNowActive ? (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => setOpenBuyDialog(true)}
                        //  startIcon={<ExitToApp />}
                        >
                          Push Button
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={stopBuyNow}
                         // startIcon={<ExitToApp />}
                        >
                          Stop Buy
                        </Button>
                      )}
            </Grid>
            <Grid item>
              <Button onClick={leaveRoom} variant="contained" color="error">
                <LogOut />
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Remote User Panel */}
        {remoteStreams.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 100,
              left: 0,
              right: 0,
              display: "flex",
              gap: 2,
              overflowX: "auto",
              p: 2,
              z: 100,
            }}
          >
            {remoteStreams.map((remote) => (
              <RemoteUserCard key={remote.streamID} remote={remote} />
            ))}
          </Box>
        )}
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          width: "25%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          centered
        >
          <Tab icon={<MessageSquare />} value="chats" />
          <Tab icon={<Mic />} value="speak" />
          <Tab icon={<User />} value="user" />
        </Tabs>

        {/* Chats */}
        {tabValue === "chats" && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 4, color: "gray" }}>
                  <Mail size={50} />
                  <Typography>No chats found</Typography>
                </Box>
              ) : (
                messages.map((msg, index) => (
                  <Typography key={msg.userID || index} sx={{ mb: 1 }}>
                    <strong>{msg.userName}: </strong> {msg.message}
                  </Typography>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box
              sx={{
                display: "flex",
                borderTop: 1,
                borderColor: "divider",
                p: 2,
              }}
            >
              <TextField
                fullWidth
                placeholder="Send message"
                size="small"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <IconButton color="primary" onClick={sendMessage}>
                <Send size={20} />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Speak Requests */}
        {tabValue === "speak" && (
          <Box sx={{ p: 2, overflowY: "auto", height: "100%" }}>
            {speakRequests.length === 0 ? (
              <Typography align="center" sx={{ color: "gray", mt: 4 }}>
                No speak requests
              </Typography>
            ) : (
              speakRequests.map((request, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{request.userName || request.userID}</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptSpeakRequest(request.userID)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeclineSpeakRequest(request.userID)}
                    >
                      Decline
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

        {/* Users */}
        {tabValue === "user" && (
          <Box sx={{ p: 2, overflowY: "auto", height: "100%" }}>
            {userList.length === 0 ? (
              <Typography align="center" sx={{ color: "gray", mt: 4 }}>
                No users found
              </Typography>
            ) : (
              userList.map((user, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{user.userName || user.userID}</Typography>
                  <IconButton
                    onClick={() => toggleUserMic(user.userID)}
                    color="primary"
                  >
                    {user.isMuted ? <MicOff /> : <Mic />}
                  </IconButton>
                  <IconButton
                    onClick={() => activateShoutOut(user)}
                    color="primary"
                  >
                    <AnnouncementRounded/>
                  </IconButton>
                </Paper>
              ))
            )}
          </Box>
        )}
      </Box>
         <Dialog open={openBuyDialog} onClose={() => setOpenBuyDialog(false)}>
                    <DialogTitle>Enter Buy Now Link</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Please enter the URL for the Buy Now button.
                      </DialogContentText>
                      <TextField
                        autoFocus
                        margin="dense"
                        label="Buy Now Link"
                        type="url"
                        fullWidth
                        variant="standard"
                        value={buyNowLink}
                        onChange={(e) => setBuyNowLink(e.target.value)}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setOpenBuyDialog(false)} color="primary">
                        Cancel
                      </Button>
                      <Button onClick={handleBuyNowSubmit} color="error">
                        Submit
                      </Button>
                    </DialogActions>
                  </Dialog>
    </Box>
  );
};

export default LiveClassRoom;