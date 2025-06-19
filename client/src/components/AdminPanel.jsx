import React, { useState, useEffect } from "react";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import notificationService from "../services/notificationService";
import { toast } from "react-toastify";

function AdminPanel() {
  const [message, setMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [users, setUsers] = useState([]);
  const { currentUser, token } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === "admin" && token) {
      authService
        .getUsers(token)
        .then((response) => setUsers(response.data))
        .catch((error) => console.error("Error fetching users:", error));

      socket.on("notification_sent_ack", (data) => {
        if (data.success) {
          toast.success(
            `Bildirim başarıyla gönderildi: ${data.notification.message}`
          );
        }
      });
      socket.on("error_message", (data) => {
        toast.error(`Hata: ${data.message}`);
      });

      return () => {
        socket.off("notification_sent_ack");
        socket.off("error_message");
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
      targetUserId:
        targetUserId === "all" || !targetUserId ? null : targetUserId,
    };
    console.log("Sending notification via socket:", notificationData);
    socket.emit("admin_send_notification", notificationData);
    setMessage("");
    setTargetUserId("");
  };

  const handleSubmitHttp = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warn("Mesaj boş olamaz!");
      return;
    }
    try {
      const actualTargetUserId =
        targetUserId === "all" || !targetUserId ? null : targetUserId;
      await notificationService.sendNotificationByAdminHttp(
        message,
        actualTargetUserId,
        token
      );
      toast.success("Bildirim HTTP üzerinden başarıyla gönderildi/tetiklendi.");
      setMessage("");
      setTargetUserId("");
    } catch (error) {
      console.error("Error sending notification via HTTP:", error);
      toast.error(
        error.response?.data?.message ||
          "Bildirim HTTP üzerinden gönderilemedi."
      );
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return <p>Bu alanı görmek için admin yetkiniz olmalıdır.</p>;
  }

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 text-slate-700">
      <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center">
        Bildirim Gönder
      </h3>
      <form
        onSubmit={handleSubmitSocket}
        className="mb-10 p-6 border border-dashed border-sky-500 rounded-lg bg-sky-50 space-y-6"
      >
        <h4 className="text-xl font-semibold text-sky-700 mb-1">
          Socket ile Gönder
        </h4>
        <p className="text-sm text-sky-600 mb-4">
          Bu form ile bildirimler WebSocket üzerinden anlık olarak gönderilir.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mesaj:
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="Kullanıcılara iletilecek mesajı girin..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hedef Kullanıcı:
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
          >
            <option value="all">Herkese</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            "Herkese" seçilirse tüm aktif kullanıcılara gider.
          </p>
        </div>
        <button
          className="w-full cursor-pointer sm:w-auto px-6 py-2.5 bg-sky-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-sky-700 hover:shadow-lg focus:bg-sky-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-sky-800 active:shadow-lg transition duration-150 ease-in-out"
          type="submit"
        >
          Socket ile Gönder
        </button>
      </form>

      {/* <hr className="my-8 border-slate-300" /> */}

      <form
        onSubmit={handleSubmitHttp}
        className="mt-10 p-6 border border-dashed border-green-500 rounded-lg bg-green-50 space-y-6"
      >
        <h4 className="text-xl font-semibold text-green-700 mb-1">
          HTTP API ile Gönder
        </h4>
        <div>
          <label>Mesaj:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Kullanıcılara iletilecek mesajı girin..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hedef Kullanıcı:
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
          >
            <option value="all">Herkese</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} (ID: {user._id})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            "Herkese" seçilirse tüm kayıtlı kullanıcılara gider.
          </p>
        </div>
        <button
          className="w-full cursor-pointer sm:w-auto px-6 py-2.5 bg-green-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out"
          type="submit"
        >
          HTTP ile Gönder
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
