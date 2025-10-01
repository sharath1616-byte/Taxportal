import React from 'react';
import { features } from '../mock/data';

const FeaturesGrid = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            More than just a client portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Deliver a bespoke client experience with powerful tools — messaging, file-sharing, invoicing, tax preparation, and more — at no extra cost.
          </p>
          <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
            Start Trial
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Feature Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 h-64 flex flex-col justify-between relative overflow-hidden">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{features[0].title}</h3>
                <p className="text-gray-700">{features[0].description}</p>
              </div>
              {features[0].image && (
                <div className="absolute -right-4 -bottom-4">
                  <img 
                    src={features[0].image}
                    alt={features[0].title}
                    className="w-32 h-32 object-cover rounded-xl opacity-70"
                  />
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 h-64 flex flex-col justify-between relative overflow-hidden">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{features[1].title}</h3>
                <p className="text-gray-700">{features[1].description}</p>
              </div>
              {features[1].image && (
                <div className="absolute -right-4 -bottom-4">
                  <img 
                    src={features[1].image}
                    alt={features[1].title}
                    className="w-32 h-32 object-cover rounded-xl opacity-70"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Smaller Feature Cards */}
          <div className="space-y-6">
            {features.slice(2).map((feature, index) => (
              <div key={feature.id} className="bg-gray-50 rounded-3xl p-6 h-40 flex flex-col justify-between hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
                <div className="flex justify-end">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;