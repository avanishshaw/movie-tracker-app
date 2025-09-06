// backend/tests/utils/testHelpers.js
import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/user.model.js';
import MediaEntry from '../../src/models/mediaEntry.model.js';
import { generateToken } from '../../src/utils/jwt.util.js';

/**
 * Test helper functions for common operations
 */

export const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    ...userData,
  };

  return await User.create(defaultUserData);
};

export const createTestAdmin = async (adminData = {}) => {
  const defaultAdminData = {
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    ...adminData,
  };

  return await User.create(defaultAdminData);
};

export const createTestMedia = async (mediaData = {}, userId = null) => {
  const defaultMediaData = {
    title: 'Test Movie',
    type: 'Movie',
    director: 'Test Director',
    budget: 1000000,
    location: 'Hollywood',
    duration: '120 minutes',
    releaseYear: 2023,
    status: 'pending',
    ...mediaData,
  };

  if (userId) {
    defaultMediaData.createdBy = userId;
  }

  return await MediaEntry.create(defaultMediaData);
};

export const registerUser = async (userData = {}) => {
  const defaultUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...userData,
  };

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(defaultUserData);

  return response;
};

export const loginUser = async (credentials = {}) => {
  const defaultCredentials = {
    email: 'test@example.com',
    password: 'password123',
    ...credentials,
  };

  const response = await request(app)
    .post('/api/v1/auth/login')
    .send(defaultCredentials);

  return response;
};

export const getAuthToken = async (userData = {}) => {
  const user = await createTestUser(userData);
  return generateToken(user._id, user.role);
};

export const getAdminToken = async (adminData = {}) => {
  const admin = await createTestAdmin(adminData);
  return generateToken(admin._id, admin.role);
};

export const createAuthenticatedRequest = (token) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};

export const createMediaEntry = async (token, mediaData = {}) => {
  const defaultMediaData = {
    title: 'Test Movie',
    type: 'Movie',
    director: 'Test Director',
    budget: 1000000,
    location: 'Hollywood',
    duration: '120 minutes',
    releaseYear: 2023,
    ...mediaData,
  };

  const response = await request(app)
    .post('/api/v1/media')
    .set('Authorization', `Bearer ${token}`)
    .send(defaultMediaData);

  return response;
};

export const getMediaEntries = async (token, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = queryString ? `/api/v1/media?${queryString}` : '/api/v1/media';

  const response = await request(app)
    .get(url)
    .set('Authorization', `Bearer ${token}`);

  return response;
};

export const updateMediaEntry = async (token, mediaId, updateData) => {
  const response = await request(app)
    .patch(`/api/v1/media/${mediaId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updateData);

  return response;
};

export const deleteMediaEntry = async (token, mediaId) => {
  const response = await request(app)
    .delete(`/api/v1/media/${mediaId}`)
    .set('Authorization', `Bearer ${token}`);

  return response;
};

export const approveMedia = async (adminToken, mediaId) => {
  const response = await request(app)
    .patch(`/api/v1/admin/media/${mediaId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`);

  return response;
};

export const rejectMedia = async (adminToken, mediaId) => {
  const response = await request(app)
    .patch(`/api/v1/admin/media/${mediaId}/reject`)
    .set('Authorization', `Bearer ${adminToken}`);

  return response;
};

export const getPendingMedia = async (adminToken) => {
  const response = await request(app)
    .get('/api/v1/admin/media/pending')
    .set('Authorization', `Bearer ${adminToken}`);

  return response;
};

export const getUserProfile = async (token) => {
  const response = await request(app)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${token}`);

  return response;
};

/**
 * Test data generators
 */
export const generateValidUserData = (overrides = {}) => ({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  ...overrides,
});

export const generateValidMediaData = (overrides = {}) => ({
  title: 'Test Movie',
  type: 'Movie',
  director: 'John Director',
  budget: 1000000,
  location: 'Hollywood',
  duration: '120 minutes',
  releaseYear: 2023,
  posterUrl: 'https://example.com/poster.jpg',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  ...overrides,
});

export const generateInvalidUserData = () => ({
  name: 'Jo', // Too short
  email: 'invalid-email', // Invalid format
  password: '123', // Too short
});

export const generateInvalidMediaData = () => ({
  title: '', // Empty
  type: 'Invalid Type', // Invalid enum
  director: '', // Empty
  budget: -1000, // Negative
  location: '', // Empty
  duration: '', // Empty
  releaseYear: 1800, // Too old
  posterUrl: 'not-a-url', // Invalid URL
});

/**
 * Assertion helpers
 */
export const expectSuccessfulResponse = (response, expectedStatus = 200) => {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.success).toBe(true);
};

export const expectErrorResponse = (response, expectedStatus, expectedMessage = null) => {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.success).toBe(false);
  if (expectedMessage) {
    expect(response.body.message).toBe(expectedMessage);
  }
};

export const expectValidationError = (response) => {
  expect(response.statusCode).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.errors).toBeDefined();
  expect(Array.isArray(response.body.errors)).toBe(true);
};

export const expectUnauthorizedError = (response) => {
  expect(response.statusCode).toBe(401);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('Not authorized');
};

export const expectForbiddenError = (response) => {
  expect(response.statusCode).toBe(403);
  expect(response.body.success).toBe(false);
};

export const expectNotFoundError = (response) => {
  expect(response.statusCode).toBe(404);
  expect(response.body.success).toBe(false);
};

/**
 * Database helpers
 */
export const clearDatabase = async () => {
  await User.deleteMany({});
  await MediaEntry.deleteMany({});
};

export const seedTestData = async () => {
  const user = await createTestUser();
  const admin = await createTestAdmin();
  const media = await createTestMedia({}, user._id);
  
  return { user, admin, media };
};

/**
 * Wait helper for async operations
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
