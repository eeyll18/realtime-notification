import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

export default function NotificationArea() {
  const [notifications, setNotifications] = useState([]);
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">📭 Yeni bildirim yok.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification, index) => (
            <li
              key={index}
              className="p-4 bg-blue-100 border border-blue-300 rounded-lg shadow-sm"
            >
              {notification}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
