import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import SimpleNavbar from './SimpleNavbar';
import { Users, Award, Shield, Zap, Target, Heart } from 'lucide-react';

const AboutUsPage = () => {
  const stats = [
    { number: "1000+", label: "Tax Professionals", icon: <Users className="w-6 h-6" /> },
    { number: "50K+", label: "Clients Served", icon: <Target className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Shield className="w-6 h-6" /> },
    { number: "24/7", label: "Support", icon: <Heart className="w-6 h-6" /> }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&crop=face",
      bio: "15+ years in tax & accounting technology"
    },
    {
      name: "Michael Chen", 
      role: "CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Expert in fintech and security systems"
    },
    {
      name: "Lisa Rodriguez",
      role: "Head of Customer Success",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face", 
      bio: "Dedicated to helping practices grow and succeed"
    }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Security First",
      description: "Bank-level encryption and security protocols protect all client data and communications."
    },
    {
      icon: <Zap className="w-8 h-8 text-green-600" />,
      title: "Simple & Fast",
      description: "Intuitive design that tax professionals and clients love. No complex training required."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Professional Excellence", 
      description: "Built by tax professionals, for tax professionals. We understand your workflow."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Client Focused",
      description: "Every feature designed to improve the client experience and strengthen relationships."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Simplifying Tax & Bookkeeping Technology
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            We're on a mission to help tax professionals build stronger client relationships 
            through better technology and seamless communication.
          </p>
          <Button variant="secondary" size="lg">
            Start Your Free Trial
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <CardTitle className="text-3xl font-bold">{stat.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Founded by tax professionals who experienced firsthand the challenges of client communication, 
              document management, and payment processing in traditional accounting practices.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The Problem We Solve</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Tax professionals spend countless hours on administrative tasks - chasing documents, 
                  managing client communications through multiple channels, and dealing with payment delays.
                </p>
                <p>
                  Clients often feel disconnected from the process, unsure about status updates, 
                  and frustrated with traditional communication methods.
                </p>
                <p>
                  We built TaxPortal to solve these problems with a simple, secure platform that 
                  brings everything together in one place.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="font-bold text-lg mb-4">What makes us different:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-sm">Built specifically for tax & bookkeeping professionals</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-sm">Simple enough for any client to use without training</span>
                </li>
                <li className="flex items-start">
                  <Award className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-sm">Enterprise security with small business pricing</span>
                </li>
                <li className="flex items-start">
                  <Heart className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-sm">White label options for agencies and large firms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              Experienced professionals dedicated to your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Business Solutions</h2>
            <p className="text-lg text-gray-600">
              More than just software - we offer complete tax and bookkeeping services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4 text-center">📊 Bookkeeping Services</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Monthly financial statements</li>
                <li>• Accounts payable/receivable</li>
                <li>• Bank reconciliation</li>
                <li>• QuickBooks setup & training</li>
                <li>• Financial reporting & analysis</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4 text-center">📋 Tax Services</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Individual & business tax prep</li>
                <li>• Tax planning & strategies</li>
                <li>• IRS audit support</li>
                <li>• Quarterly estimated payments</li>
                <li>• Multi-state tax filing</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4 text-center">💻 Portal Technology</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• White label solutions</li>
                <li>• Payment gateway integration</li>
                <li>• Email sync & automation</li>
                <li>• Two-factor authentication</li>
                <li>• API access & integrations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of tax professionals who have modernized their client experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
            <Button variant="ghost" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;