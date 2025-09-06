// backend/tests/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';

// Before all tests, create an in-memory server and connect mongoose to it
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'cinema-tracker-test',
      },
    });
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

// After all tests, disconnect mongoose and stop the server
afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

// After each test, clear all data from the database
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    const deletePromises = [];
    
    for (const key in collections) {
      const collection = collections[key];
      deletePromises.push(collection.deleteMany({}));
    }
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing test database:', error);
  }
});

// Global test timeout
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000);
}

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  if (process.env.SUPPRESS_TEST_LOGS === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});