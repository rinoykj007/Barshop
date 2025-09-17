const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://barshopfd.vercel.app", // Your actual Vercel frontend URL
      "https://barshop-rho.vercel.app", // Alternative frontend URL (if any)
      "http://localhost:5173", // Local development (Vite)
      "http://localhost:3000", // Alternative local port
    ];

    // Allow any *.vercel.app domain for development
    const isVercelDomain = origin.endsWith(".vercel.app");
    const isAllowedOrigin = allowedOrigins.includes(origin);

    if (isAllowedOrigin || isVercelDomain) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Import routes
const userRoutes = require("./routes/users");
const appointmentRoutes = require("./routes/appointments");

// Basic routes
app.get("/", (req, res) => {
  res.json({ message: "Barshop API server is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
