import React from 'react';

const AIBackofficeSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - AI Interface Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">AI Tax Assistant</h3>
                </div>
                
                {/* Chat Interface */}
                <div className="p-6 h-80 overflow-y-auto">
                  <div className="space-y-4">
                    {/* AI Message */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-semibold">AI</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                        <p className="text-gray-800 text-sm">I've analyzed John's tax documents. He's eligible for a $2,400 deduction that was missed last year.</p>
                      </div>
                    </div>
                    
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                        <p className="text-sm">Can you prepare an amended return?</p>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-semibold">AI</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                        <p className="text-gray-800 text-sm">I've drafted Form 1040X and uploaded it to John's portal. Expected refund: $672.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Ask about client tax matters..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      disabled
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Get organized with an AI-powered back office
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your team's time is money: centralize your visibility into client relationships across your tax practice with secure AI assistance for faster, more accurate tax preparation.
            </p>
            <a 
              href="/client-management"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View CRM →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIBackofficeSection;