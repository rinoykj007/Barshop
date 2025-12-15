const express = require("express");
const Settings = require("../models/Settings");
const router = express.Router();

// GET settings - Public route to get shop settings
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
});

// POST add off date - Admin only
router.post("/off-date", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const settings = await Settings.getSettings();

    // Check if date already exists
    const dateExists = settings.offDates.some(
      (offDate) => offDate.toDateString() === new Date(date).toDateString()
    );

    if (dateExists) {
      return res.status(400).json({
        success: false,
        message: "This date is already marked as off",
      });
    }

    settings.offDates.push(new Date(date));
    await settings.save();

    res.json({
      success: true,
      message: "Off date added successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error adding off date:", error);
    res.status(500).json({
      success: false,
      message: "Error adding off date",
      error: error.message,
    });
  }
});

// DELETE remove off date - Admin only
router.delete("/off-date", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const settings = await Settings.getSettings();

    const targetDate = new Date(date);
    settings.offDates = settings.offDates.filter(
      (offDate) => offDate.toDateString() !== targetDate.toDateString()
    );

    await settings.save();

    res.json({
      success: true,
      message: "Off date removed successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error removing off date:", error);
    res.status(500).json({
      success: false,
      message: "Error removing off date",
      error: error.message,
    });
  }
});

// PUT update settings - Admin only
router.put("/", async (req, res) => {
  try {
    const { shopName, openingHours } = req.body;

    const settings = await Settings.getSettings();

    if (shopName !== undefined) settings.shopName = shopName;
    if (openingHours !== undefined) settings.openingHours = openingHours;

    await settings.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error.message,
    });
  }
});

module.exports = router;