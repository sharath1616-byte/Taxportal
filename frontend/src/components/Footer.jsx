import React from 'react';
import { Twitter, Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const footerSections = {
    features: [
      { name: 'Client Portal', href: '/client-portal' },
      { name: 'Messages', href: '/messages' },
      { name: 'Invoicing', href: '/invoicing' },
      { name: 'Contracts', href: '/contracts' },
      { name: 'Tax Documents', href: '/documents' },
      { name: 'Files', href: '/files' },
      { name: 'Forms', href: '/forms' },
      { name: 'Stores', href: '/stores' }
    ],
    platform: [
      { name: 'Developer Home', href: '/developers' },
      { name: 'Custom Apps', href: '/custom-apps' },
      { name: 'API Reference', href: '/api' },
      { name: 'TaxPortal on Zapier', href: '/zapier' },
      { name: 'TaxPortal on Make', href: '/make' }
    ],
    company: [
      { name: 'Brand', href: '/brand' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy', href: '/privacy' }
    ],
    solutions: [
      { name: 'Tax Preparation', href: '/solutions/tax-preparation' },
      { name: 'Bookkeeping Services', href: '/solutions/bookkeeping' },
      { name: 'Financial Advisory', href: '/solutions/advisory' },
      { name: 'Payroll Services', href: '/solutions/payroll' },
      { name: 'Business Consulting', href: '/solutions/consulting' },
      { name: 'Audit Services', href: '/solutions/audit' }
    ],
    compare: [
      { name: 'Compare all', href: '/comparison' },
      { name: 'vs TaxDome', href: '/comparison/taxdome' },
      { name: 'vs SmartVault', href: '/comparison/smartvault' },
      { name: 'vs ShareFile', href: '/comparison/sharefile' },
      { name: 'vs CCH Axcess', href: '/comparison/cch-axcess' }
    ],
    templates: [
      { name: 'Tax Engagement Letters', href: '/templates/engagement-letters' },
      { name: 'Bookkeeping Contracts', href: '/templates/bookkeeping-contracts' },
      { name: 'Client Onboarding Forms', href: '/templates/onboarding' },
      { name: 'Tax Document Checklists', href: '/templates/checklists' }
    ],
    resources: [
      { name: 'Blog', href: '/blog' },
      { name: 'Guide', href: '/guide' },
      { name: "What's New", href: '/updates' },
      { name: 'Find an expert', href: '/experts' },
      { name: 'Security', href: '/security' },
      { name: 'System Status', href: '/status' },
      { name: 'Affiliates Program', href: '/affiliates' }
    ],
    blog: [
      { name: 'Best Tax Client Portal Software', href: '/blog/best-tax-client-portal' },
      { name: 'How to Digitize Your Tax Practice', href: '/blog/digitize-tax-practice' },
      { name: 'Client Communication Best Practices', href: '/blog/client-communication' },
      { name: 'Tax Season Organization Tips', href: '/blog/tax-season-organization' },
      { name: 'Secure Document Sharing Guide', href: '/blog/secure-document-sharing' },
      { name: 'Building Client Relationships', href: '/blog/client-relationships' }
    ]
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">▲</span> TaxPortal
            </div>
            <p className="text-gray-600 mb-6">
              Create remarkable client experiences
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3">
                {footerSections.features.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-3">
                {footerSections.platform.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-gray-900 mb-4 mt-8">Company</h3>
              <ul className="space-y-3">
                {footerSections.company.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Solutions</h3>
              <ul className="space-y-3">
                {footerSections.solutions.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-gray-900 mb-4 mt-8">Compare</h3>
              <ul className="space-y-3">
                {footerSections.compare.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Templates & Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contract Templates</h3>
              <ul className="space-y-3">
                {footerSections.templates.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Resources & Blog */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="grid grid-cols-2 gap-3">
                {footerSections.resources.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blog */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Blog</h3>
              <ul className="space-y-3">
                {footerSections.blog.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 TaxPortal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;