const express = require('express');
const router = express.Router();
const Book = require('../../models/Book'); // Make sure to create this model

// Get featured books (limit to 4 books)
router.get('/featured', async (req, res) => {
    try {
        const featuredBooks = await Book.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(4);
        res.json(featuredBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get popular books (all books)
router.get('/popular', async (req, res) => {
    try {
        const popularBooks = await Book.find()
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(popularBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get special offers (books with originalPrice)
router.get('/special-offers', async (req, res) => {
    try {
        const specialOffers = await Book.find({
            originalPrice: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });
        res.json(specialOffers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 