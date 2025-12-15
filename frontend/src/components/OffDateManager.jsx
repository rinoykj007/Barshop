import React, { useState, useEffect } from "react";
import { settingsAPI } from "../utils/api";

const OffDateManager = () => {
  const [offDates, setOffDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      setOffDates(response.data.offDates || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load off dates");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffDate = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await settingsAPI.addOffDate(selectedDate);
      setSuccess("Off date added successfully!");
      setSelectedDate("");
      fetchSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding off date:", error);
      setError(error.message || "Failed to add off date");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveOffDate = async (date) => {
    if (!window.confirm("Are you sure you want to remove this off date?")) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await settingsAPI.removeOffDate(date);
      setSuccess("Off date removed successfully!");
      fetchSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error removing off date:", error);
      setError(error.message || "Failed to remove off date");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get tomorrow's date in YYYY-MM-DD format for min attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Sort off dates
  const sortedOffDates = [...offDates].sort((a, b) => new Date(a) - new Date(b));
  const upcomingOffDates = sortedOffDates.filter(date => !isDateInPast(date));
  const pastOffDates = sortedOffDates.filter(date => isDateInPast(date));

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading off dates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shop Off Dates</h2>
            <p className="text-sm text-gray-500">Manage days when the shop is closed</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Add Off Date Form */}
        <form onSubmit={handleAddOffDate} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Off Date
          </label>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTomorrowDate()}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              disabled={actionLoading}
            />
            <button
              type="submit"
              disabled={actionLoading || !selectedDate}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Upcoming Off Dates */}
        {upcomingOffDates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upcoming Off Dates ({upcomingOffDates.length})
            </h3>
            <div className="space-y-2">
              {upcomingOffDates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-900 font-medium">{formatDate(date)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveOffDate(date)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-red-600 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm font-medium">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Off Dates */}
        {pastOffDates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Past Off Dates ({pastOffDates.length})
            </h3>
            <div className="space-y-2">
              {pastOffDates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-600 font-medium">{formatDate(date)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveOffDate(date)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {offDates.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No off dates configured</p>
            <p className="text-gray-400 text-sm mt-1">Add dates when your shop will be closed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffDateManager;
