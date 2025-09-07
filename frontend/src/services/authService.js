// src/services/authService.js
import api from './api'; // Import the central api instance

// No need for a separate API_URL here anymore

// Function to register a user
export const registerUser = async (userData) => {
  // Use the imported api instance
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Function to log in a user
export const loginUser = async (userData) => {
  // Use the imported api instance
  const response = await api.post('/auth/login', userData);
  return response.data;
};