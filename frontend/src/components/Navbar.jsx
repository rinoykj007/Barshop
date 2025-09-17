import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout, adminUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    // Toggle body scroll
    document.body.style.overflow = newMenuState ? "hidden" : "auto";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    // Re-enable body scroll when menu is closed
    document.body.style.overflow = "auto";
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const scrollToSection = (sectionId) => (e) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        // Add a small offset to account for the fixed header
        const yOffset = -80;
        const y =
          section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      // If not on home page, navigate to home first, then scroll
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  // Handle scroll after navigation
  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        const yOffset = -80;
        const y =
          section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        // Clear the state after scrolling
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  const navItems = [
    { path: "/", label: "Home" },
    {
      path: "#services",
      label: "Services",
      onClick: scrollToSection("services"),
    },
    {
      path: "#barbers",
      label: "Our Barbers",
      onClick: scrollToSection("barbers"),
    },
    { path: "#contact", label: "Contact", onClick: scrollToSection("contact") },
  ];

  const adminItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/appointments", label: "Appointments" },
    { path: "/admin/services", label: "Manage Services" },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled || location.pathname !== "/" 
          ? "bg-white/95 backdrop-blur-md shadow-md" 
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2 group"
              onClick={closeMenu}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                Barshop
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick || null}
                className={`px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive(item.path) && !item.onClick
                    ? "text-amber-600 bg-amber-50"
                    : `${
                        scrolled || location.pathname !== "/"
                          ? "text-gray-900 hover:bg-gray-100"
                          : "text-white hover:bg-white/10 hover:text-amber-400"
                      }`
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Admin Navigation */}
            {isAuthenticated && (
              <div className="relative group ml-2">
                <button className="flex items-center space-x-1 px-4 py-2.5 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-50">
                  <span>Admin</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <div className="py-1">
                    {adminItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-4 py-2.5 text-sm ${
                          isActive(item.path)
                            ? "bg-amber-50 text-amber-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <Link
                to="/admin"
                className="ml-2 px-5 py-2.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-300 shadow-lg hover:shadow-amber-500/30"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-full ${
                scrolled || isMenuOpen
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              } transition-colors duration-300`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transform transition-all duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          right: 0,
          left: "auto",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="pt-5 pb-6 px-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent"
              onClick={closeMenu}
            >
              Barshop
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Close menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick || closeMenu}
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  isActive(item.path) && !item.onClick
                    ? "bg-amber-50 text-amber-600"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Admin Panel
              </h3>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-3 rounded-lg text-base font-medium ${
                      isActive(item.path)
                        ? "bg-amber-50 text-amber-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-6">
              <Link
                to="/admin"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-amber-500 hover:bg-amber-600"
                onClick={closeMenu}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
