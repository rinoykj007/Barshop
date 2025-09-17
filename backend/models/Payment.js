const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
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
  customerType: {
    type: String,
    enum: {
      values: ["student", "professional"],
      message: "{VALUE} is not a valid customer type",
    },
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "other"],
    default: "cash",
  },
  status: {
    type: String,
    enum: ["completed", "refunded"],
    default: "completed",
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
paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ customerType: 1 });
paymentSchema.index({ customerPhone: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
