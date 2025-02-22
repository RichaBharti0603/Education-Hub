document.addEventListener("DOMContentLoaded", () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50, // Adjust for header height
                    behavior: "smooth"
                });
            }
        });
    });

    // Connect to the server via Socket.io
    const socket = io("http://localhost:5000");

    // Join Room functionality
    const joinRoomButton = document.getElementById("joinRoom");
    const roomIdInput = document.getElementById("roomId");

    if (joinRoomButton && roomIdInput) {
        joinRoomButton.addEventListener("click", () => {
            const roomId = roomIdInput.value.trim();
            if (roomId) {
                console.log(`Joining room: ${roomId}`);
                socket.emit("join-room", roomId);
            } else {
                alert("Please enter a valid Room ID.");
            }
        });
    }

    // Listen for user-joined event
    socket.on("user-joined", ({ id, users }) => {
        console.log(`User ${id} joined. Current users in room:`, users);
    });

    // Handle incoming messages
    socket.on("message", ({ text, sender }) => {
        console.log(`Message from ${sender}: ${text}`);
    });

    // Handle user leaving the room
    socket.on("user-left", ({ id, users }) => {
        console.log(`User ${id} left. Remaining users:`, users);
    });
});
