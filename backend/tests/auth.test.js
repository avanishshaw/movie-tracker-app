// backend/tests/auth.test.js
import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/user.model.js';

describe('Authentication Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Clean up any existing users
      await User.deleteMany({});
    });

    it('should register a new user successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toMatchObject({
        name: validUserData.name,
        email: validUserData.email,
        role: 'user',
      });
      expect(res.body.data.user).not.toHaveProperty('password');

      // Verify user was saved to database
      const userInDb = await User.findOne({ email: validUserData.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe(validUserData.name);
      expect(userInDb.role).toBe('user');
      expect(userInDb.password).not.toBe(validUserData.password); // Should be hashed
    });

    it('should return 400 error if email is already taken', async () => {
      // Create first user
      await request(app).post('/api/v1/auth/register').send(validUserData);

      // Try to register with same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already exists');
    });

    it('should return 400 error for invalid email format', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      // Note: The API currently returns validation errors but they may not be in the expected format
      // This test verifies that a 400 error is returned for invalid input
    });

    it('should return 400 error for password too short', async () => {
      const invalidData = { ...validUserData, password: '123' };
      
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for name too short', async () => {
      const invalidData = { ...validUserData, name: 'Jo' };
      
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle case-insensitive email registration', async () => {
      const userData1 = { ...validUserData, email: 'test@example.com' };
      const userData2 = { ...validUserData, email: 'TEST@EXAMPLE.COM', name: 'Jane Doe' };

      // Register first user
      await request(app).post('/api/v1/auth/register').send(userData1);

      // Try to register with same email in different case
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData2);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      await User.deleteMany({});
      // Create a user for login tests
      await request(app).post('/api/v1/auth/register').send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: 'user',
      });
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 error for incorrect email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: userData.password,
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Incorrect email or password');
    });

    it('should return 401 error for incorrect password', async () => {
      const loginData = {
        email: userData.email,
        password: 'wrongpassword',
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Incorrect email or password');
    });

    it('should return 400 error for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: userData.password,
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for password too short', async () => {
      const loginData = {
        email: userData.email,
        password: '123',
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 error for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle case-insensitive email login', async () => {
      const loginData = {
        email: 'JOHN@EXAMPLE.COM',
        password: userData.password,
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userData.email); // Should return lowercase
    });
  });
});