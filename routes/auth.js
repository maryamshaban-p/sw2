const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/users");
const router = express.Router();
require("dotenv").config();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login Attempt: ", { email, password });  // Log the incoming login request

    // Step 1: Check if user exists in the DB
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found in DB with email: ", email);
      return res.status(400).json({ msg: "User not found" });
    }

    // Step 2: Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for email: ", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Step 3: Admin check (compare with .env admin email and password)
    if (email === process.env.ADMIN_EMAIL) {
      console.log("Admin user detected");

      // Admin password validation (check against plain text password in .env)
      if (password !== process.env.ADMIN_PASS) {
        console.log("Admin password mismatch for email: ", email);
        return res.status(400).json({ msg: "Invalid admin password" });
      }

      console.log("Admin login successful");

      // Send a JSON response with a token (for admin, regular users can follow this too)
      const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({
        msg: "Admin login successful",
        token: token,
        userId: user._id,
        role: 'admin'
      });
    }

    // Step 4: Regular user login success (token creation and response)
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Regular user login successful, token created: ", token);
    return res.json({
      msg: "Regular user login successful",
      token: token,
      userId: user._id,
      role: 'user'
    });
  } catch (error) {
    console.error("Login error: ", error);  // Log detailed error
    res.status(500).json({ msg: "Server error", error: error.message }); // Send error details to the client
  }
});

module.exports = router;
