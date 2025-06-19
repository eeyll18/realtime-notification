import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = `${API_BASE_URL}/api/notifications`;

const getNotifications = (token) => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const markAsRead = (id, token) => {
  return axios.put(`${API_URL}/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Admin'in HTTP üzerinden bildirim göndermesi için
const sendNotificationByAdminHttp = (message, targetUserId, token) => {
    return axios.post(API_URL, { message, targetUserId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};


export default { getNotifications, markAsRead, sendNotificationByAdminHttp };