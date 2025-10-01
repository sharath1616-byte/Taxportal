import React from 'react';
import { integrationLogos, testimonials } from '../mock/data';

const IntegrationsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Integrate with any existing tax and accounting tools
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Bring in all your existing tax software, accounting tools, and business applications as embeds or integrations, as easily as installing apps. Or dive deeper with custom apps on a flexible API and development platform.
            </p>
            <a 
              href="/platform"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View platform →
            </a>
          </div>

          {/* Right Content - Integration Logos Grid */}
          <div>
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="grid grid-cols-3 gap-8 items-center">
                {integrationLogos.map((integration, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <img 
                      src={integration.logo} 
                      alt={integration.name}
                      className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                ))}
                
                {/* Additional placeholder integrations */}
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-8 bg-gray-300 rounded-md"></div>
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-8 bg-gray-300 rounded-md"></div>
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-20 h-8 bg-gray-300 rounded-md"></div>
                </div>
              </div>
              
              {/* Integration Badge */}
              <div className="mt-6 text-center">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  50+ Integrations Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <img 
                src={testimonials[1].image}
                alt={testimonials[1].name}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <blockquote className="text-gray-900 text-xl mb-6 italic">
              "{testimonials[1].quote}"
            </blockquote>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{testimonials[1].name}</p>
              <p className="text-gray-600">{testimonials[1].role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;