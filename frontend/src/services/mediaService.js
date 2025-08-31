// src/services/mediaService.js
import api from './api';

// We will fetch media in pages for infinite scroll
export const getMedia = async ({ pageParam = 1 }) => {
  const response = await api.get(`/media?page=${pageParam}&limit=10`); // Assuming your backend supports pagination
  return response.data;
};