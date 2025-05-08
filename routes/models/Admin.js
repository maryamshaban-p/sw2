const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true }
});

// Pre-save hook for hashing password
adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
