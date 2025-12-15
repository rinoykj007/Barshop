import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import OffDateManager from "../components/OffDateManager";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const [collectionReports, setCollectionReports] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("daily");
  const [activeFilter, setActiveFilter] = useState("all"); // New state for filtering
  const { adminUser, logout } = useAuth();
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

      // Merge payment information with appointments
      const appointmentsWithPayments = appointmentsData.map((appointment) => ({
        ...appointment,
        paymentStatus:
          paymentsData[appointment._id]?.paymentStatus || "pending",
        customerType: paymentsData[appointment._id]?.customerType,
        amount: paymentsData[appointment._id]?.amount,
        paymentDate: paymentsData[appointment._id]?.paymentDate,
      }));

      setAppointments(appointmentsWithPayments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentAPI.updateAppointment(id, { status: newStatus });
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await appointmentAPI.deleteAppointment(id);
        fetchAppointments(); // Refresh the list
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
      fetchAppointments(); // Refresh the list
      fetchCollectionReports(); // Refresh reports
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const fetchCollectionReports = async () => {
    try {
      const response = await appointmentAPI.getCollectionReports(reportPeriod);
      console.log("Collection reports response:", response); // Debug log
      setCollectionReports(response); // Remove .data since the interceptor already extracts it
    } catch (error) {
      console.error("Failed to fetch collection reports:", error);
    }
  };

  useEffect(() => {
    if (reportPeriod) {
      fetchCollectionReports();
    }
  }, [reportPeriod]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle card click - navigate to new page on mobile
  const handleCardClick = (filter) => {
    // Check if we're on mobile (screen width < 768px which is md breakpoint)
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Navigate to dedicated page on mobile
      if (filter === "scheduled") {
        navigate("/admin/scheduled");
      } else if (filter === "completed") {
        navigate("/admin/completed");
      }
      // "all" filter stays on main dashboard page
    } else {
      // On desktop, just update the filter (no navigation)
      setActiveFilter(filter);
      const appointmentsSection = document.getElementById("appointments-section");
      if (appointmentsSection) {
        appointmentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Filter appointments based on active filter
  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "scheduled") return apt.status === "scheduled";
    if (activeFilter === "completed") return apt.status === "completed";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">
            Loading dashboard...
          </p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Enhanced with gradient card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-xl p-8 mb-8 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-amber-100 mt-1 text-sm md:text-base">
                    Welcome back,{" "}
                    {adminUser?.name || adminUser?.username || "Admin"}!
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-sm md:text-base ml-14">
                Manage all appointments and bookings efficiently
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20">
                <div className="text-white/80 text-sm mb-1">Total Today</div>
                <div className="text-3xl font-bold text-white">
                  {
                    appointments.filter((apt) => {
                      const today = new Date().toDateString();
                      return (
                        new Date(apt.appointmentDateTime).toDateString() ===
                        today
                      );
                    }).length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics - Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Scheduled Card - First */}
          <button
            onClick={() => handleCardClick("scheduled")}
            className={`bg-white rounded-xl shadow-lg p-6 border transition-all duration-300 transform hover:-translate-y-1 text-left w-full md:cursor-default md:pointer-events-none ${
              activeFilter === "scheduled" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"
            } hover:shadow-xl md:hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                PENDING
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {appointments.filter((apt) => apt.status === "scheduled").length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Scheduled</p>
          </button>

          {/* Completed Card - Second */}
          <button
            onClick={() => handleCardClick("completed")}
            className={`bg-white rounded-xl shadow-lg p-6 border transition-all duration-300 transform hover:-translate-y-1 text-left w-full md:cursor-default md:pointer-events-none ${
              activeFilter === "completed" ? "border-green-500 ring-2 ring-green-200" : "border-gray-100"
            } hover:shadow-xl md:hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                DONE
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {appointments.filter((apt) => apt.status === "completed").length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Completed</p>
          </button>

          {/* Total Appointments Card - Third */}
          <button
            onClick={() => handleCardClick("all")}
            className={`bg-white rounded-xl shadow-lg p-6 border transition-all duration-300 transform hover:-translate-y-1 text-left w-full md:cursor-default md:pointer-events-none ${
              activeFilter === "all" ? "border-amber-500 ring-2 ring-amber-200" : "border-gray-100"
            } hover:shadow-xl md:hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                ALL
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {appointments.length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Total Appointments
            </p>
          </button>
        </div>

        {/* Appointments List - Enhanced */}
        <div id="appointments-section" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden scroll-mt-24">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  All Appointments
                </h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                {appointments.length} Total
              </div>
            </div>
          </div>

          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No appointments found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Appointments will appear here once created
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {appointment.customerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.customerPhone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(appointment.appointmentDateTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {appointment.paymentStatus === "paid" ? (
                              <div className="text-xs">
                                <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  Paid €{appointment.amount}
                                </span>
                                <div className="text-gray-500 mt-1">
                                  {appointment.customerType}
                                </div>
                              </div>
                            ) : appointment.status === "completed" ? (
                              <button
                                onClick={() => handlePayment(appointment)}
                                className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                              >
                                💳 Add Payment
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {appointment.status === "scheduled" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        appointment._id,
                                        "completed"
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        appointment._id,
                                        "cancelled"
                                      )
                                    }
                                    className="text-orange-600 hover:text-orange-900 text-xs px-2 py-1 border border-orange-300 rounded hover:bg-orange-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDelete(appointment._id)}
                                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">
                            {appointment.customerName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            📞 {appointment.customerPhone}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          🗓️ {formatDateTime(appointment.appointmentDateTime)}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div className="mb-3">
                        {appointment.paymentStatus === "paid" ? (
                          <div className="text-xs">
                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              💰 Paid €{appointment.amount}
                            </span>
                            <span className="ml-2 text-gray-500">
                              ({appointment.customerType})
                            </span>
                          </div>
                        ) : appointment.status === "completed" ? (
                          <button
                            onClick={() => handlePayment(appointment)}
                            className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50"
                          >
                            💳 Add Payment
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Payment pending completion
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {appointment.status === "scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(appointment._id, "completed")
                              }
                              className="text-green-600 hover:text-green-900 text-sm px-3 py-1 border border-green-300 rounded hover:bg-green-50 flex-1 min-w-0"
                            >
                              ✅ Complete
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(appointment._id, "cancelled")
                              }
                              className="text-orange-600 hover:text-orange-900 text-sm px-3 py-1 border border-orange-300 rounded hover:bg-orange-50 flex-1 min-w-0"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="text-red-600 hover:text-red-900 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50 flex-1 min-w-0"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Collection Reports Section - Enhanced */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Collection Reports
                </h2>
              </div>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {collectionReports ? (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-blue-600">
                      €{collectionReports.summary?.totalCollections || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Total Collections</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-600">
                      {collectionReports.summary?.totalAppointments || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Paid Appointments</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-purple-600">
                      {collectionReports.summary?.breakdown
                        ?.map((item) => `${item._id}: ${item.count}`)
                        .join(", ") || "No data"}
                    </h3>
                    <p className="text-sm text-gray-600">Customer Types</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                {collectionReports.collections?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Customer Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {collectionReports.collections.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item._id.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  item._id.customerType === "student"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {item._id.customerType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              €{item.totalAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Loading collection reports...
              </div>
            )}
          </div>
        </div>

        {/* Off Date Manager Section */}
        <div className="mt-8">
          <OffDateManager />
        </div>
      </div>

      {/* Payment Modal - Enhanced */}
      {showPaymentModal && paymentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-xl">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Process Payment
                </h3>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm font-semibold text-gray-700">
                  Customer Details
                </p>
              </div>
              <p className="text-base text-gray-900 mb-2 ml-7">
                <strong>{paymentAppointment.customerName}</strong>
              </p>
              <p className="text-sm text-gray-600 ml-7">
                {formatDateTime(paymentAppointment.appointmentDateTime)}
              </p>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-4">
              Select customer type:
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => processPayment("student")}
                className="w-full p-5 text-left border-2 border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <div className="font-bold text-blue-900 text-lg">
                        Student
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 mt-1 ml-7">
                      Discounted rate for students
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                    €10
                  </div>
                </div>
              </button>

              <button
                onClick={() => processPayment("professional")}
                className="w-full p-5 text-left border-2 border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="font-bold text-purple-900 text-lg">
                        Professional
                      </div>
                    </div>
                    <div className="text-sm text-purple-600 mt-1 ml-7">
                      Standard rate for professionals
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                    €15
                  </div>
                </div>
              </button>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAppointment(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
