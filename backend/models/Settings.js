const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    offDates: {
      type: [Date],
      default: [],
      description: "Array of dates when the shop is closed",
    },
    shopName: {
      type: String,
      default: "Barshop",
    },
    openingHours: {
      type: String,
      default: "Mon-Sat: 9:00 AM - 6:00 PM",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;