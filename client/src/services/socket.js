import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // Backend adresiniz

// Token'ı localStorage'dan alıp auth objesine ekleyerek bağlan
// Bu, socket.io server tarafındaki io.use middleware'i için
const token = localStorage.getItem("token");

export const socket = io(SOCKET_URL, {
  auth: {
    token: token, // Her bağlantıda token'ı gönder
  },
  // autoConnect: false // İsteğe bağlı, manuel bağlanmak için
});

// Bağlantı başarılı olduğunda token'ı yenilemek için bir fonksiyon (isteğe bağlı)
export const updateSocketToken = (newToken) => {
  if (socket && socket.connected) {
    socket.disconnect(); // Önce bağlantıyı kes
  }
  // Yeni token ile auth objesini güncelle
  socket.auth.token = newToken;
  socket.connect(); // Yeniden bağlan
};

// Veya, socket'i sadece ihtiyaç duyulduğunda başlatmak için:
/*
let socketInstance = null;

export const getSocket = () => {
    if (!socketInstance) {
        const token = localStorage.getItem('token');
        socketInstance = io(SOCKET_URL, {
            auth: { token }
        });
    }
    return socketInstance;
};
*/
