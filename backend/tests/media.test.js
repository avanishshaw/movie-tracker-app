// backend/tests/media.test.js
import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/user.model.js';
import MediaEntry from '../src/models/mediaEntry.model.js';
import { generateToken } from '../src/utils/jwt.util.js';

describe('Media Endpoints', () => {
  let userToken, adminToken, user, admin, mediaEntry;

  const validMediaData = {
    title: 'Test Movie',
    type: 'Movie',
    director: 'John Director',
    budget: 1000000,
    location: 'Hollywood',
    duration: '120 minutes',
    releaseYear: 2023,
    posterUrl: 'https://example.com/poster.jpg',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
  };

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await MediaEntry.deleteMany({});

    // Create test users
    user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });

    admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    // Generate tokens
    userToken = generateToken(user._id, user.role);
    adminToken = generateToken(admin._id, admin.role);

    // Create a test media entry
    mediaEntry = await MediaEntry.create({
      ...validMediaData,
      createdBy: user._id,
      status: 'pending',
    });
  });

  describe('POST /api/v1/media', () => {
    it('should create a new media entry successfully', async () => {
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validMediaData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        title: validMediaData.title,
        type: validMediaData.type,
        director: validMediaData.director,
        budget: validMediaData.budget,
        location: validMediaData.location,
        duration: validMediaData.duration,
        releaseYear: validMediaData.releaseYear,
        status: 'pending',
        createdBy: user._id.toString(),
      });
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('should return 401 error without authentication token', async () => {
      const res = await request(app)
        .post('/api/v1/media')
        .send(validMediaData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 error with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', 'Bearer invalid-token')
        .send(validMediaData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should return 400 error for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for invalid type', async () => {
      const invalidData = { ...validMediaData, type: 'Invalid Type' };
      
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for negative budget', async () => {
      const invalidData = { ...validMediaData, budget: -1000 };
      
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for invalid release year', async () => {
      const invalidData = { ...validMediaData, releaseYear: 1800 };
      
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for invalid URL format', async () => {
      const invalidData = { ...validMediaData, posterUrl: 'not-a-url' };
      
      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow empty poster and thumbnail URLs', async () => {
      const dataWithoutUrls = { ...validMediaData };
      delete dataWithoutUrls.posterUrl;
      delete dataWithoutUrls.thumbnailUrl;

      const res = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dataWithoutUrls);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/media', () => {
    beforeEach(async () => {
      // Create additional test data
      await MediaEntry.create({
        ...validMediaData,
        title: 'Approved Movie',
        status: 'approved',
        createdBy: user._id,
      });

      await MediaEntry.create({
        ...validMediaData,
        title: 'Another User Movie',
        status: 'pending',
        createdBy: admin._id,
      });
    });

    it('should get all media entries for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pages');
    });

    it('should return 401 error without authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/media');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/v1/media?type=Movie')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(media => media.type === 'Movie')).toBe(true);
    });

    it('should filter by location', async () => {
      const res = await request(app)
        .get('/api/v1/media?industry=Hollywood')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(media => media.location === 'Hollywood')).toBe(true);
    });

    it('should search by title and director', async () => {
      const res = await request(app)
        .get('/api/v1/media?search=Test')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/v1/media?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.page).toBe(1);
    });

    it('should show only approved media and user\'s own media for regular users', async () => {
      const res = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      res.body.data.forEach(media => {
        expect(
          media.status === 'approved' || 
          media.createdBy._id === user._id.toString()
        ).toBe(true);
      });
    });

    it('should show all media for admin users', async () => {
      const res = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      // Admin should see all media regardless of status
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/media/:id', () => {
    it('should update media entry successfully by owner', async () => {
      const updateData = { title: 'Updated Title', budget: 2000000 };
      
      const res = await request(app)
        .patch(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updateData.title);
      expect(res.body.data.budget).toBe(updateData.budget);
    });

    it('should update media entry successfully by admin', async () => {
      const updateData = { title: 'Admin Updated Title' };
      
      const res = await request(app)
        .patch(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updateData.title);
    });

    it('should return 403 error when non-owner tries to update', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        role: 'user',
      });
      const otherUserToken = generateToken(otherUser._id, otherUser.role);

      const updateData = { title: 'Unauthorized Update' };
      
      const res = await request(app)
        .patch(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You are not authorized to update this entry');
    });

    it('should return 404 error for non-existent media', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Title' };
      
      const res = await request(app)
        .patch(`/api/v1/media/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });

    it('should return 401 error without authentication', async () => {
      const updateData = { title: 'Updated Title' };
      
      const res = await request(app)
        .patch(`/api/v1/media/${mediaEntry._id}`)
        .send(updateData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should validate update data', async () => {
      const invalidData = { budget: -1000 };
      
      const res = await request(app)
        .patch(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('should delete media entry successfully by owner', async () => {
      const res = await request(app)
        .delete(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Media entry deleted successfully');

      // Verify soft delete
      const deletedMedia = await MediaEntry.findById(mediaEntry._id);
      expect(deletedMedia.isDeleted).toBe(true);
      expect(deletedMedia.deletedAt).toBeTruthy();
    });

    it('should delete media entry successfully by admin', async () => {
      const res = await request(app)
        .delete(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 error when non-owner tries to delete', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        role: 'user',
      });
      const otherUserToken = generateToken(otherUser._id, otherUser.role);

      const res = await request(app)
        .delete(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You are not authorized to delete this entry');
    });

    it('should return 404 error for non-existent media', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .delete(`/api/v1/media/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });

    it('should return 401 error without authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/media/${mediaEntry._id}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 error for already deleted media', async () => {
      // First delete the media
      await request(app)
        .delete(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Try to delete again
      const res = await request(app)
        .delete(`/api/v1/media/${mediaEntry._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });
  });
});
