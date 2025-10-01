import React from 'react';
import { testimonials } from '../mock/data';

const ClientPortalSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              From clutter to client-favorite
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Delight clients with a modern portal to connect, pay, share tax documents, and track their filing progress — all in one place.
            </p>
            <a 
              href="/client-portal"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View client portal →
            </a>
          </div>

          {/* Right Content - Testimonial */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-start space-x-4">
              <img 
                src={testimonials[0].image}
                alt={testimonials[0].name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <blockquote className="text-gray-900 text-lg mb-4 italic">
                  "{testimonials[0].quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-gray-900">{testimonials[0].name}</p>
                  <p className="text-gray-600 text-sm">{testimonials[0].role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientPortalSection;