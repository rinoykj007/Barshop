const mongoose = require("mongoose");
const readline = require("readline");
require("dotenv").config();

const User = require("../models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const resetAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB\n");

    // Check if admin exists
    const existingAdmin = await User.findOne({});

    if (existingAdmin) {
      console.log("📋 Current admin user:");
      console.log("   Name:", existingAdmin.name);
      console.log("   Email:", existingAdmin.email);
      console.log();

      const confirmReset = await question(
        "Do you want to reset the admin password? (yes/no): "
      );

      if (confirmReset.toLowerCase() !== "yes") {
        console.log("❌ Password reset cancelled");
        await mongoose.connection.close();
        rl.close();
        process.exit(0);
      }

      // Get new password
      const newPassword = await question("Enter new password (min 6 chars): ");

      if (newPassword.length < 6) {
        console.error("❌ Password must be at least 6 characters long");
        await mongoose.connection.close();
        rl.close();
        process.exit(1);
      }

      // Update password
      existingAdmin.password = newPassword;
      await existingAdmin.save();

      console.log("\n✅ Admin password updated successfully!");
      console.log("\n📝 You can now login with:");
      console.log("   Username: admin");
      console.log("   Username:", existingAdmin.name);
      console.log("   Username:", existingAdmin.email);
      console.log("   Password: [the password you just entered]");
    } else {
      console.log("❌ No admin user found. Creating new admin user...\n");

      const name = await question("Enter admin name: ");
      const email = await question("Enter admin email: ");
      const password = await question("Enter admin password (min 6 chars): ");

      if (!name || !email || !password) {
        console.error("❌ All fields are required");
        await mongoose.connection.close();
        rl.close();
        process.exit(1);
      }

      if (password.length < 6) {
        console.error("❌ Password must be at least 6 characters long");
        await mongoose.connection.close();
        rl.close();
        process.exit(1);
      }

      const admin = new User({
        name,
        email,
        password,
        role: "admin",
      });

      await admin.save();

      console.log("\n✅ Admin user created successfully!");
      console.log("\n📝 You can now login with:");
      console.log("   Username: admin");
      console.log("   Username:", name);
      console.log("   Username:", email);
      console.log("   Password: [the password you just entered]");
    }

    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
    rl.close();
    process.exit(1);
  }
};

resetAdmin();
