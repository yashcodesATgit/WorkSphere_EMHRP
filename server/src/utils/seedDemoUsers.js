/**
 * Demo Seed Script — creates 1 HR and 1 Employee demo login.
 *
 * Usage:
 *   cd server
 *   node src/utils/seedDemoUsers.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB...');

// ─── 1. Ensure a Demo Department exists ───────────────────────────────────────
let dept = await Department.findOne({ name: 'Human Resources' });
if (!dept) {
  dept = await Department.create({
    name: 'Human Resources',
    description: 'HR Department',
  });
  console.log('Created department: Human Resources');
} else {
  console.log('Department already exists: Human Resources');
}

// ─── 2. Seed Demo HR User ─────────────────────────────────────────────────────
const hrEmail = 'hr@worksphere.com';
const hrPassword = 'Hr@12345';

let hrUser = await User.findOne({ email: hrEmail });
if (!hrUser) {
  hrUser = await User.create({
    name: 'Demo HR',
    email: hrEmail,
    password: hrPassword,
    role: 'HR',
  });
  console.log(`✅ HR user created: ${hrEmail} / ${hrPassword}`);
} else {
  console.log(`HR user already exists: ${hrEmail}`);
}

// Create Employee profile for HR user if not linked
let hrEmployee = await Employee.findOne({ email: hrEmail });
if (!hrEmployee) {
  hrEmployee = await Employee.create({
    firstName: 'Demo',
    lastName: 'HR',
    email: hrEmail,
    department: dept._id,
    designation: 'HR Manager',
    joiningDate: new Date('2023-01-01'),
    salary: 60000,
    user: hrUser._id,
  });
  console.log(`✅ HR employee profile created`);
} else if (!hrEmployee.user) {
  hrEmployee.user = hrUser._id;
  await hrEmployee.save();
  console.log(`HR employee profile linked`);
} else {
  console.log(`HR employee profile already exists`);
}

// ─── 3. Ensure Engineering Department for Employee ────────────────────────────
let engDept = await Department.findOne({ name: 'Engineering' });
if (!engDept) {
  engDept = await Department.create({
    name: 'Engineering',
    description: 'Software Engineering',
  });
  console.log('Created department: Engineering');
} else {
  console.log('Department already exists: Engineering');
}

// ─── 4. Seed Demo Employee User ───────────────────────────────────────────────
const empEmail = 'employee@worksphere.com';
const empPassword = 'Emp@12345';

let empUser = await User.findOne({ email: empEmail });
if (!empUser) {
  empUser = await User.create({
    name: 'Demo Employee',
    email: empEmail,
    password: empPassword,
    role: 'EMPLOYEE',
  });
  console.log(`✅ Employee user created: ${empEmail} / ${empPassword}`);
} else {
  console.log(`Employee user already exists: ${empEmail}`);
}

// Create Employee profile for employee user if not linked
let empEmployee = await Employee.findOne({ email: empEmail });
if (!empEmployee) {
  empEmployee = await Employee.create({
    firstName: 'Demo',
    lastName: 'Employee',
    email: empEmail,
    department: engDept._id,
    designation: 'Software Engineer',
    joiningDate: new Date('2023-06-01'),
    salary: 45000,
    user: empUser._id,
  });
  console.log(`✅ Employee profile created`);
} else if (!empEmployee.user) {
  empEmployee.user = empUser._id;
  await empEmployee.save();
  console.log(`Employee profile linked`);
} else {
  console.log(`Employee profile already exists`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n=== DEMO LOGIN CREDENTIALS ===');
console.log('ADMIN  → admin@worksphere.com  / Admin@12345');
console.log(`HR     → ${hrEmail}  / ${hrPassword}`);
console.log(`EMPLOYEE → ${empEmail}  / ${empPassword}`);
console.log('==============================\n');

await mongoose.disconnect();
process.exit(0);
