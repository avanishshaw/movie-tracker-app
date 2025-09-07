// src/services/api.js
import axios from 'axios';
import useAuthStore from '../store/authStore';

// Read the one and only API base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // This message is helpful for local development
  console.error("VITE_API_BASE_URL is not set. Please check your .env file.");
}

const api = axios.create({
  // All requests will now start with, for example, https://your-backend.onrender.com/api/v1
  baseURL: `${API_BASE_URL}/api/v1`,
});

// This interceptor adds the login token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;