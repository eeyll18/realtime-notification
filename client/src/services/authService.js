import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = `${API_BASE_URL}/api/auth`;

const register = (username, password, role = "user") => {
  return axios.post(`${API_URL}/register`, { username, password, role });
};

const login = (username, password) => {
  return axios.post(`${API_URL}/login`, { username, password });
};

const getUsers = (token) => {
  return axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default { register, login, getUsers };
