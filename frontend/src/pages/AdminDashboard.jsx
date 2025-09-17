import React, { useState, useEffect } from "react";
import { appointmentAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const [collectionReports, setCollectionReports] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("daily");
  const { adminUser, logout } = useAuth();

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

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with welcome message and logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="text-center sm:text-left pt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back, {adminUser?.name || adminUser?.username || "Admin"}!
              Manage all appointments and bookings.
            </p>
            {/* <p className="text-sm text-gray-500">
              {adminUser?.email && `Logged in as: ${adminUser.email}`}
            </p> */}
          </div>

          {/* <div className="mt-4 sm:mt-0">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div> */}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-primary-600">
              {appointments.length}
            </h3>
            <p className="text-gray-600">Total Appointments</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {appointments.filter((apt) => apt.status === "completed").length}
            </h3>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-blue-600">
              {appointments.filter((apt) => apt.status === "scheduled").length}
            </h3>
            <p className="text-gray-600">Scheduled</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">All Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found
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

        {/* Collection Reports Section */}
        <div className="card mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">
              Collection Reports
            </h2>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

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

      {/* Payment Modal */}
      {showPaymentModal && paymentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Process Payment</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Customer: <strong>{paymentAppointment.customerName}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Date: {formatDateTime(paymentAppointment.appointmentDateTime)}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Select customer type to determine pricing:
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => processPayment("student")}
                className="w-full p-4 text-left border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-blue-900">Student</div>
                    <div className="text-sm text-blue-600">Discounted rate</div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">€10</div>
                </div>
              </button>

              <button
                onClick={() => processPayment("professional")}
                className="w-full p-4 text-left border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-purple-900">
                      Professional
                    </div>
                    <div className="text-sm text-purple-600">Standard rate</div>
                  </div>
                  <div className="text-xl font-bold text-purple-600">€15</div>
                </div>
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAppointment(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
