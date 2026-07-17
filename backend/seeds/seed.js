/**
 * Database Seed Script
 * Run: node backend/seeds/seed.js
 * Creates Super Admin + 10 sample employees
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Employee = require('../src/models/Employee');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';

const seedData = [
  {
    name: 'Super Admin',
    email: 'admin@ems.com',
    password: 'Admin@1234',
    phone: '9000000000',
    department: 'Management',
    designation: 'CEO',
    salary: 200000,
    joiningDate: new Date('2020-01-01'),
    status: 'active',
    role: 'super_admin',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@ems.com',
    password: 'Hr@12345678',
    phone: '9000000001',
    department: 'Human Resources',
    designation: 'HR Director',
    salary: 120000,
    joiningDate: new Date('2020-03-15'),
    status: 'active',
    role: 'hr_manager',
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@ems.com',
    password: 'Emp@12345678',
    phone: '9000000002',
    department: 'Engineering',
    designation: 'VP Engineering',
    salary: 160000,
    joiningDate: new Date('2020-06-01'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@ems.com',
    password: 'Emp@12345678',
    phone: '9000000003',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    salary: 120000,
    joiningDate: new Date('2021-01-10'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@ems.com',
    password: 'Emp@12345678',
    phone: '9000000004',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 90000,
    joiningDate: new Date('2021-07-20'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@ems.com',
    password: 'Emp@12345678',
    phone: '9000000005',
    department: 'Engineering',
    designation: 'Junior Developer',
    salary: 70000,
    joiningDate: new Date('2022-03-01'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'Robert Martinez',
    email: 'robert.martinez@ems.com',
    password: 'Emp@12345678',
    phone: '9000000006',
    department: 'Sales',
    designation: 'Sales Manager',
    salary: 110000,
    joiningDate: new Date('2020-09-15'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa.thompson@ems.com',
    password: 'Emp@12345678',
    phone: '9000000007',
    department: 'Sales',
    designation: 'Sales Executive',
    salary: 75000,
    joiningDate: new Date('2021-11-01'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'David Brown',
    email: 'david.brown@ems.com',
    password: 'Emp@12345678',
    phone: '9000000008',
    department: 'Human Resources',
    designation: 'HR Executive',
    salary: 65000,
    joiningDate: new Date('2022-01-15'),
    status: 'active',
    role: 'employee',
  },
  {
    name: 'Anna White',
    email: 'anna.white@ems.com',
    password: 'Emp@12345678',
    phone: '9000000009',
    department: 'Engineering',
    designation: 'QA Engineer',
    salary: 85000,
    joiningDate: new Date('2022-06-01'),
    status: 'inactive',
    role: 'employee',
  },
  {
    name: 'Kevin Lee',
    email: 'kevin.lee@ems.com',
    password: 'Emp@12345678',
    phone: '9000000010',
    department: 'Sales',
    designation: 'Sales Representative',
    salary: 60000,
    joiningDate: new Date('2023-02-14'),
    status: 'active',
    role: 'employee',
  },
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Drop existing employees
    await Employee.deleteMany({}).setOptions({ includeDeleted: true });
    console.log('Cleared existing employee data.');

    // Create employees one by one to trigger pre-save hooks (password hashing, employeeId generation)
    const createdEmployees = [];
    for (const data of seedData) {
      const emp = await Employee.create(data);
      createdEmployees.push(emp);
      console.log(`Created: ${emp.name} (${emp.employeeId}) — ${emp.role}`);
    }

    // Assign reporting managers to build a realistic hierarchy:
    //   CEO (index 0) — no manager
    //   HR Director (1) → CEO
    //   VP Engineering (2) → CEO
    //   Senior SE (3) → VP Engineering
    //   SE (4) → Senior SE
    //   Junior Dev (5) → SE
    //   Sales Manager (6) → CEO
    //   Sales Exec (7) → Sales Manager
    //   HR Exec (8) → HR Director
    //   QA Eng (9) → VP Engineering
    //   Sales Rep (10) → Sales Manager

    const managerMap = [
      { idx: 1, managerIdx: 0 },
      { idx: 2, managerIdx: 0 },
      { idx: 3, managerIdx: 2 },
      { idx: 4, managerIdx: 3 },
      { idx: 5, managerIdx: 4 },
      { idx: 6, managerIdx: 0 },
      { idx: 7, managerIdx: 6 },
      { idx: 8, managerIdx: 1 },
      { idx: 9, managerIdx: 2 },
      { idx: 10, managerIdx: 6 },
    ];

    for (const { idx, managerIdx } of managerMap) {
      await Employee.findByIdAndUpdate(createdEmployees[idx]._id, {
        reportingManager: createdEmployees[managerIdx]._id,
      });
    }

    console.log('\nReporting hierarchy assigned.');
    console.log('\n--- Seed Complete ---');
    console.log('Super Admin credentials:');
    console.log('  Email:    admin@ems.com');
    console.log('  Password: Admin@1234');
    console.log('-------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
