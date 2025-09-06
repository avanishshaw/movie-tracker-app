// backend/tests/integration.test.js
import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/user.model.js';
import MediaEntry from '../src/models/mediaEntry.model.js';

describe('Integration Tests - Complete User Workflows', () => {
  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await MediaEntry.deleteMany({});
  });

  describe('Complete User Registration and Media Management Workflow', () => {
    it('should handle complete user journey from registration to media management', async () => {
      // Step 1: User registration
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.data).toHaveProperty('token');
      expect(registerRes.body.data).toHaveProperty('user');

      const userToken = registerRes.body.data.token;
      const userId = registerRes.body.data.user.id;

      // Step 2: User login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeTruthy();

      // Step 3: Get user profile
      const profileRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(profileRes.statusCode).toBe(200);
      expect(profileRes.body.data.email).toBe(userData.email);

      // Step 4: Create media entry
      const mediaData = {
        title: 'My First Movie',
        type: 'Movie',
        director: 'John Director',
        budget: 1000000,
        location: 'Hollywood',
        duration: '120 minutes',
        releaseYear: 2023,
        posterUrl: 'https://example.com/poster.jpg',
      };

      const createMediaRes = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mediaData);

      expect(createMediaRes.statusCode).toBe(201);
      expect(createMediaRes.body.data.status).toBe('pending');
      expect(createMediaRes.body.data.createdBy).toBe(userId);

      const mediaId = createMediaRes.body.data._id;

      // Step 5: Get user's media entries
      const getMediaRes = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getMediaRes.statusCode).toBe(200);
      expect(getMediaRes.body.data.length).toBeGreaterThan(0);
      expect(getMediaRes.body.data.some(media => media._id === mediaId)).toBe(true);

      // Step 6: Update media entry
      const updateData = { title: 'Updated Movie Title', budget: 2000000 };
      const updateRes = await request(app)
        .patch(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.title).toBe(updateData.title);
      expect(updateRes.body.data.budget).toBe(updateData.budget);

      // Step 7: Delete media entry
      const deleteRes = await request(app)
        .delete(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.message).toBe('Media entry deleted successfully');

      // Step 8: Verify media is soft deleted
      const deletedMediaRes = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`);

      expect(deletedMediaRes.body.data.some(media => media._id === mediaId)).toBe(false);
    });
  });

  describe('Complete Admin Workflow', () => {
    it('should handle complete admin workflow from user creation to media approval', async () => {
      // Step 1: Create admin user
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      };

      const admin = await User.create({
        ...adminData,
        role: 'admin',
      });

      const adminToken = (await request(app)
        .post('/api/v1/auth/login')
        .send(adminData)).body.data.token;

      // Step 2: Create regular user
      const userData = {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user123',
      };

      const userRes = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const userToken = userRes.body.data.token;

      // Step 3: Regular user creates media entry
      const mediaData = {
        title: 'Movie for Approval',
        type: 'Movie',
        director: 'Movie Director',
        budget: 5000000,
        location: 'Bollywood',
        duration: '150 minutes',
        releaseYear: 2024,
      };

      const createMediaRes = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mediaData);

      expect(createMediaRes.statusCode).toBe(201);
      expect(createMediaRes.body.data.status).toBe('pending');

      const mediaId = createMediaRes.body.data._id;

      // Step 4: Admin gets pending media
      const pendingRes = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(pendingRes.statusCode).toBe(200);
      expect(pendingRes.body.data.length).toBeGreaterThan(0);
      expect(pendingRes.body.data.some(media => media._id === mediaId)).toBe(true);

      // Step 5: Admin approves media
      const approveRes = await request(app)
        .patch(`/api/v1/admin/media/${mediaId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.data.status).toBe('approved');

      // Step 6: Verify media is no longer pending
      const updatedPendingRes = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(updatedPendingRes.body.data.some(media => media._id === mediaId)).toBe(false);

      // Step 7: Regular user can now see approved media in public list
      const publicMediaRes = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`);

      expect(publicMediaRes.statusCode).toBe(200);
      const approvedMedia = publicMediaRes.body.data.find(media => media._id === mediaId);
      expect(approvedMedia).toBeTruthy();
      expect(approvedMedia.status).toBe('approved');
    });

    it('should handle admin rejection workflow', async () => {
      // Create admin and user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });

      const user = await User.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
      });

      const adminToken = (await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' })).body.data.token;

      const userToken = (await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'user123' })).body.data.token;

      // User creates media
      const mediaData = {
        title: 'Movie to Reject',
        type: 'TV Show',
        director: 'TV Director',
        budget: 2000000,
        location: 'Netflix',
        duration: '45 minutes',
        releaseYear: 2024,
      };

      const createMediaRes = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mediaData);

      const mediaId = createMediaRes.body.data._id;

      // Admin rejects media
      const rejectRes = await request(app)
        .patch(`/api/v1/admin/media/${mediaId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(rejectRes.statusCode).toBe(200);
      expect(rejectRes.body.data.status).toBe('rejected');

      // User can still see their own rejected media
      const userMediaRes = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${userToken}`);

      const userMedia = userMediaRes.body.data.find(media => media._id === mediaId);
      expect(userMedia).toBeTruthy();
      expect(userMedia.status).toBe('rejected');
    });
  });

  describe('Multi-user Scenarios', () => {
    it('should handle multiple users creating and managing their own media', async () => {
      // Create multiple users
      const users = [];
      const tokens = [];

      for (let i = 0; i < 3; i++) {
        const userData = {
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: 'password123',
        };

        const userRes = await request(app)
          .post('/api/v1/auth/register')
          .send(userData);

        users.push(userRes.body.data.user);
        tokens.push(userRes.body.data.token);
      }

      // Each user creates media
      const mediaEntries = [];
      for (let i = 0; i < users.length; i++) {
        const mediaData = {
          title: `Movie by User ${i + 1}`,
          type: 'Movie',
          director: `Director ${i + 1}`,
          budget: 1000000 * (i + 1),
          location: 'Hollywood',
          duration: '120 minutes',
          releaseYear: 2023,
        };

        const createRes = await request(app)
          .post('/api/v1/media')
          .set('Authorization', `Bearer ${tokens[i]}`)
          .send(mediaData);

        expect(createRes.statusCode).toBe(201);
        mediaEntries.push(createRes.body.data);
      }

      // Each user should only see their own media and approved media
      for (let i = 0; i < users.length; i++) {
        const getMediaRes = await request(app)
          .get('/api/v1/media')
          .set('Authorization', `Bearer ${tokens[i]}`);

        expect(getMediaRes.statusCode).toBe(200);
        
        // Should see their own media (pending)
        const ownMedia = getMediaRes.body.data.find(media => media._id === mediaEntries[i]._id);
        expect(ownMedia).toBeTruthy();
        expect(ownMedia.createdBy._id).toBe(users[i].id);

        // Should not see other users' pending media
        const otherUsersMedia = getMediaRes.body.data.filter(media => 
          media.status === 'pending' && media.createdBy._id !== users[i].id
        );
        expect(otherUsersMedia.length).toBe(0);
      }
    });

    it('should handle search and filtering across multiple users', async () => {
      // Create users and media with different characteristics
      const user1 = await User.create({
        name: 'Action Fan',
        email: 'action@example.com',
        password: 'password123',
        role: 'user',
      });

      const user2 = await User.create({
        name: 'Comedy Fan',
        email: 'comedy@example.com',
        password: 'password123',
        role: 'user',
      });

      const user1Token = (await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'action@example.com', password: 'password123' })).body.data.token;

      const user2Token = (await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'comedy@example.com', password: 'password123' })).body.data.token;

      // Create media with different types and locations
      const actionMovie = await MediaEntry.create({
        title: 'Action Movie',
        type: 'Movie',
        director: 'Action Director',
        budget: 10000000,
        location: 'Hollywood',
        duration: '120 minutes',
        releaseYear: 2023,
        status: 'approved',
        createdBy: user1._id,
      });

      const comedyShow = await MediaEntry.create({
        title: 'Comedy Show',
        type: 'TV Show',
        director: 'Comedy Director',
        budget: 5000000,
        location: 'Netflix',
        duration: '30 minutes',
        releaseYear: 2023,
        status: 'approved',
        createdBy: user2._id,
      });

      // Test type filtering
      const movieRes = await request(app)
        .get('/api/v1/media?type=Movie')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(movieRes.statusCode).toBe(200);
      expect(movieRes.body.data.every(media => media.type === 'Movie')).toBe(true);

      // Test location filtering
      const hollywoodRes = await request(app)
        .get('/api/v1/media?industry=Hollywood')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(hollywoodRes.statusCode).toBe(200);
      expect(hollywoodRes.body.data.every(media => media.location === 'Hollywood')).toBe(true);

      // Test search functionality
      const searchRes = await request(app)
        .get('/api/v1/media?search=Action')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(searchRes.statusCode).toBe(200);
      expect(searchRes.body.data.some(media => media.title.includes('Action'))).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent user registrations gracefully', async () => {
      const userData = {
        name: 'Concurrent User',
        email: 'concurrent@example.com',
        password: 'password123',
      };

      // Attempt to register the same user multiple times concurrently
      const promises = Array(3).fill().map(() =>
        request(app)
          .post('/api/v1/auth/register')
          .send(userData)
      );

      const results = await Promise.allSettled(promises);
      
      // Verify that all requests completed (no rejections)
      expect(results.every(result => result.status === 'fulfilled')).toBe(true);
      
      // Verify that exactly one registration succeeded
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.statusCode === 201
      );
      expect(successful.length).toBe(1);
      
      // Verify that the other requests were handled appropriately
      const otherResults = results.filter(result => 
        result.status === 'fulfilled' && result.value.statusCode !== 201
      );
      expect(otherResults.length).toBe(2);
    });

    it('should handle invalid token scenarios gracefully', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        '',
        null,
      ];

      for (const token of invalidTokens) {
        const res = await request(app)
          .get('/api/v1/users/me')
          .set('Authorization', token || '');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      }
    });

    it('should handle malformed request data gracefully', async () => {
      const malformedRequests = [
        { body: 'invalid json' },
        { body: { email: 'test@example.com' } }, // missing password
        { body: { name: 'Test', email: 'invalid-email', password: '123' } },
        { body: { name: 'A', email: 'test@example.com', password: 'password123' } },
      ];

      for (const req of malformedRequests) {
        const res = await request(app)
          .post('/api/v1/auth/register')
          .send(req.body);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      }
    });
  });
});
