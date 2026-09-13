const Message = require("../models/Message");
const mongoose = require("mongoose");

const setupChat = (io) => {
  io.on("connection", (socket) => {
    console.log("Chat user connected:", socket.id);

    socket.on("joinSession", (sessionId) => {
      socket.join(sessionId);
      console.log(`User ${socket.id} joined session ${sessionId}`);
    });
socket.on("sendMessage", async (data) => {
  try {
    const { sessionId, senderId, message } = data;

    // Check that IDs are valid MongoDB IDs
    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !mongoose.Types.ObjectId.isValid(senderId)
    ) {
      return;
    }

    // Save message in MongoDB
    const newMessage = await Message.create({
      session: sessionId,
      sender: senderId,
      message: message,
    });

    // Send message to everyone in this session
    io.to(sessionId).emit("receiveMessage", {
      _id: newMessage._id,
      sessionId: newMessage.session,
      senderId: newMessage.sender,
      message: newMessage.message,
      sentAt: newMessage.createdAt,
    });
  } catch (error) {
    console.error("Failed to send chat message:", error.message);
  }
});

    socket.on("disconnect", () => {
      console.log("Chat user disconnected:", socket.id);
    });
  });
};

module.exports = setupChat;