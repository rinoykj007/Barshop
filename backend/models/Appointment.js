const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  appointmentDateTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  notes: {
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

// Update the updatedAt field before saving
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
appointmentSchema.index({ appointmentDateTime: 1 });
appointmentSchema.index({ customerPhone: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
