import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NotificationArea() {
  const [notifications, setNotifications] = useState([]);
  const { token, currentUser } = useAuth();

  useEffect(() => {
    if (!token || !currentUser) return;

    // Mevcut bildirimleri yükle
    notificationService.getNotifications(token)
      .then(response => {
        setNotifications(response.data);
      })
      .catch(error => console.error("Error fetching notifications:", error));

    // Yeni bildirimleri dinle
    const handleNewNotification = (notification) => {
      console.log('New notification received via socket:', notification);
      // Sadece bu kullanıcıya ait veya herkese açık bildirimleri göster/ekle
      if (notification.userId === null || notification.userId === currentUser.id) {
        setNotifications(prev => [notification, ...prev]);
        toast.info(`Yeni Bildirim: ${notification.message} (${new Date(notification.createdAt).toLocaleTimeString()})`);
      }
    };

    const handleError = (errorMsg) => {
        toast.error(`Hata: ${errorMsg.message}`);
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('error_message', handleError); // Backend'den gelen hatalar için

    // Socket bağlantı durumunu kontrol et
    if (socket.disconnected) {
        console.log("Socket is disconnected, attempting to connect...");
        socket.connect();
    }

    socket.on('connect', () => {
        console.log('Socket connected for notifications:', socket.id);
    });
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        // toast.error(`Socket bağlantı hatası: ${err.message}. Sayfayı yenileyin veya tekrar giriş yapın.`);
    });


    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('error_message', handleError);
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [token, currentUser]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id, token);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      toast.success("Bildirim okundu olarak işaretlendi.");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Bildirim okundu olarak işaretlenemedi.");
    }
  };

  if (!currentUser) {
    return <p>Bildirimleri görmek için lütfen giriş yapın.</p>;
  }

  return (
    <div className="notification-area">
      <h3>Bildirimler</h3>
      {notifications.length === 0 && <p>Yeni bildirim yok.</p>}
      <ul>
        {notifications.map(notif => (
          <li key={notif._id} style={{ color: notif.read ? 'grey' : 'black', marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <p>{notif.message}</p>
            <small>Alınma Zamanı: {new Date(notif.createdAt).toLocaleString()}</small>
            <br />
            <small>Kime: {notif.userId ? `Kullanıcı ID: ${notif.userId}` : 'Herkese'}</small>
            {!notif.read && (
               // Sadece kendi bildirimi veya herkese açık bir bildirim ise okundu yap butonu
               (notif.userId === currentUser.id || notif.userId === null) &&
              <button onClick={() => handleMarkAsRead(notif._id)} style={{ marginLeft: '10px', fontSize: '0.8em' }}>
                Okundu İşaretle
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationArea;