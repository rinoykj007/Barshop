import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: '✂️',
    title: 'Haircuts',
    description: 'Professional haircuts tailored to your style',
    bgColor: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    delay: '100'
  },
  {
    icon: '🪒',
    title: 'Shaving',
    description: 'Classic straight razor shaves',
    bgColor: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-600',
    delay: '200'
  },
  {
    icon: '🧔',
    title: 'Beard Trim',
    description: 'Precision beard grooming',
    bgColor: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-600',
    delay: '300'
  },
  {
    icon: '🧴',
    title: 'Grooming',
    description: 'Complete grooming services',
    bgColor: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    delay: '400'
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80"></div>
          <img 
            src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt="Barbershop interior"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center w-full">
          <div className="mb-8">
            <span className="inline-block bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              PREMIUM BARBERSHOP IN DUBLIN
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Art of <span className="text-amber-400">Grooming</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Experience the perfect blend of traditional barbering and contemporary style in the heart of Dublin.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/book" 
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/30"
            >
              Book Appointment
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center border-2 border-white/30 hover:border-white/50 text-white font-medium py-4 px-10 rounded-full text-lg transition-all duration-300 hover:bg-white/5"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <span className="inline-block text-amber-500 font-medium mb-4">OUR SERVICES</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Premium <span className="text-amber-500">Grooming</span> Services
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-8"></div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Experience the finest grooming services in Dublin, delivered by our master barbers with years of expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={service.delay}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative p-8 z-10">
                  <div className={`w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto group-hover:bg-white/20 transition-colors duration-500`}>
                    <span className="text-3xl">{service.icon}</span>
                  </div>
                  <h3 className={`text-2xl font-bold text-center mb-4 group-hover:text-white transition-colors duration-500`}>
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center group-hover:text-white/80 transition-colors duration-500">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Barbers Section */}
      <section id="barbers" className="py-24 bg-gray-50 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum-dark.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                  alt="Barber at work"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <span className="block text-4xl font-bold text-amber-400">12+</span>
                      <span className="text-sm text-gray-300">Years Experience</span>
                    </div>
                    <div className="h-12 w-px bg-white/20"></div>
                    <div className="ml-4">
                      <span className="block text-4xl font-bold text-amber-400">5K+</span>
                      <span className="text-sm text-gray-300">Happy Clients</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500 rounded-full -z-10"></div>
            </div>
            <div className="lg:pl-12">
              <span className="inline-block text-amber-500 font-medium mb-4">ABOUT US</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Crafting Style, <span className="text-amber-500">Building Confidence</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Welcome to our barbershop, where traditional barbering meets modern style. Our experienced barbers are dedicated to providing you with the highest quality service in a relaxed and friendly atmosphere.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We believe that a great haircut is an essential part of every man's routine. That's why we take the time to understand your personal style and deliver a look that's uniquely yours.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/about" 
                  className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-full transition-colors duration-300"
                >
                  Our Story
                </Link>
                <Link 
                  to="/barbers" 
                  className="inline-flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-8 rounded-full transition-colors duration-300"
                >
                  Meet Our Barbers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section id="contact" className="relative py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-amber-500/20 text-amber-400 px-6 py-2 rounded-full text-sm font-medium mb-6">
            READY TO TRANSFORM YOUR LOOK?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Book Your <span className="text-amber-400">Appointment</span> Today
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Experience the perfect blend of traditional barbering and modern style. Your best look starts here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/book" 
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/30"
            >
              Book Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a 
              href="tel:+3531234567" 
              className="inline-flex items-center justify-center border-2 border-white/30 hover:border-white/50 text-white font-medium py-4 px-10 rounded-full text-lg transition-all duration-300 hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +353 123 4567
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
