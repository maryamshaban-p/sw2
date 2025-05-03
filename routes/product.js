const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("./models/products");  // تأكد من المسار الصحيح للـ Model
const router = express.Router();

// إعداد multer للتخزين في الذاكرة
const storage = multer.memoryStorage();  // استخدام التخزين في الذاكرة بدلاً من القرص

const upload = multer({ storage });

// إضافة منتج جديد
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;  // الصورة ستكون في الذاكرة

    // هنا يمكن تخزين الصورة في مجلد إذا كنت تريد ذلك، أو استخدامها مباشرة
    const newProduct = new Product({
      name,
      description,
      price,
      image: imageBuffer ? `/uploads/${Date.now()}.jpg` : "",  // وضع مسار الصورة بعد تخزينها في مجلد
    });

    await newProduct.save();
    res.status(201).json({ msg: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// الحصول على جميع المنتجات
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// الحصول على جميع المنتجات (إذا كان عندك مسار آخر للتأكيد)
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
