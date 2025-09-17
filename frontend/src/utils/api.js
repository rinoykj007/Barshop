import axios from "axios";

// Create axios instance with base configuration
// Use environment variable for API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies if using session-based auth
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// User API functions
export const userAPI = {
  getAdminStatus: () => api.get("/users/admin/status"),
  adminLogin: (credentials) => api.post("/users/admin/login", credentials),
  initializeAdmin: (userData) => api.post("/users/admin/initialize", userData),
};

// Appointment API functions
export const appointmentAPI = {
  testConnection: () => api.get("/appointments/test"),
  getAppointments: () => api.get("/appointments"),
  getAvailableTimeSlots: (date) => api.get(`/appointments/available/${date}`),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) =>
    api.post("/appointments", appointmentData),
  updateAppointment: (id, appointmentData) =>
    api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  processPayment: (id, customerType) =>
    api.post(`/appointments/${id}/payment`, { customerType }),
  getCollectionReports: (period) =>
    api.get(`/appointments/reports/collections?period=${period}`),
  getPaymentStatus: () => api.get("/appointments/payments/status"),
};

export default api;
