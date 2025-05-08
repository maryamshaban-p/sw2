const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/users');

beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB || process.env.CONNECT_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
/* it('should list all routes', async () => {
  //  console.log('Registered routes:');
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(
          `${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`
        );
      }
    });
  }); */
  afterAll(async () => {
    // Safer cleanup - delete all documents instead of dropping DB
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await mongoose.connection.close();
  });

describe('Security Tests', () => {
  let token, userId;

  beforeEach(async () => {
    await User.deleteMany();

    const hashedPassword = await bcrypt.hash('StrongPass123!', 10);
    const user = await User.create({
      name: 'Maryyy',
      email: 'testuser@example.com',
      phone: '01000000000',
      password: hashedPassword,
      gender: 'male'
    });

    userId = user._id.toString();
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'defaultsecret');
  });

  it('should prevent XSS in email field during signup', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Script',
      email: '<script>alert(1)</script>@test.com',
      phone: '01111111111',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      gender: 'female'
    });

    expect(res.statusCode).toBe(400);
  });

  it('should reject weak passwords during signup', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Password',
      email: 'weakpass@example.com',
      phone: '01234567890',
      password: '123',
      confirmPassword: '123',
      gender: 'female'
    });

    expect(res.statusCode).toBe(400);
  });

  it('should not reveal if email exists during login (no user enumeration)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexisting@example.com',
      password: 'StrongPass123!'
    });

    expect(res.body.msg).toBe('Invalid credentials');
  });

  it('should store password as hashed', async () => {
    const newUser = await User.create({
      name: 'Test',
      email: 'hash@example.com',
      phone: '01010101010',
      password: await bcrypt.hash('MyPass123!', 10),
      gender: 'male'
    });

    expect(newUser.password).not.toBe('MyPass123!');
  });

  it('should prevent unauthorized user from accessing another user\'s data', async () => {
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '01000000000',
      password: await bcrypt.hash('password123', 10),
      gender: 'male'
    });
  
    // Create a hacker token with a different ID
    const hackerToken = jwt.sign(
      { id: 'fakeUserId', role: 'user' },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1h' }
    );
  
    // Make the request
    const res = await request(app)
      .get(`/api/auth/users/${testUser._id}`)
      .set('Authorization', `Bearer ${hackerToken}`);
  
    //console.log('Status Code:', res.statusCode);
    //console.log('Response Body:', res.body);
  
    // Verify the response
    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Unauthorized access');
  });
  
  

  it('should reject NoSQL injection attempt on login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: { "$gt": "" },
      password: "any"
    });

    expect(res.statusCode).toBe(400);
  });

  it('should limit repeated failed login attempts', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'WrongPassword'
      });
    }

    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'WrongPassword'
    });

    expect(res.statusCode).toBe(429); // Too many requests
  });
});
