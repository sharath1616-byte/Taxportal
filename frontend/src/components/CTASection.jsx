import React from 'react';

const CTASection = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Your clients deserve better.
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Try for free for 14 days, no credit card required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors">
            Start Trial
          </button>
          <button className="border border-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:border-gray-400 transition-colors">
            Book Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;