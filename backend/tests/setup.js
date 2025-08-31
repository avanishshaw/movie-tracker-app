// backend/tests/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Before all tests, create an in-memory server and connect mongoose to it
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// After all tests, disconnect mongoose and stop the server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// After each test, clear all data from the database
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});