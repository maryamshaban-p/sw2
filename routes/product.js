const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("./models/products");
const router = express.Router();

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Route to add a new product
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : ""; // Ensure image is uploaded

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category // Add category
    });

    await newProduct.save();
    res.status(201).json({ msg: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Route to get all products (optional, you can also get them filtered by category)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
