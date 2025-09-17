const express = require("express");
const User = require("../models/User");
const router = express.Router();

// POST admin login - authenticate admin user
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find the admin user (there's only one user in the system)
    const user = await User.findOne({});

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No admin user found. Please initialize the admin user first.",
      });
    }

    // Check if the username matches the user's name, email, or "admin"
    const isValidUsername =
      username === "admin" ||
      username.toLowerCase() === user.name.toLowerCase() ||
      username.toLowerCase() === user.email.toLowerCase();

    if (!isValidUsername) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Use the checkPassword method to verify the password
    const isValidPassword = await user.checkPassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Return user info without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
});

// GET admin status - check if the single user exists
router.get("/admin/status", async (req, res) => {
  try {
    const user = await User.findOne({});

    let userResponse = null;
    if (user) {
      userResponse = user.toObject();
      if (userResponse.password) {
        delete userResponse.password;
      }
    }

    res.json({
      success: true,
      userExists: !!user,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking user status",
      error: error.message,
    });
  }
});

// POST create initial admin user (only if no user exists)
router.post("/admin/initialize", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if ANY user already exists
    const existingUser = await User.findOne({});
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Only one user is allowed in the system.",
      });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required for admin user",
      });
    }

    const adminUser = new User({
      name,
      email,
      role: "admin",
    });

    await adminUser.save();

    // Return admin response
    const adminResponse = adminUser.toObject();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: adminResponse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating admin user",
      error: error.message,
    });
  }
});

module.exports = router;
