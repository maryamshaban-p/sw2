const mongoose = require('mongoose');
const Cart = require('../models/cart');
const User = require('../models/users');
const Product = require('../models/products');

describe('Cart Model', () => {
  jest.setTimeout(15000);

  let userId;
  let productId;
  let product;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'testPass'
    });
    userId = user._id;

    product = await Product.create({
      name: 'Test Product', // <-- مطابقة للسكيمة
      price: 100,
      image: 'test-image-url'
    });
    productId = product._id;
  });

  afterAll(async () => {
    await Cart.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  test('should create a new cart with items', async () => {
    const cart = new Cart({
      userId,
      items: [{
        productId,
        productName: product.name,       // <-- استخدم بيانات المنتج من الكائن نفسه
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
