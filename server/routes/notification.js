const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect, admin } = require("../middlewares/auth");

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user.id }, { userId: null }],
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// admin paneli gibi HTTP tabanlı bir arayüzden bildirim göndermek
router.post("/", protect, admin, async (req, res) => {
  const { message, targetUserId } = req.body;
  const io = req.app.get("socketio"); // server.js'den io'yu al

  try {
    const newNotificationData = {
      message,
      userId: targetUserId || null,
    };
    const notification = new Notification(newNotificationData);
    await notification.save();

    if (targetUserId) {
      // Belirli kullanıcıya
      const userSocketId = req.app.get("userSocketMap")[targetUserId];
      if (userSocketId) {
        io.to(userSocketId).emit("new_notification", notification);
      }
    } else {
      // Herkese
      io.emit("new_notification", notification);
    }
    res.status(201).json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.userId && notification.userId.toString() !== req.user.id) {
      if (notification.userId !== null) {
        return res
          .status(403)
          .json({ message: "Not authorized to mark this notification" });
      }
    }
    if (!notification.readBy.includes(req.user.id)) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
