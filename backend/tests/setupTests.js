import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { jest } from '@jest/globals';
import Admin from '../models/Admin.js';

jest.setTimeout(15000);

beforeAll(async () => {
  if (process.env.MONGODB_URI) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    const admin = await Admin.findOne({ email: 'admin@ems.com' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await Admin.create({
        username: 'admin',
        email: 'admin@ems.com',
        password: hashedPassword,
        role: 'admin'
      });
    }
  }
});

// After all tests finish, close mongoose connection to avoid open handles
afterAll(async () => {
  try {
    await mongoose.disconnect();
    // Small delay to ensure sockets close
    await new Promise((r) => setTimeout(r, 100));
  } catch (err) {
    // ignore
  }
});

