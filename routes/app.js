const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./auth"); // Ensure the path is correct
const { jwtMiddleware, authorize } = require('./middlewares/authMiddleware');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());  // Move this before any routes so requests are parsed properly
app.use(express.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// MongoDB Connection
mongoose.connect(process.env.CONNECT_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Error:", err));

// Routes
app.use("/api/auth", authRoutes); // Auth routes are exposed here
app.use("/api/cart", require("./cartRoute"));
app.use("/api/products", require("./product"));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Export the app for testing
module.exports = app;

// Start the server if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
