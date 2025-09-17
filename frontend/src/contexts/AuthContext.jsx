import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isAuth = localStorage.getItem("adminAuthenticated") === "true";
      const userInfo = localStorage.getItem("adminUser");

      if (isAuth && userInfo) {
        const user = JSON.parse(userInfo);

        // Check if login is still valid (24 hours)
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          setIsAuthenticated(true);
          setAdminUser(user);
        } else {
          // Session expired
          logout();
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userInfo) => {
    localStorage.setItem("adminAuthenticated", "true");
    localStorage.setItem("adminUser", JSON.stringify(userInfo));
    setIsAuthenticated(true);
    setAdminUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUser");
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const value = {
    isAuthenticated,
    adminUser,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
