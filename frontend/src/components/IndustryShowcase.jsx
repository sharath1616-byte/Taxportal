import React, { useState } from 'react';
import { industryShowcase } from '../mock/data';

const IndustryShowcase = () => {
  const [activeTab, setActiveTab] = useState('Streamline');

  const tabs = [
    {
      id: 'Streamline',
      label: 'Streamline',
      title: 'Made for tax-enabled professional service firms',
      subtitle: 'Trusted by tax preparation, accounting, bookkeeping, and financial advisory firms with 100,000+ clients and counting.'
    },
    {
      id: 'Centralize', 
      label: 'Centralize',
      title: 'Centralize all client communications',
      subtitle: 'Keep all client interactions, documents, and payments in one secure location for better organization.'
    },
    {
      id: 'Customize',
      label: 'Customize',
      title: 'Customize your client experience',
      subtitle: 'Brand your portal with your logo, colors, and messaging to create a seamless client experience.'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-full p-1 inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {activeTabData.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {activeTabData.subtitle}
          </p>
          <div className="mt-8">
            <a 
              href="/customers" 
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              Meet our customers →
            </a>
          </div>
        </div>

        {/* Industry Cards Carousel */}
        <div className="relative">
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
            {industryShowcase.map((industry) => (
              <div 
                key={industry.id}
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={industry.image}
                    alt={industry.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-semibold">{industry.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient fade on the right */}
          <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default IndustryShowcase;