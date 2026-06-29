import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Apna tenant ID yahan daalo
const TENANT_ID = new mongoose.Types.ObjectId("6a2a4c1406b5fa7fc8b3b1a5");

const db = mongoose.connection.db;

// Departments
await db.collection('departments').insertMany([
  { tenantId: TENANT_ID, name: 'Engineering', code: 'ENG', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Human Resources', code: 'HR', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Finance', code: 'FIN', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Sales', code: 'SAL', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Marketing', code: 'MKT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
]);
console.log('✅ Departments added');

// Designations
await db.collection('designations').insertMany([
  { tenantId: TENANT_ID, name: 'Software Engineer', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Senior Software Engineer', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Team Lead', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Manager', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'HR Executive', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Accountant', isActive: true, createdAt: new Date(), updatedAt: new Date() },
]);
console.log('✅ Designations added');

// Locations
await db.collection('locations').insertMany([
  { tenantId: TENANT_ID, name: 'Mumbai HQ', city: 'Mumbai', state: 'Maharashtra', country: 'India', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Delhi Office', city: 'Delhi', state: 'Delhi', country: 'India', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Bangalore Office', city: 'Bangalore', state: 'Karnataka', country: 'India', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Remote', city: 'Remote', state: '', country: 'India', isActive: true, createdAt: new Date(), updatedAt: new Date() },
]);
console.log('✅ Locations added');

// Shifts
await db.collection('shifts').insertMany([
  { tenantId: TENANT_ID, name: 'Morning Shift', startTime: '09:00', endTime: '18:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Evening Shift', startTime: '14:00', endTime: '23:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'Night Shift', startTime: '22:00', endTime: '07:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tenantId: TENANT_ID, name: 'General Shift', startTime: '10:00', endTime: '19:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
]);
console.log('✅ Shifts added');

console.log('\n🎉 Seed complete! Refresh your app.');
process.exit(0);
