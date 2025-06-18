import express from "express";
const router = express.Router();
import Notification from "../models/Notification.js";
import {protect,admin} from "../middlewares/auth.js";

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user.id }, { userId: null }],
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/", protect, admin, async (req, res) => {
  const { message, targetUserId } = req.body; // targetUserId null ise herkese gider
  const io = req.app.get("socketio"); // server'dan io'yu al

  try {
    const newNotificationData = {
      message,
      userId: targetUserId || null, // null ise herkese gider
    };
    const notification = new Notification(newNotificationData);
    await notification.save();

    if (targetUserId) {
      const userSocketId = req.app.get("userSocketMap")[targetUserId];
      if (userSocketId) {
        io.to(userSocketId).emit("new_notification", notification);
      }
    } else {
      io.emit("new_notification", notification);
    }
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    if (notification.userId && notification.userId.toString() !== req.user.id) {
      if (notification.userId !== null) {
        // Eğer bildirim spesifik bir kullanıcıya aitse ve o kullanıcı bu değilse
        return res
          .status(403)
          .json({ message: "Not authorized to mark this notification" });
      }
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export default router;
