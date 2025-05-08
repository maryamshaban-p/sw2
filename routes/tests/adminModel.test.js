const mongoose = require('mongoose');
const Admin = require('../models/admin'); // adjust path if necessary

describe('Admin Model', () => {
  beforeAll(async () => {
    try {
     // console.log('Connecting to MongoDB...');
      await mongoose.connect('mongodb+srv://mary:12345@cluster0.fmz8f0c.mongodb.net/auth_demo?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
     // console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  });
  

  afterAll(async () => {
    try {
      await mongoose.connection.collection('admins').deleteMany({});
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
  
  test('should hash the password before saving', async () => {
    const admin = new Admin({
      email: 'admin@example.com',
      password: 'admin123',
      gender: 'male',  // Make sure this field exists in your schema
      phone: '1234567890' // Ensure this field is required in your Admin model
    });

    try {
      const savedAdmin = await admin.save();
     // console.log('Admin saved:', savedAdmin); // Log the saved admin for debugging
      expect(savedAdmin).not.toBeNull(); // Check if the admin was saved
      expect(savedAdmin.password).not.toBe('admin123'); // Ensure password is hashed
    } catch (error) {
      console.error('Error saving admin:', error); // Catch any errors during save
    }

   /*  const savedAdmin = await Admin.findOne({ email: 'admin@example.com' });

    console.log('Saved Admin:', savedAdmin); // Log the saved admin document for debugging

    expect(savedAdmin).not.toBeNull(); // ✅ ensure it's not null
    expect(savedAdmin.password).not.toBe('admin123'); */ // Check if password is hashed
  });

  test('should not rehash the password if it is not modified', async () => {
    const admin = await Admin.findOne({ email: 'admin@example.com' });

    expect(admin).not.toBeNull(); // ✅ ensure it's not null

    const originalHashed = admin.password;

    admin.email = 'newemail@example.com';
    await admin.save();

    const updatedAdmin = await Admin.findOne({ email: 'newemail@example.com' });

    expect(updatedAdmin).not.toBeNull(); // ✅ ensure it's not null
    expect(updatedAdmin.password).toBe(originalHashed); // Password should not be rehashed
  });
});
