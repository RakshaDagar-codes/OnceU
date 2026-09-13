const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const setupChat = require("./socket/chat");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const mentorRoutes = require("./routes/mentors");
const requestRoutes = require("./routes/requests");
const sessionRoutes = require("./routes/sessions");
const walletRoutes = require("./routes/wallet");
const ratingRoutes = require("./routes/ratings");
const messageRoutes = require("./routes/messages");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "OnceU backend is running!" });
});

setupChat(io);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`OnceU backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();