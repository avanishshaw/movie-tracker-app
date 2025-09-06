// backend/tests/admin.test.js
import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/user.model.js';
import MediaEntry from '../src/models/mediaEntry.model.js';
import { generateToken } from '../src/utils/jwt.util.js';

describe('Admin Endpoints', () => {
  let admin, regularUser, adminToken, userToken;
  let pendingMedia, approvedMedia, rejectedMedia;

  const validMediaData = {
    title: 'Test Movie',
    type: 'Movie',
    director: 'John Director',
    budget: 1000000,
    location: 'Hollywood',
    duration: '120 minutes',
    releaseYear: 2023,
  };

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await MediaEntry.deleteMany({});

    // Create test users
    admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });

    // Generate tokens
    adminToken = generateToken(admin._id, admin.role);
    userToken = generateToken(regularUser._id, regularUser.role);

    // Create test media entries with different statuses
    pendingMedia = await MediaEntry.create({
      ...validMediaData,
      title: 'Pending Movie',
      status: 'pending',
      createdBy: regularUser._id,
    });

    approvedMedia = await MediaEntry.create({
      ...validMediaData,
      title: 'Approved Movie',
      status: 'approved',
      createdBy: regularUser._id,
    });

    rejectedMedia = await MediaEntry.create({
      ...validMediaData,
      title: 'Rejected Movie',
      status: 'rejected',
      createdBy: regularUser._id,
    });
  });

  describe('GET /api/v1/admin/media/pending', () => {
    it('should get all pending media entries for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      
      // All returned media should be pending
      res.body.data.forEach(media => {
        expect(media.status).toBe('pending');
        expect(media.isDeleted).toBe(false);
      });

      // Should include creator information
      expect(res.body.data[0]).toHaveProperty('createdBy');
      expect(res.body.data[0].createdBy).toHaveProperty('name');
    });

    it('should return 403 error for regular users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized as an admin');
    });

    it('should return 401 error without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/admin/media/pending');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return empty array when no pending media exists', async () => {
      // Delete all pending media
      await MediaEntry.deleteMany({ status: 'pending' });

      const res = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should not include deleted media entries', async () => {
      // Soft delete one pending media
      await MediaEntry.findByIdAndUpdate(pendingMedia._id, { 
        isDeleted: true, 
        deletedAt: new Date() 
      });

      const res = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('PATCH /api/v1/admin/media/:id/approve', () => {
    it('should approve pending media entry successfully', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');

      // Verify in database
      const updatedMedia = await MediaEntry.findById(pendingMedia._id);
      expect(updatedMedia.status).toBe('approved');
    });

    it('should approve already approved media entry', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${approvedMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });

    it('should approve rejected media entry', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${rejectedMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });

    it('should return 403 error for regular users', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/approve`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized as an admin');
    });

    it('should return 401 error without authentication', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/approve`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 error for non-existent media', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .patch(`/api/v1/admin/media/${fakeId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });

    it('should return 404 error for deleted media', async () => {
      // Soft delete the media
      await MediaEntry.findByIdAndUpdate(pendingMedia._id, { 
        isDeleted: true, 
        deletedAt: new Date() 
      });

      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });
  });

  describe('PATCH /api/v1/admin/media/:id/reject', () => {
    it('should reject pending media entry successfully', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');

      // Verify in database
      const updatedMedia = await MediaEntry.findById(pendingMedia._id);
      expect(updatedMedia.status).toBe('rejected');
    });

    it('should reject approved media entry', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${approvedMedia._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
    });

    it('should reject already rejected media entry', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${rejectedMedia._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
    });

    it('should return 403 error for regular users', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/reject`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized as an admin');
    });

    it('should return 401 error without authentication', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/reject`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 error for non-existent media', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .patch(`/api/v1/admin/media/${fakeId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });

    it('should return 404 error for deleted media', async () => {
      // Soft delete the media
      await MediaEntry.findByIdAndUpdate(pendingMedia._id, { 
        isDeleted: true, 
        deletedAt: new Date() 
      });

      const res = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media entry not found');
    });
  });

  describe('Admin workflow tests', () => {
    it('should handle complete approval workflow', async () => {
      // Create a new media entry
      const newMedia = await MediaEntry.create({
        ...validMediaData,
        title: 'New Movie',
        status: 'pending',
        createdBy: regularUser._id,
      });

      // Admin gets pending media
      const pendingRes = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(pendingRes.statusCode).toBe(200);
      expect(pendingRes.body.data.some(media => media._id === newMedia._id.toString())).toBe(true);

      // Admin approves the media
      const approveRes = await request(app)
        .patch(`/api/v1/admin/media/${newMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.data.status).toBe('approved');

      // Verify it's no longer in pending list
      const updatedPendingRes = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(updatedPendingRes.body.data.some(media => media._id === newMedia._id.toString())).toBe(false);
    });

    it('should handle complete rejection workflow', async () => {
      // Create a new media entry
      const newMedia = await MediaEntry.create({
        ...validMediaData,
        title: 'Another Movie',
        status: 'pending',
        createdBy: regularUser._id,
      });

      // Admin rejects the media
      const rejectRes = await request(app)
        .patch(`/api/v1/admin/media/${newMedia._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(rejectRes.statusCode).toBe(200);
      expect(rejectRes.body.data.status).toBe('rejected');

      // Verify it's no longer in pending list
      const pendingRes = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(pendingRes.body.data.some(media => media._id === newMedia._id.toString())).toBe(false);
    });

    it('should allow admin to change status multiple times', async () => {
      // Approve pending media
      await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Reject approved media
      const rejectRes = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(rejectRes.statusCode).toBe(200);
      expect(rejectRes.body.data.status).toBe('rejected');

      // Approve rejected media again
      const approveRes = await request(app)
        .patch(`/api/v1/admin/media/${pendingMedia._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.data.status).toBe('approved');
    });
  });
});
