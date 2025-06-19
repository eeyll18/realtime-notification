require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const User = require("./models/User");
const Notification = require("./models/Notification");

const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notification");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
  },
});

app.set("socketio", io); // io'yu route'larda kullanabilmek için 

// user id ve socket id için
const userSocketMap = {}; 
app.set("userSocketMap", userSocketMap); 

// middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        socket.user = user; // user
        return next();
      }
    } catch (err) {
      console.log("Socket Auth Error:", err.message);
      return next(new Error("Authentication error"));
    }
  }
  return next(new Error("Authentication error: Token required"));
});

io.on("connection", (socket) => {
  console.log(
    `User connected: ${socket.id}, UserID: ${
      socket.user ? socket.user.id : "Guest"
    }`
  );

  if (socket.user) {
    userSocketMap[socket.user.id.toString()] = socket.id;
    console.log("UserSocketMap updated:", userSocketMap);
  }

  // socket ile notify
  socket.on("admin_send_notification", async (data) => {
    if (!socket.user || socket.user.role !== "admin") {
      return socket.emit("error_message", { message: "Not authorized" });
    }

    try {
      const newNotificationData = {
        message: data.message,
        userId: data.targetUserId || null,
      };
      const notification = new Notification(newNotificationData);
      await notification.save();

      if (data.targetUserId) {
        const targetSocketId = userSocketMap[data.targetUserId.toString()];
        if (targetSocketId) {
          io.to(targetSocketId).emit("new_notification", notification);
          console.log(
            `Notification sent to user ${data.targetUserId} via socket ${targetSocketId}`
          );
        } else {
          console.log(
            `User ${data.targetUserId} not connected or socketId not found.`
          );
        }
      } else {
        io.emit("new_notification", notification);  // io - herkes
        console.log("Notification broadcasted to all users.");
      }
      socket.emit("notification_sent_ack", { success: true, notification }); // admin'e
    } catch (error) {
      console.error("Error sending notification via socket:", error);
      socket.emit("error_message", { message: "Bildirim gönderilemedi." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.user) {
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
      console.log("UserSocketMap updated after disconnect:", userSocketMap);
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));