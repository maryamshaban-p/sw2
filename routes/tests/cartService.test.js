const mongoose = require('mongoose');
const Cart = require('../models/cart');
const { addToCart, getCart, removeFromCart } = require('../services/cartService');

jest.mock('../models/cart');

describe('Cart Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleCart = {
    userId: new mongoose.Types.ObjectId(),
    items: [],
    save: jest.fn()
  };

  test('should add new product to cart', async () => {
    Cart.findOne.mockResolvedValue(null);
    Cart.mockImplementation(() => sampleCart);

    const result = await addToCart({
      userId: sampleCart.userId,
      productId: new mongoose.Types.ObjectId(),
      productName: 'Test Product',
      productPrice: 100,
      productImage: 'img.jpg'
    });

    expect(result).toBeDefined();
    expect(sampleCart.save).toHaveBeenCalled();
  });

  test('should get empty cart if not exists', async () => {
    Cart.findOne.mockResolvedValue(null);
    const result = await getCart(sampleCart.userId);
    expect(result).toEqual({ items: [] });
  });

  test('should throw if cart not found on remove', async () => {
    Cart.findOne.mockResolvedValue(null);
    await expect(removeFromCart(sampleCart.userId, 'someId')).rejects.toThrow('No cart found for this user');
  });
});
