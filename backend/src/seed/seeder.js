// backend/src/seed/seeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import MediaEntry from '../models/mediaEntry.model.js';
import sampleData from './sampleData.js';

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  await connectDB();
  try {
    // Check if required environment variables are set
    if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD) {
      console.error('Error: Please set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD in your .env file.');
      process.exit(1);
    }

    await User.deleteMany();
    await MediaEntry.deleteMany();

    // Create a sample admin user from environment variables
    const adminUser = await User.create({
        name: 'Admin User',
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
    });
    const adminId = adminUser._id;

    console.log('Admin user created successfully.');

    const mediaWithCreator = sampleData.map(media => ({
        ...media,
        createdBy: adminId,
    }));

    await MediaEntry.insertMany(mediaWithCreator);

    console.log('Sample data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await MediaEntry.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}