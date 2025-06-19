import React, { useState, useEffect } from "react";
import { socket } from "../services/socket";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NotificationArea() {
  const [notifications, setNotifications] = useState([]);
  const { token, currentUser } = useAuth();

  useEffect(() => {
    if (!token || !currentUser) return;

    // mevcut bildirimler
    notificationService
      .getNotifications(token)
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => console.error("Error fetching notifications:", error));

    // yeni bildirimler
    const handleNewNotification = (notification) => {
      console.log("New notification received via socket:", notification);
      if (
        notification.userId === null ||
        notification.userId === currentUser.id
      ) {
        setNotifications((prev) => [notification, ...prev]);
        toast.info(
          <div className="flex items-start">
            <div>
              <strong>Yeni Bildirim:</strong> {notification.message}
              <span className="block text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      }
    };

    const handleError = (errorMsg) => {
      toast.error(`Hata: ${errorMsg.message}`);
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("error_message", handleError);

    if (socket.disconnected) {
      console.log("Socket is disconnected, attempting to connect...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected for notifications:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      toast.error(
        `Socket bağlantı hatası: ${err.message}. Sayfayı yenileyin veya tekrar giriş yapın.`
      );
    });

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("error_message", handleError);
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [token, currentUser]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === id) {
            const updatedReadBy = Array.isArray(n.readBy) ? [...n.readBy] : [];
            if (!updatedReadBy.includes(currentUser.id)) {
              updatedReadBy.push(currentUser.id);
            }
            return { ...n, readBy: updatedReadBy };
          }
          return n;
        })
      );
      toast.success("Bildirim okundu olarak işaretlendi.");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Bildirim okundu olarak işaretlenemedi.");
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 text-center my-4">
        <p className="text-slate-600 dark:text-slate-300">
          Bildirimleri görmek için lütfen giriş yapın.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white  shadow-xl rounded-lg p-4 sm:p-6 my-4 w-full max-w-2xl mx-auto">
      <h3 className="text-xl sm:text-2xl font-semibold text-slate-800  mb-6 border-b pb-3 border-slate-200">
        Bildirimleriniz
      </h3>
      {notifications.length === 0 ? (
        <p className="text-slate-500  py-4 text-center">
          Gösterilecek yeni bildiriminiz bulunmuyor.
        </p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => {
            return (
              <li
                key={notif._id}
                className={`
                p-4 rounded-lg shadow-md border 
                transition-all duration-300 ease-in-out
                flex flex-col sm:flex-row sm:justify-between sm:items-start 
                space-y-3 sm:space-y-0 sm:space-x-4
                ${
                  notif.readBy.includes(currentUser.id)
                    ? "bg-slate-50  border-slate-200  opacity-70 hover:opacity-100"
                    : "bg-sky-50  border-sky-300 hover:shadow-lg"
                }
              `}
              >
                <div className="flex-grow">
                  <p
                    className={`font-medium mb-1.5 ${
                      notif.readBy.includes(currentUser.id)
                        ? "text-slate-600 "
                        : "text-slate-800 "
                    }`}
                  >
                    {notif.message}
                  </p>
                  <div
                    className={`text-xs space-y-0.5 ${
                      notif.readBy.includes(currentUser.id)
                        ? "text-slate-500 "
                        : "text-slate-500 "
                    }`}
                  >
                    <span className="block">
                      <span className="font-medium">Alınma:</span>{" "}
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                    <span className="block">
                      <span className="font-medium">Kime:</span>{" "}
                      {notif.userId && notif.userId !== currentUser.id
                        ? `Kullanıcı ID: ${notif.userId}`
                        : notif.userId === currentUser.id
                        ? "Size Özel"
                        : "Herkese"}
                    </span>
                  </div>
                </div>

                {!notif.readBy.includes(currentUser.id) &&
                  (notif.userId === currentUser.id ||
                    notif.userId === null) && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="
                    cursor-pointer self-start sm:self-center mt-2 sm:mt-0 px-3 py-1.5 
                    text-xs font-semibold rounded-md shadow-sm
                    bg-blue-600 hover:bg-blue-700 text-white 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    transition-colors whitespace-nowrap
                  "
                    >
                      Okundu İşaretle
                    </button>
                  )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default NotificationArea;
