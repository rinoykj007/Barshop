const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const resetAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }

    // Get new password from command line argument or use default
    const newPassword = process.argv[2] || "admin123";

    if (newPassword.length < 6) {
      console.error("❌ Password must be at least 6 characters long");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB\n");

    // Find admin user
    const admin = await User.findOne({});

    if (!admin) {
      console.log("❌ No admin user found in the database");
      console.log("Creating new admin user...\n");

      const newAdmin = new User({
        name: "Admin User",
        email: "admin@barshop.com",
        password: newPassword,
        role: "admin",
      });

      await newAdmin.save();

      console.log("✅ Admin user created successfully!");
      console.log("\n📝 Login credentials:");
      console.log("   Username: admin (or Admin User or admin@barshop.com)");
      console.log("   Password:", newPassword);
    } else {
      console.log("📋 Current admin user:");
      console.log("   Name:", admin.name);
      console.log("   Email:", admin.email);
      console.log("\n🔄 Resetting password...");

      // Update password
      admin.password = newPassword;
      await admin.save();

      console.log("✅ Admin password updated successfully!");
      console.log("\n📝 Login credentials:");
      console.log("   Username: admin (or", admin.name, "or", admin.email + ")");
      console.log("   Password:", newPassword);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

resetAdmin();
