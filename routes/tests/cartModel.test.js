const mongoose = require('mongoose');
const Cart = require('../models/cart');     // adjust path
const User = require('../models/users');     // adjust path
const Product = require('../models/products'); // adjust path
require('dotenv').config();

describe('Cart Model', () => {
  let userId;
  let productId;
  let product;

  beforeAll(async () => {
    try {
      const uri = process.env.CONNECT_DB || 'mongodb://localhost:27017/test-db';
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        gender: 'female',           
        phone: '1234567890'         
      });
      
      userId = user._id;

      product = await Product.create({
        name: 'Test Product',
        price: 9.99,
        description: 'A test product',
        image: 'test.jpg',
        stock: 10,
      });
      productId = product._id;

    } catch (error) {
      console.error('MongoDB connection failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await Cart.deleteMany({});
      await Product.deleteMany({});
      await User.deleteMany({});
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error during disconnect:', err);
    }
  });
  test('should create a new cart with items', async () => {
    const cart = new Cart({
      userId,
      items: [{
        productId,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        quantity: 2
      }]
    });

    const savedCart = await cart.save();
    expect(savedCart).toHaveProperty('_id');
    expect(savedCart.items.length).toBe(1);
    expect(savedCart.items[0].quantity).toBe(2);
  });

  test('should update the quantity of an existing product in the cart', async () => {
    const cart = await Cart.findOne({ userId });
    cart.items[0].quantity += 1;
    await cart.save();

    const updatedCart = await Cart.findOne({ userId });
    expect(updatedCart.items[0].quantity).toBe(3);
  });

  test('should not allow adding an item without required fields', async () => {
    try {
      const cart = new Cart({
        userId,
        items: [{
          productName: 'Incomplete Product'
        }]
      });
      await cart.save();
    } catch (error) {
      expect(error.errors['items.0.productPrice']).toBeDefined();
      expect(error.errors['items.0.productImage']).toBeDefined();
    }
  });
});
