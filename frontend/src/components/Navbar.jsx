import React, { useState } from 'react';
import { ChevronDown, Users, Settings, Layers, Calculator, BookOpen, TrendingUp, Building, FileCheck, FileText, Bell, Search, Shield, Menu, X } from 'lucide-react';
import { navigationMenu } from '../mock/data';

const Navbar = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const iconMap = {
    Users, Settings, Layers, Calculator, BookOpen, TrendingUp, Building, FileCheck, FileText, Bell, Search, Shield
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="bg-blue-50 text-center py-2 px-4 text-sm text-gray-700">
        Introducing TaxPortal Pro: AI-powered Platform for Tax & Accounting Firms →
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">▲</span> TaxPortal
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Products Dropdown */}
            <div className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}>
              <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Products
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-1 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">You get</h3>
                      {navigationMenu.products["You get"].map((item, index) => {
                        const IconComponent = iconMap[item.icon];
                        return (
                          <a key={index} href={item.link} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <IconComponent className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">You can</h3>
                      <div className="space-y-2">
                        {navigationMenu.products["You can"].map((item, index) => (
                          <a key={index} href={item.link} className="block text-sm text-gray-700 hover:text-blue-600 transition-colors">
                            {item.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div className="relative"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}>
              <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Solutions
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Industries</h3>
                  {navigationMenu.solutions.Industries.map((item, index) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                      <a key={index} href={item.link} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <IconComponent className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}>
              <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Resources
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                  {navigationMenu.resources.map((item, index) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                      <a key={index} href={item.link} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <IconComponent className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <a href="/customers" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Customers
            </a>
            <a href="/pricing" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Pricing
            </a>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Book Demo
            </button>
            <a href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Log In
            </a>
            <a href="/register" className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Start Trial
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              <a href="#" className="block px-3 py-2 text-gray-700 font-medium">Products</a>
              <a href="#" className="block px-3 py-2 text-gray-700 font-medium">Solutions</a>
              <a href="#" className="block px-3 py-2 text-gray-700 font-medium">Resources</a>
              <a href="#" className="block px-3 py-2 text-gray-700 font-medium">Customers</a>
              <a href="#" className="block px-3 py-2 text-gray-700 font-medium">Pricing</a>
              <div className="pt-4 border-t border-gray-200">
                <button className="block w-full text-left px-3 py-2 text-gray-700 font-medium">
                  Book Demo
                </button>
                <button className="block w-full text-left px-3 py-2 text-gray-700 font-medium">
                  Log In
                </button>
                <button className="mt-2 w-full bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                  Start Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;