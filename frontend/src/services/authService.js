// src/services/authService.js
import axios from 'axios';

// Set up the base URL for our backend API
const API_URL = 'http://localhost:5001/api/v1/auth';

const api = axios.create({
  baseURL: API_URL,
});

// Function to register a user
export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

// Function to log in a user
export const loginUser = async (userData) => {
  const response = await api.post('/login', userData);
  return response.data;
};