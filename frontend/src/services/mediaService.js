// src/services/mediaService.js
import api from './api';

export const getMedia = async ({ pageParam = 1 }) => {
  const response = await api.get(`/media?page=${pageParam}&limit=10`);
  return response.data;
};

// New function to create a media entry
export const createMedia = async (formData) => {
  const response = await api.post('/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// New function to update a media entry
export const updateMedia = async ({ id, formData }) => {
    // Note: We'll need to update the backend to handle file uploads on update too.
    // For now, this will update text fields.
    const response = await api.patch(`/media/${id}`, formData);
    return response.data;
}