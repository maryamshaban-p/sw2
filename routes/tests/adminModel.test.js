const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

describe('Admin Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('should hash the password before saving', async () => {
    const plainPassword = 'admin123';
    const admin = new Admin({ username: 'admin', password: plainPassword });
    await admin.save();

    // Ensure password was hashed
    expect(admin.password).not.toBe(plainPassword);
    const isMatch = await bcrypt.compare(plainPassword, admin.password);
    expect(isMatch).toBe(true);
  });

  it('should not rehash the password if it is not modified', async () => {
    const admin = new Admin({ username: 'admin2', password: 'admin456' });
    await admin.save();

    const originalHashed = admin.password;
    admin.username = 'newAdmin';
    await admin.save();

    expect(admin.password).toBe(originalHashed);
  });
});
