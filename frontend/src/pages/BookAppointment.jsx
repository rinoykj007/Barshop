import React, { useState, useEffect } from "react";
import { appointmentAPI } from "../utils/api";

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    appointmentDate: "",
    appointmentTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [message, setMessage] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Test API connection on component mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await appointmentAPI.testConnection();
        console.log("API Test Response:", response);
      } catch (error) {
        console.error("API Test Failed:", error);
        setMessage(
          "API connection failed. Please check if the backend server is running on port 5000."
        );
      }
    };

    testAPI();
  }, []);

  // Fetch available time slots for the selected date
  const fetchAvailableTimeSlots = async (date) => {
    if (!date) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoadingTimeSlots(true);
    setMessage(""); // Clear any previous messages

    try {
      console.log(`Fetching available time slots for date: ${date}`);
      const response = await appointmentAPI.getAvailableTimeSlots(date);
      console.log("API Response:", response);

      if (response.success) {
        setAvailableTimeSlots(response.availableSlots || []);
        console.log(
          `Found ${response.availableSlots?.length || 0} available slots`
        );
      } else {
        throw new Error(
          response.message || "Failed to fetch available time slots"
        );
      }
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      setMessage(
        `Error loading available time slots: ${
          error.message || "Please try again"
        }`
      );
      setAvailableTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // If date is changed, fetch available time slots and reset time selection
    if (name === "appointmentDate") {
      setFormData((prev) => ({
        ...prev,
        appointmentDate: value,
        appointmentTime: "",
      }));
      fetchAvailableTimeSlots(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Combine date and time into ISO string
      const appointmentDateTime = new Date(
        `${formData.appointmentDate}T${formData.appointmentTime}:00`
      ).toISOString();

      const appointmentData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        appointmentDateTime: appointmentDateTime,
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      setMessage("Appointment booked successfully!");
      setFormData({
        customerName: "",
        customerPhone: "",
        appointmentDate: "",
        appointmentTime: "",
      });
    } catch (error) {
      setMessage(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 pt-12">
            Book Your Appointment
          </h1>
          <p className="text-lg text-gray-600">
            Schedule your visit to Barshop and get the perfect cut
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="+353-1-234-5678"
              />
            </div>

            <div>
              <label
                htmlFor="appointmentDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Appointment Date *
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={today}
                required
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="appointmentTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Appointment Time *{" "}
                <span className="text-sm text-gray-500">
                  (9:00 AM - 7:00 PM)
                </span>
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                disabled={!formData.appointmentDate || loadingTimeSlots}
                className="input-field"
              >
                <option value="">
                  {!formData.appointmentDate
                    ? "Select a date first"
                    : loadingTimeSlots
                    ? "Loading available times..."
                    : availableTimeSlots.length === 0
                    ? "No available times"
                    : "Select a time"}
                </option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.display}
                  </option>
                ))}
              </select>
              {formData.appointmentDate &&
                availableTimeSlots.length === 0 &&
                !loadingTimeSlots && (
                  <p className="text-sm text-orange-600 mt-1">
                    No available time slots for this date. Please select another
                    date.
                  </p>
                )}
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              📅 Business Hours
            </h3>
            <p className="text-blue-800">
              Monday - Friday: 9:00 AM - 7:00 PM
              <br />
              Saturday: 9:00 AM - 6:00 PM
              <br />
              Sunday: Closed
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Appointments available every 30 minutes during business hours
            </p>
          </div>
          <p>
            Need to change or cancel your appointment?
            <br />
            Call us at <span className="font-medium">+353-1-234-5678</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
