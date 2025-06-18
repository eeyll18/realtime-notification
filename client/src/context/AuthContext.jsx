import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { socket, updateSocketToken } from '../services/socket'; // socket ve updateSocketToken'ı import et

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
      // Token varsa socket'i yeniden yapılandır veya bağlan
      if (socket.disconnected) {
         updateSocketToken(storedToken); // Token'ı güncelle ve bağlan
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      updateSocketToken(response.data.token); // Login sonrası socket token'ını güncelle
      return response.data;
    } catch (error) {
      console.error("Login failed", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const register = async (username, password, role) => {
    try {
      const response = await authService.register(username, password, role);
       // Kayıt sonrası otomatik login isteniyorsa login fonksiyonu çağrılabilir veya token direkt set edilebilir.
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      updateSocketToken(response.data.token); // Register sonrası socket token'ını güncelle
      return response.data;
    } catch (error) {
      console.error("Registration failed", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    if (socket.connected) {
      socket.disconnect(); // Logout'ta socket bağlantısını kes
    }
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};