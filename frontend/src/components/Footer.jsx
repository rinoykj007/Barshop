import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Barshop</h3>
            <p className="text-gray-400 leading-relaxed">
              Where traditional barbering meets modern style. Experience the finest grooming services in the heart of Dublin.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram'].map((social) => (
                <a 
                  key={social}
                  href={`#${social}`} 
                  className="text-gray-400 hover:text-amber-500 transition-colors duration-300"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                  <i className={`fab fa-${social} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-800">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Services', path: '/services' },
                { name: 'Barbers', path: '/barbers' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Contact', path: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="text-gray-400 hover:text-amber-500 transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-800">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mt-1 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-gray-400">+353 1 234 5678</p>
                  <p className="text-sm text-gray-500">Mon-Sun, 9am-7pm</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mt-1 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-400">hello@barshop.ie</p>
                  <p className="text-sm text-gray-500">We'll respond ASAP</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mt-1 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-400">123 Grafton Street</p>
                  <p className="text-gray-400">Dublin 2, Ireland</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-800">Opening Hours</h4>
            <ul className="space-y-3">
              {[
                { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
                { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
                { day: 'Sunday', hours: 'Closed' },
              ].map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-gray-400">{item.day}</span>
                  <span className="text-white">{item.hours}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border-l-4 border-amber-500">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-white">Walk-ins welcome!</span> Appointments recommended for guaranteed service.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Barshop. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-amber-500 text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-amber-500 text-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-amber-500 text-sm transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
