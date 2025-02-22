function joinRoom() {
    let roomId = document.getElementById("room-id").value;
    if (roomId) window.location.href = `chat.html?room=${roomId}`;
}

function sendMessage() {
    let messageInput = document.getElementById("message-input");
    let message = messageInput.value;
    if (message) {
        let messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
        messageInput.value = "";
    }
}
// script.js - Handles room joining & messaging
const socket = io("http://localhost:5000");

// Join Room


// Handle incoming messages
socket.on("message", ({ text, sender }) => {
    const messageContainer = document.getElementById("messages");
    const msgElement = document.createElement("div");
    msgElement.textContent = `${sender}: ${text}`;
    messageContainer.appendChild(msgElement);
});

// Send Message
