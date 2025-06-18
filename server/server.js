require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Notification = require('./models/Notification');

const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notification');

connectDB();

const app = express();
app.use(cors()); // Geliştirme için tüm originlere izin ver
app.use(express.json()); // Body parser

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React uygulamanızın adresi
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io); // io'yu route'larda kullanabilmek için app'e set et

// Kullanıcı ID'lerini socket ID'leri ile eşleştirmek için bir map
const userSocketMap = {}; // { userId: socketId }
app.set('userSocketMap', userSocketMap); // Map'i de app'e set et


// Socket.IO Authentication Middleware (isteğe bağlı ama önerilir)
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        socket.user = user; // socket nesnesine kullanıcı bilgisini ekle
        return next();
      }
    } catch (err) {
      console.log('Socket Auth Error:', err.message);
      return next(new Error('Authentication error'));
    }
  }
  // Token yoksa veya geçersizse misafir olarak devam etmesine izin verebilir veya bağlantıyı reddedebilirsiniz.
  // Şimdilik misafir olarak devam etsin, ama bazı eventler için user kontrolü yapılmalı.
  // Ya da token yoksa direkt hata ver:
  return next(new Error('Authentication error: Token required'));
});


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}, UserID: ${socket.user ? socket.user.id : 'Guest'}`);

  if (socket.user) {
    userSocketMap[socket.user.id.toString()] = socket.id;
    console.log('UserSocketMap updated:', userSocketMap);
  }


  // Admin tarafından bildirim gönderme (Socket üzerinden)
  // Bu, HTTP route'u yerine admin panelinin doğrudan socket kullanması durumunda
  socket.on('admin_send_notification', async (data) => {
    // data = { message: "Yeni duyuru!", targetUserId: "someUserId" (opsiyonel) }
    if (!socket.user || socket.user.role !== 'admin') {
      return socket.emit('error_message', { message: "Yetkiniz yok." });
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
          io.to(targetSocketId).emit('new_notification', notification);
          console.log(`Notification sent to user ${data.targetUserId} via socket ${targetSocketId}`);
        } else {
          console.log(`User ${data.targetUserId} not connected or socketId not found.`);
          // Kullanıcı bağlı değilse, DB'ye kaydedildi, bir sonraki girişinde görecek.
        }
      } else {
        io.emit('new_notification', notification); // Herkese gönder
        console.log('Notification broadcasted to all users.');
      }
      socket.emit('notification_sent_ack', { success: true, notification }); // Admin'e onay
    } catch (error) {
      console.error("Error sending notification via socket:", error);
      socket.emit('error_message', { message: "Bildirim gönderilemedi." });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.user) {
      // Eşleşmeyi kaldır
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
      console.log('UserSocketMap updated after disconnect:', userSocketMap);
    }
  });
});

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));