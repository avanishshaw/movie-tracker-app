// backend/tests/auth.test.js
import request from 'supertest';
import app from '../src/index.js'; // Import our configured Express app
import User from '../src/models/user.model.js';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    
    // Test for a successful registration
    it('should register a new user successfully and return a token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Check the response
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(userData.email);

      // Check if the user was actually saved to the database
      const userInDb = await User.findOne({ email: 'test@example.com' });
      expect(userInDb).not.toBeNull();
      expect(userInDb.name).toBe(userData.name);
    });

    // Test for registering with an existing email
    it('should return a 400 error if email is already taken', async () => {
      // First, create a user to ensure the email exists
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      await request(app).post('/api/v1/auth/register').send(userData);

      // Now, try to register with the same email again
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already exists');
    });
  });
});