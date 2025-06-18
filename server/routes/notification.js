const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middlewares/auth');

// @route   GET /api/notifications
// @desc    Get notifications for logged in user (or all if admin requested and no specific user)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Kullanıcıya özel ve herkese açık bildirimleri getir
    const notifications = await Notification.find({
      $or: [{ userId: req.user.id }, { userId: null }],
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/notifications (Bu route admin panelinden HTTP ile bildirim göndermek için)
// @desc    Create a notification (usually by admin)
// @access  Private/Admin
// NOT: Socket.IO üzerinden bildirim gönderme server.js içinde olacak.
// Bu route, admin paneli gibi HTTP tabanlı bir arayüzden bildirim göndermek için kullanılabilir.
router.post('/', protect, admin, async (req, res) => {
  const { message, targetUserId } = req.body; // targetUserId null ise herkese gider
  const io = req.app.get('socketio'); // server.js'den io'yu al

  try {
    const newNotificationData = {
      message,
      userId: targetUserId || null, // Eğer targetUserId yoksa null (herkese)
    };
    const notification = new Notification(newNotificationData);
    await notification.save();

    if (targetUserId) {
      // Belirli kullanıcıya
      const userSocketId = req.app.get('userSocketMap')[targetUserId];
      if (userSocketId) {
        io.to(userSocketId).emit('new_notification', notification);
      }
    } else {
      // Herkese
      io.emit('new_notification', notification);
    }
    res.status(201).json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Sadece kendi bildirimini veya herkese açık bir bildirimi okundu işaretleyebilir
    if (notification.userId && notification.userId.toString() !== req.user.id) {
         // Herkese açık bir bildirim ise ve bu kullanıcıya ait değilse,
         // bu kullanıcı için yeni bir "okundu" kaydı oluşturmak yerine,
         // frontend tarafında local state'te yönetilebilir veya
         // daha karmaşık bir "okundu bilgisi" modeli gerekebilir.
         // Şimdilik, sadece kendi bildirimlerini işaretleyebilsin.
         // VEYA: eğer userId null ise, herkes okuyabilir, bu durumda okundu bilgisi
         // kullanıcıya özel bir tabloda tutulmalı. Basitlik için bu adımı atlıyoruz.
         // Şu anki mantıkta, userId null olan bildirimler herkes tarafından "okundu" işaretlenemez.
         // Bu, daha gelişmiş bir senaryodur.
        if (notification.userId !== null){ // Eğer bildirim spesifik bir kullanıcıya aitse ve o kullanıcı bu değilse
            return res.status(403).json({ message: 'Not authorized to mark this notification' });
        }
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;