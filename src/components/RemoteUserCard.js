import React, { useEffect, useRef, useState } from "react";
import { CameraOff, Mic, MicOff } from "lucide-react";
import { Box, IconButton } from "@mui/material";

const RemoteUserCard = ({ remote }) => {
  const videoRef = useRef(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && remote.stream) {
      videoRef.current.srcObject = remote.stream;
      videoRef.current.play().catch((error) => {
        console.error("Error playing remote stream:", error);
      });
    }

    const videoTrack = remote.stream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.muted || !videoTrack.enabled) {
      setIsVideoEnabled(false);
    } else {
      setIsVideoEnabled(true);
    }
  }, [remote.stream]);

  return (
    <Box
      sx={{
        width: 192, 
        height: 192,
        borderRadius: 4,
        bgcolor: "black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: "#02bdfe",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CameraOff style={{ width: 40, height: 40, color: "white" }} />
        </Box>
      )}
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8,
          display: "flex",
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
            color: "white",
          }}
        >
          {remote.isMuted ? (
            <MicOff style={{ width: 16, height: 16 }} />
          ) : (
            <Mic style={{ width: 16, height: 16 }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default RemoteUserCard;
