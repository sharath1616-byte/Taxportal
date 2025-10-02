import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, FileText, MessageSquare, Receipt, Users, Zap } from 'lucide-react';
import SimpleNavbar from './SimpleNavbar';

const LandingNavbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              TaxPortal
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/pricing">
                <Button variant="ghost" size="sm">
                  Pricing
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="sm">
                  About Us
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const SimpleLanding = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure & Private",
      description: "Bank-level security for all your tax documents and data"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Document Management",
      description: "Upload, organize, and share tax documents seamlessly"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Client Communication", 
      description: "Direct messaging between clients and tax professionals"
    },
    {
      icon: <Receipt className="w-8 h-8 text-orange-600" />,
      title: "Invoice Management",
      description: "Create, send, and track invoices with payment processing"
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: "Client Portal",
      description: "Dedicated portal for each client with personalized dashboard"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Fast & Simple",
      description: "Clean, intuitive interface that's easy to use"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNavbar />
      
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple Tax Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A clean, secure platform for tax professionals and clients to collaborate, 
              share documents, communicate, and manage invoices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need in one place
            </h2>
            <p className="text-lg text-gray-600">
              Focus on tax work, not technology. Our simple platform handles the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to simplify your tax workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join tax professionals who trust TaxPortal for their client management.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Start Your Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-4">TaxPortal</div>
            <p className="text-gray-600 mb-4">
              Simple, secure tax collaboration platform
            </p>
            <p className="text-sm text-gray-400">
              © 2024 TaxPortal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLanding;