// src/services/mediaService.js
import api from './api';

export const getMedia = async ({ pageParam = 1 }) => {
  const response = await api.get(`/media?page=${pageParam}&limit=10`);
  return response.data;
};

export const createMedia = async (formData) => {
  const response = await api.post('/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateMedia = async ({ id, formData }) => {
    const response = await api.patch(`/media/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// NEW: Function to delete a media entry
export const deleteMedia = async (id) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
}

export const approveMedia = async (id) => {
  const response = await api.patch(`/admin/media/${id}/approve`);
  return response.data;
};

// NEW: Function to reject a media entry (admin only)
export const rejectMedia = async (id) => {
  const response = await api.patch(`/admin/media/${id}/reject`);
  return response.data;
};