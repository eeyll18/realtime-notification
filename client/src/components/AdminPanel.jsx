import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService'; // getUsers için
import notificationService from '../services/notificationService'; // HTTP ile göndermek için
import { toast } from 'react-toastify';

function AdminPanel() {
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState(''); // '' veya null ise herkese
  const [users, setUsers] = useState([]);
  const { currentUser, token } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && token) {
      authService.getUsers(token)
        .then(response => setUsers(response.data))
        .catch(error => console.error("Error fetching users:", error));

      socket.on('notification_sent_ack', (data) => {
        if (data.success) {
          toast.success(`Bildirim başarıyla gönderildi: ${data.notification.message}`);
        }
      });
      socket.on('error_message', (data) => {
          toast.error(`Hata: ${data.message}`);
      });

      return () => {
        socket.off('notification_sent_ack');
        socket.off('error_message');
      };
    }
  }, [currentUser, token]);

  const handleSubmitSocket = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warn("Mesaj boş olamaz!");
      return;
    }
    const notificationData = {
      message,
      targetUserId: targetUserId === "all" || !targetUserId ? null : targetUserId
    };
    console.log("Sending notification via socket:", notificationData);
    socket.emit('admin_send_notification', notificationData);
    setMessage('');
    setTargetUserId('');
  };

  const handleSubmitHttp = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warn("Mesaj boş olamaz!");
      return;
    }
    try {
      const actualTargetUserId = targetUserId === "all" || !targetUserId ? null : targetUserId;
      await notificationService.sendNotificationByAdminHttp(message, actualTargetUserId, token);
      toast.success("Bildirim HTTP üzerinden başarıyla gönderildi/tetiklendi.");
      setMessage('');
      setTargetUserId('');
    } catch (error) {
      console.error("Error sending notification via HTTP:", error);
      toast.error(error.response?.data?.message || "Bildirim HTTP üzerinden gönderilemedi.");
    }
  };


  if (!currentUser || currentUser.role !== 'admin') {
    return <p>Bu alanı görmek için admin yetkiniz olmalıdır.</p>;
  }

  return (
    <div className="admin-panel">
      <h3>Admin - Bildirim Gönder</h3>
      <form onSubmit={handleSubmitSocket} style={{ marginBottom: '20px', padding: '10px', border: '1px dashed blue' }}>
        <h4>Socket ile Gönder</h4>
        <div>
          <label>Mesaj:</label>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <div>
          <label>Hedef Kullanıcı (Boş bırakırsanız veya 'Herkese' seçerseniz herkese gider):</label>
          <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
            <option value="all">Herkese</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.username} (ID: {user._id})</option>
            ))}
          </select>
        </div>
        <button type="submit">Socket ile Gönder</button>
      </form>

      <hr/>

      <form onSubmit={handleSubmitHttp} style={{ marginTop: '20px', padding: '10px', border: '1px dashed green' }}>
        <h4>HTTP API ile Gönder (Backend route'u tetikler)</h4>
         <div>
          <label>Mesaj:</label>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <div>
          <label>Hedef Kullanıcı (Boş bırakırsanız veya 'Herkese' seçerseniz herkese gider):</label>
          <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
            <option value="all">Herkese</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.username} (ID: {user._id})</option>
            ))}
          </select>
        </div>
        <button type="submit">HTTP ile Gönder</button>
      </form>
    </div>
  );
}

export default AdminPanel;