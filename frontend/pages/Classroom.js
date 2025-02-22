import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";


const socket = io("http://localhost:5000");

const Classroom = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnection = useRef(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // ✅ Initialize WebRTC Peer Connection
  const initializePeerConnection = useCallback(() => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", { candidate: event.candidate, roomId });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  }, [roomId]);

  // ✅ Handle WebRTC Events
  useEffect(() => {
    if (!roomId) return;

    socket.emit("join-room", roomId);
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("user-joined", ({ users }) => setUsers(users));
    socket.on("offer", async ({ offer }) => {
      initializePeerConnection();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    return () => {
      socket.off("message");
      socket.off("user-joined");
      socket.off("offer");
    };
  }, [roomId, initializePeerConnection]);

  // ✅ Start Video Call
  const startCall = async () => {
    initializePeerConnection();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
  };

  // ✅ Screen Sharing Feature
  const shareScreen = async () => {
    try {
      if (!isSharingScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        screenStream.getTracks().forEach((track) => peerConnection.current.addTrack(track, screenStream));
        setIsSharingScreen(true);
      } else {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        setIsSharingScreen(false);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  // ✅ Start Recording
  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = saveRecording;
    mediaRecorderRef.current.start();
  };

  // ✅ Stop Recording and Save
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
  };

  // ✅ Save Recording as File
  const saveRecording = () => {
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "classroom_recording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="classroom">
      <h2>Classroom: {roomId}</h2>

      {/* Video Section */}
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>

      <button onClick={startCall}>Start Call</button>
      <button onClick={shareScreen}>{isSharingScreen ? "Stop Sharing" : "Share Screen"}</button>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop & Download</button>

      {/* Participants List */}
      <div className="participants">
        <h3>Participants</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="chat">
        <h3>Chat</h3>
        <div className="messages">
          {messages.map((msg, index) => (
            <p key={index}>{msg.text}</p>
          ))}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={() => socket.emit("message", { roomId, text: newMessage })}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Classroom;
