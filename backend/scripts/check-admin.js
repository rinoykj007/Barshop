const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const checkAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB\n");

    // Find the admin user
    const admin = await User.findOne({});

    if (!admin) {
      console.log("❌ No admin user found in the database");
      console.log("\nTo create an admin user, run:");
      console.log("  node scripts/reset-admin.js");
    } else {
      console.log("✅ Admin user found:");
      console.log("   Name:", admin.name);
      console.log("   Email:", admin.email);
      console.log("   Role:", admin.role);
      console.log("   Created:", admin.createdAt);
      console.log("\n📝 You can login with:");
      console.log("   Username: admin");
      console.log("   Username:", admin.name);
      console.log("   Username:", admin.email);
      console.log("\n⚠️  Password is hashed and cannot be displayed");
      console.log("   If you forgot the password, run:");
      console.log("   node scripts/reset-admin.js");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkAdmin();
