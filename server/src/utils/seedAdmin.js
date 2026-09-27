/**
 * Seed script — creates the initial admin user if one does not already exist.
 *
 * Usage:
 *   cd server
 *   node src/utils/seedAdmin.js
 *
 * Reads credentials from environment variables:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * These must be set in server/.env (not committed).
 * See server/.env.example for the required keys.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const name = process.env.ADMIN_NAME || 'Admin';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const existing = await User.findOne({ email: email.toLowerCase() });

if (existing) {
  console.log(`Admin user already exists: ${existing.email}`);
} else {
  await User.create({ name, email, password, role: 'ADMIN' });
  console.log(`Admin user created: ${email}`);
}

await mongoose.disconnect();
process.exit(0);
