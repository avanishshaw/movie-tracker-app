// backend/tests/user.test.js
import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/user.model.js';
import { generateToken } from '../src/utils/jwt.util.js';

describe('User Endpoints', () => {
  let user, admin, userToken, adminToken, invalidToken;

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});

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
    invalidToken = 'invalid.jwt.token';
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile successfully', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should get admin user profile successfully', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        _id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
      expect(res.body.data.role).toBe('admin');
    });

    it('should return 401 error without authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 error with invalid token format', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'InvalidFormat');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 error with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should return 401 error with malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should return 401 error when user no longer exists', async () => {
      // Delete the user but keep the token
      await User.findByIdAndDelete(user._id);

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, user not found');
    });

    it('should return 401 error with expired token', async () => {
      // Create a token with very short expiration (1ms ago)
      const expiredToken = generateToken(user._id, user.role, '1ms');

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should return 401 error with token for wrong user ID', async () => {
      // Create token with non-existent user ID
      const fakeUserId = '507f1f77bcf86cd799439011';
      const fakeToken = generateToken(fakeUserId, 'user');

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized, user not found');
    });
  });
});

describe('Authentication Middleware', () => {
  let user, userToken;

  beforeEach(async () => {
    await User.deleteMany({});
    
    user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });

    userToken = generateToken(user._id, user.role);
  });

  describe('protect middleware', () => {
    it('should allow access with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject access without Authorization header', async () => {
      const res = await request(app)
        .get('/api/v1/users/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should reject access with wrong Authorization format', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Basic some-token');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should reject access with malformed token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer malformed.token');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should reject access with empty token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer ');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });
  });

  describe('isAdmin middleware', () => {
    let admin, adminToken, regularUser, regularUserToken;

    beforeEach(async () => {
      await User.deleteMany({});

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

      adminToken = generateToken(admin._id, admin.role);
      regularUserToken = generateToken(regularUser._id, regularUser.role);
    });

    it('should allow admin access to admin routes', async () => {
      // First create a media entry to test admin approval
      const mediaEntry = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          title: 'Test Movie',
          type: 'Movie',
          director: 'John Director',
          budget: 1000000,
          location: 'Hollywood',
          duration: '120 minutes',
          releaseYear: 2023,
        });

      const mediaId = mediaEntry.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/admin/media/${mediaId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject regular user access to admin routes', async () => {
      const res = await request(app)
        .get('/api/v1/admin/media/pending')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized as an admin');
    });

    it('should reject access to admin routes without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/admin/media/pending');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
