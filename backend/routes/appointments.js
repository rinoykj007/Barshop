const express = require("express");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Appointments API is working",
    timestamp: new Date().toISOString(),
  });
});

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({
      appointmentDateTime: 1,
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
});

// GET available time slots for a specific date
router.get("/available/:date", async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Generate all possible time slots (9:00 AM to 7:00 PM, 30-minute intervals)
    const allTimeSlots = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        allTimeSlots.push({ value: timeString, display: displayTime });
      }
    }

    // Create date range for the specific day (handle timezone properly)
    const [year, month, day] = date.split("-");
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    console.log(`Searching appointments between ${startOfDay} and ${endOfDay}`);

    const bookedAppointments = await Appointment.find({
      appointmentDateTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "scheduled", // Only consider scheduled appointments as unavailable
    });

    console.log(
      `Found ${bookedAppointments.length} booked appointments for ${date}`
    );

    // Extract booked time slots
    const bookedTimes = bookedAppointments.map((appointment) => {
      const appointmentTime = new Date(appointment.appointmentDateTime);
      const timeString = `${appointmentTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${appointmentTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      console.log(
        `Booked time: ${timeString} from appointment at ${appointmentTime}`
      );
      return timeString;
    });

    // Filter out booked time slots
    const availableTimeSlots = allTimeSlots.filter(
      (slot) => !bookedTimes.includes(slot.value)
    );

    console.log(
      `Available slots: ${availableTimeSlots.length}, Booked slots: ${bookedTimes.length}`
    );

    res.json({
      success: true,
      date: date,
      availableSlots: availableTimeSlots,
      bookedSlots: bookedTimes,
      totalSlots: allTimeSlots.length,
    });
  } catch (error) {
    console.error("Error in /available/:date endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available time slots",
      error: error.message,
    });
  }
});

// GET single appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
      error: error.message,
    });
  }
});

// POST create new appointment
router.post("/", async (req, res) => {
  try {
    const { customerName, customerPhone, appointmentDateTime, notes } =
      req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !appointmentDateTime) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, and appointment date/time are required",
      });
    }

    // Check if the time slot is already booked by a scheduled appointment
    const requestedDateTime = new Date(appointmentDateTime);
    const existingAppointment = await Appointment.findOne({
      appointmentDateTime: requestedDateTime,
      status: "scheduled", // Only consider scheduled appointments as conflicts
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked. Please select another time.",
      });
    }

    // Validate appointment is within business hours (9 AM - 7 PM)
    const hour = requestedDateTime.getHours();
    const minute = requestedDateTime.getMinutes();

    if (hour < 9 || hour >= 19 || (minute !== 0 && minute !== 30)) {
      return res.status(400).json({
        success: false,
        message:
          "Appointments are only available between 9:00 AM and 7:00 PM, every 30 minutes",
      });
    }

    // Check if appointment is in the past
    if (requestedDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot book appointments in the past",
      });
    }

    const appointment = new Appointment({
      customerName,
      customerPhone,
      appointmentDateTime: requestedDateTime,
      notes,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating appointment",
      error: error.message,
    });
  }
});

// PUT update appointment
router.put("/:id", async (req, res) => {
  try {
    const { customerName, customerPhone, appointmentDateTime, status, notes } =
      req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        customerPhone,
        appointmentDateTime,
        status,
        notes,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating appointment",
      error: error.message,
    });
  }
});

// DELETE appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message,
    });
  }
});

// Process payment for an appointment
router.post("/:id/payment", async (req, res) => {
  try {
    const { customerType } = req.body;

    if (!customerType || !["student", "professional"].includes(customerType)) {
      return res.status(400).json({
        success: false,
        message: "Valid customer type (student or professional) is required",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if payment already exists for this appointment
    const existingPayment = await Payment.findOne({
      appointmentId: req.params.id,
    });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already processed for this appointment",
      });
    }

    // Set pricing based on customer type
    const amount = customerType === "student" ? 10 : 15;

    // Create payment record
    const payment = new Payment({
      appointmentId: appointment._id,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerType: customerType,
      amount: amount,
      appointmentDate: appointment.appointmentDateTime,
      paymentDate: new Date(),
    });

    await payment.save();

    res.json({
      success: true,
      message: "Payment processed successfully",
      payment: payment,
      appointment: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
});

// Get collection reports
router.get("/reports/collections", async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly

    const now = new Date();
    let startDate = new Date();
    let groupFormat = "";

    switch (period) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        groupFormat = "%Y-%m-%d";
        break;
      case "weekly":
        const dayOfWeek = now.getDay();
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        groupFormat = "%Y-%U";
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupFormat = "%Y-%m";
        break;
      default:
        // Default to daily if no period specified
        startDate.setHours(0, 0, 0, 0);
        groupFormat = "%Y-%m-%d";
    }

    const collections = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          paymentDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: groupFormat, date: "$paymentDate" },
            },
            customerType: "$customerType",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.date": -1 },
      },
    ]);

    // Calculate totals
    const totalCollections = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          paymentDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$customerType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const overallTotal = totalCollections.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
    const overallCount = totalCollections.reduce(
      (sum, item) => sum + item.count,
      0
    );

    res.json({
      success: true,
      period: period || "daily",
      collections: collections,
      summary: {
        totalCollections: overallTotal,
        totalAppointments: overallCount,
        breakdown: totalCollections,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating collection report",
      error: error.message,
    });
  }
});

// Get payment status for appointments
router.get("/payments/status", async (req, res) => {
  try {
    const payments = await Payment.find(
      {},
      "appointmentId customerType amount paymentDate"
    );

    // Create a map of appointmentId -> payment info
    const paymentMap = {};
    payments.forEach((payment) => {
      paymentMap[payment.appointmentId.toString()] = {
        customerType: payment.customerType,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentStatus: "paid",
      };
    });

    res.json({
      success: true,
      payments: paymentMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment status",
      error: error.message,
    });
  }
});

module.exports = router;
