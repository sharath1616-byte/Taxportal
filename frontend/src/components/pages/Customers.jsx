import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Customers = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Customers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of tax professionals and accounting firms who trust TaxPortal for their client management needs.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face"
                alt="Sarah Johnson"
                className="w-16 h-16 rounded-full object-cover mb-4"
              />
              <blockquote className="text-gray-900 mb-4 italic">
                "TaxPortal has revolutionized how we manage our client relationships. The document sharing and task management features save us hours every week."
              </blockquote>
              <div>
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-gray-600 text-sm">Johnson Tax Services</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                alt="Michael Chen"
                className="w-16 h-16 rounded-full object-cover mb-4"
              />
              <blockquote className="text-gray-900 mb-4 italic">
                "Our clients love the secure portal. They can upload documents anytime and track their tax preparation progress in real-time."
              </blockquote>
              <div>
                <p className="font-semibold text-gray-900">Michael Chen</p>
                <p className="text-gray-600 text-sm">Chen Accounting</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Lisa Rodriguez"
                className="w-16 h-16 rounded-full object-cover mb-4"
              />
              <blockquote className="text-gray-900 mb-4 italic">
                "The AI-powered features help us catch deductions we might have missed. It's like having an extra team member."
              </blockquote>
              <div>
                <p className="font-semibold text-gray-900">Lisa Rodriguez</p>
                <p className="text-gray-600 text-sm">Rodriguez CPA Firm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Customers;