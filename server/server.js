import express from "express";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import User from "./models/User.js";
import Notification from "./models/Notification.js";
import authRoutes from "./routes/auth.js";
import notificationRoutes from "./routes/notification.js";

connectDb();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});
app.set("socketio", io);

const userSocketMap = {}; // userId:socketId
app.set("userSocketMap", userSocketMap);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        socket.user = user; // socket nesnesine kullanıcı bilgisi
        return next();
      }
      return next(new Error("Authentication error: User not found"));
    } catch (error) {
      console.log("Socket Auth Error:", error.message);
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
    console.log("userSocketMap updated", userSocketMap);
  }

  socket.on("admin_send_notification", async (data) => {
    if (!socket.user || socket.user.role !== "admin")
      return socket.emit("error_message", { message: "Not authorized." });

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
        io.emit("new_notification", notification);
        console.log("Notification broadcasted to all users.");
      }
      socket.emit("notification_sent_ack", { success: true, notification });
    } catch (error) {
      console.error("Error sending notification via socket:", error);
      socket.emit("error_message", { message: "notification could not be sent" });
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

app.get("/", (req, res) => res.send("API running."));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server is running on port: ${PORT}.`));
