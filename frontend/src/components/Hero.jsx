import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { customerLogos } from '../mock/data';

const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reviews Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium text-gray-900 mr-1">5 stars</span>
            <span className="text-sm text-gray-500">250+ reviews</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create remarkable client experiences
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
            Give customers a branded portal that lets you unify your tax and accounting client experience, from first consultation to tax filing completion.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="text-center mb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
              Start Trial
            </button>
            <button className="flex items-center text-gray-700 hover:text-gray-900 px-8 py-4 text-lg font-medium transition-colors">
              Book Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Image - Client Portal Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-200 rounded-3xl p-8 lg:p-12">
            <div className="bg-gray-900 rounded-2xl p-1">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                {/* Browser Chrome */}
                <div className="bg-gray-100 px-4 py-3 flex items-center border-b border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-white rounded-lg px-3 py-1 text-sm text-gray-600 inline-block">
                      TaxPortal Pro
                    </div>
                  </div>
                </div>
                
                {/* Portal Interface */}
                <div className="flex h-96">
                  {/* Sidebar */}
                  <div className="bg-blue-50 w-64 p-4 border-r border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center text-blue-600 bg-blue-100 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Home</span>
                      </div>
                      <div className="flex items-center text-gray-600 px-3 py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-sm">Messages</span>
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                      </div>
                      <div className="flex items-center text-gray-600 px-3 py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-sm">Tax Documents</span>
                      </div>
                      <div className="flex items-center text-gray-600 px-3 py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-sm">Invoices</span>
                      </div>
                      <div className="flex items-center text-gray-600 px-3 py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-sm">Contracts</span>
                      </div>
                      <div className="flex items-center text-gray-600 px-3 py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-sm">Tax Planning</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-white">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome, Sarah 👋</h2>
                      <p className="text-gray-600 text-sm">Ready to file your 2024 taxes?</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">Upload tax documents</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Pending</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">Review tax return draft</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ready</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">E-sign tax documents</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Waiting</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">Pay remaining balance</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Upcoming</span>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Filing Progress</h3>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-900">65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Logos */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 text-sm mb-8 font-medium">
            Trusted by 1,000+ tax and accounting professionals
          </p>
          <div className="flex justify-center items-center space-x-8 lg:space-x-12 opacity-60 grayscale">
            {customerLogos.map((customer) => (
              <div key={customer.id} className="flex-shrink-0">
                <img 
                  src={customer.logo} 
                  alt={customer.name}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;