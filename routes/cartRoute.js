const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Cart = require('./models/cart');

// Add to cart
router.post('/add', async (req, res) => {
  const { userId, productId, productName, productPrice, productImage } = req.body;

  if (!userId || !productId || !productName || !productPrice || !productImage) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        items: [{
          productId: new mongoose.Types.ObjectId(productId),
          productName,
          productPrice,
          productImage,
          quantity: 1
        }]
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({
          productId: new mongoose.Types.ObjectId(productId),
          productName,
          productPrice,
          productImage,
          quantity: 1
        });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) return res.status(200).json({ cart: { items: [] } });

    res.status(200).json({ cart }); // FIX: Wrap in { cart }
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) return res.status(404).json({ message: 'No cart found for this user' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();
    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
