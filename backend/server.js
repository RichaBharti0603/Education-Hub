const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Explicitly serve images from "gallery"
app.use("/gallery", express.static(path.join(__dirname, "public/gallery")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let rooms = {}; // Store users in rooms

io.on("connection", (socket) => {
  console.log("🔗 New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);
    io.to(roomId).emit("user-joined", { id: socket.id, users: rooms[roomId] });
  });

  socket.on("message", ({ roomId, text }) => {
    io.to(roomId).emit("message", { text, sender: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
      io.to(room).emit("user-left", { id: socket.id, users: rooms[room] });
    }
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
io.on("connection", (socket) => {
  console.log("🔗 New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(socket.id);
      io.to(roomId).emit("user-joined", { id: socket.id, users: rooms[roomId] });
  });

  socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      for (let room in rooms) {
          rooms[room] = rooms[room].filter((id) => id !== socket.id);
          io.to(room).emit("user-left", { id: socket.id, users: rooms[room] });
      }
  });
});

