const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Example User schema for the Barshop application
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["customer", "barber", "admin"],
    default: "customer",
  },
  phone: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.checkPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create a partial unique index for admin role
// This ensures only one document can have role: 'admin'
userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "admin" },
    name: "unique_admin_role",
  }
);

module.exports = mongoose.model("User", userSchema);
