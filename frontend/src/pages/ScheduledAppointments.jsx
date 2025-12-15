import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const ScheduledAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const { adminUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const [appointmentsResponse, paymentsResponse] = await Promise.all([
        appointmentAPI.getAppointments(),
        appointmentAPI.getPaymentStatus(),
      ]);

      const appointmentsData = appointmentsResponse.data || [];
      const paymentsData = paymentsResponse.payments || {};

      const appointmentsWithPayments = appointmentsData.map((appointment) => ({
        ...appointment,
        paymentStatus:
          paymentsData[appointment._id]?.paymentStatus || "pending",
        customerType: paymentsData[appointment._id]?.customerType,
        amount: paymentsData[appointment._id]?.amount,
        paymentDate: paymentsData[appointment._id]?.paymentDate,
      }));

      // Filter scheduled appointments AND completed appointments without payment
      const scheduledAndUnpaid = appointmentsWithPayments.filter(
        (apt) => apt.status === "scheduled" || (apt.status === "completed" && apt.paymentStatus !== "paid")
      );
      setAppointments(scheduledAndUnpaid);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentAPI.updateAppointment(id, { status: newStatus });
      fetchAppointments();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await appointmentAPI.deleteAppointment(id);
        fetchAppointments();
      } catch (error) {
        console.error("Failed to delete appointment:", error);
      }
    }
  };

  const handlePayment = (appointment) => {
    setPaymentAppointment(appointment);
    setShowPaymentModal(true);
  };

  const processPayment = async (customerType) => {
    try {
      await appointmentAPI.processPayment(paymentAppointment._id, customerType);
      setShowPaymentModal(false);
      setPaymentAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">
            Loading scheduled appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 text-white/80 hover:text-white flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Scheduled Appointments</h1>
              <p className="text-blue-100 mt-1">
                {appointments.filter(a => a.status === "scheduled").length} scheduled ·
                {appointments.filter(a => a.status === "completed" && a.paymentStatus !== "paid").length} awaiting payment
              </p>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No scheduled appointments</p>
                <p className="text-gray-400 text-sm mt-1">All appointments have been completed or cancelled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-1">{appointment.customerName}</h3>
                        <p className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {appointment.customerPhone}
                        </p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        appointment.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {appointment.status === "scheduled" ? "Scheduled" : "Completed"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 flex items-center mb-3">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateTime(appointment.appointmentDateTime)}
                      </p>

                      {/* Payment Status/Button */}
                      {appointment.status === "completed" && appointment.paymentStatus !== "paid" && (
                        <button
                          onClick={() => handlePayment(appointment)}
                          className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-3 transition-colors font-medium border-2 border-blue-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add Payment - Required
                        </button>
                      )}
                    </div>

                    {/* Action Buttons - Only show for scheduled appointments */}
                    {appointment.status === "scheduled" && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200">
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, "completed")}
                          className="flex-1 min-w-[140px] px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                          className="flex-1 min-w-[140px] px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}

                    {/* Delete button for completed appointments */}
                    {appointment.status === "completed" && (
                      <div className="pt-4 border-t border-green-200">
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Process Payment</h3>
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <p className="text-base text-gray-900 mb-2">
                <strong>{paymentAppointment.customerName}</strong>
              </p>
              <p className="text-sm text-gray-600">
                {formatDateTime(paymentAppointment.appointmentDateTime)}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => processPayment("student")}
                className="w-full p-5 border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="font-bold text-blue-900 text-lg">Student</div>
                    <div className="text-sm text-blue-600">Discounted rate</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">€10</div>
                </div>
              </button>

              <button
                onClick={() => processPayment("professional")}
                className="w-full p-5 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="font-bold text-purple-900 text-lg">Professional</div>
                    <div className="text-sm text-purple-600">Standard rate</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">€15</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentAppointment(null);
              }}
              className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledAppointments;