const express = require('express');
const router = express.Router();
const Cart = require('./models/cart'); // Make sure the path to the Cart model is correct

// إضافة كتاب للكارت
router.post('/add', async (req, res) => {
  const { userId, productId, productName, productPrice, productImage } = req.body;

  // Basic validation
  if (!userId || !productId || !productName || !productPrice || !productImage) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if cart already exists for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({
        userId,
        items: [{
          productId,
          productName,
          productPrice,
          productImage,
          quantity: 1
        }]
      });
    } else {
      // If a cart exists, check if the product is already in the cart
      const existingItem = cart.items.find(item => item.productId.toString() === productId);

      if (existingItem) {
        // If the product is already in the cart, increase the quantity
        existingItem.quantity += 1;
      } else {
        // If the product is not in the cart, add it
        cart.items.push({
          productId,
          productName,
          productPrice,
          productImage,
          quantity: 1
        });
      }
    }

    // Save the cart and respond with the updated cart
    await cart.save();
    res.status(200).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get all items in the user's cart
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user' });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Remove a product from the cart
router.delete('/remove', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user' });
    }

    // Remove product from the cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();
    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
