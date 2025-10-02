import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { paymentAPI } from '../services/api';
import { 
  Check, 
  Star,
  Zap,
  Shield,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  Building,
  Crown,
  Palette,
  Globe,
  Settings,
  Briefcase,
  Award,
  Layers
} from 'lucide-react';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (planId, planName, price) => {
    try {
      setIsProcessing(true);
      const originUrl = window.location.origin;
      
      const response = await paymentAPI.createServicePayment(
        planId, 
        originUrl, 
        { plan_name: planName, billing_cycle: billingCycle }
      );
      
      if (response.success && response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 29, yearly: 290 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Perfect for individual tax professionals getting started',
      icon: <Briefcase className="w-8 h-8 text-blue-500" />,
      features: [
        'Up to 25 active clients',
        '5GB document storage',
        'Basic invoicing & payments',
        'Email support',
        'Client portal access',
        'Standard reporting',
        'Mobile app access'
      ],
      badge: null,
      buttonText: 'Get Started',
      buttonVariant: 'outline',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 79, yearly: 790 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Ideal for growing practices with advanced needs',
      icon: <Building className="w-8 h-8 text-green-500" />,
      features: [
        'Up to 100 active clients',
        '50GB document storage',
        'Advanced invoicing & payments',
        'Priority email & phone support',
        'Custom branding & templates',
        'Advanced reporting & analytics',
        'Team collaboration (3 users)',
        'API access',
        'Client communication tools',
        'Automated workflows'
      ],
      badge: 'Most Popular',
      buttonText: 'Start Free Trial',
      buttonVariant: 'default',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 199, yearly: 1990 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Complete solution for large practices and firms',
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      features: [
        'Unlimited clients',
        'Unlimited document storage',
        'Enterprise-grade security',
        '24/7 priority support',
        'Advanced user management (25 users)',
        'Custom integrations',
        'Compliance reporting',
        'Dedicated account manager',
        'SLA guarantee (99.9% uptime)',
        'Advanced analytics dashboard'
      ],
      badge: 'Best Value',
      buttonText: 'Contact Sales',
      buttonVariant: 'outline',
      popular: false
    },
    {
      id: 'white_label',
      name: 'White Label',
      price: { monthly: 499, yearly: 4990 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Complete white-label solution for agencies and software companies',
      icon: <Layers className="w-8 h-8 text-orange-500" />,
      features: [
        'Unlimited clients & users',
        'Complete white-label branding',
        'Custom domain & SSL',
        'Remove all TaxPortal branding',
        'Custom logo & color schemes',
        'Branded invoices & documents',
        'Custom email templates',
        'White-label mobile apps',
        'Dedicated infrastructure',
        'Priority development support',
        'Revenue sharing options'
      ],
      badge: 'White Label',
      buttonText: 'Schedule Demo',
      buttonVariant: 'gradient',
      popular: false,
      isWhiteLabel: true
    }
  ];

  const addOns = [
    {
      name: 'Additional Users',
      description: 'Add more team members to your account',
      price: { monthly: 15, yearly: 150 },
      icon: <Users className="w-6 h-6 text-blue-500" />
    },
    {
      name: 'Extra Storage',
      description: '100GB additional document storage',
      price: { monthly: 10, yearly: 100 },
      icon: <FileText className="w-6 h-6 text-green-500" />
    },
    {
      name: 'Premium Support',
      description: '24/7 phone support & dedicated success manager',
      price: { monthly: 50, yearly: 500 },
      icon: <Shield className="w-6 h-6 text-purple-500" />
    },
    {
      name: 'Custom Integrations',
      description: 'Connect with your existing software & systems',
      price: { monthly: 99, yearly: 990 },
      icon: <Settings className="w-6 h-6 text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive tax and bookkeeping portal solutions for professionals of all sizes. 
            From solo practitioners to large accounting firms.
          </p>
          <div className="flex justify-center">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              14-day free trial • No credit card required
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  {plan.description}
                </CardDescription>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Start Free Trial
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What's Included
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Client Invitations</h3>
              <p className="text-gray-600 text-sm">Invite clients directly - no self-registration needed</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Payment Processing</h3>
              <p className="text-gray-600 text-sm">Integrated payment gateways for seamless billing</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email Integration</h3>
              <p className="text-gray-600 text-sm">Sync emails and automate communication</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">White Label</h3>
              <p className="text-gray-600 text-sm">Enterprise plans include full white labeling</p>
            </div>
          </div>
        </div>

        {/* Services Offered */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Complete Business Solution</h2>
            <p className="text-blue-100 text-lg">
              Portal + Professional Services = Your Complete Tax & Bookkeeping Solution
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-4">📊 Bookkeeping Services</h3>
              <ul className="text-blue-100 space-y-2">
                <li>Monthly financial reports</li>
                <li>Expense categorization</li>
                <li>Bank reconciliation</li>
                <li>QuickBooks setup & maintenance</li>
              </ul>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-4">📋 Tax Filing Services</h3>
              <ul className="text-blue-100 space-y-2">
                <li>Individual tax returns</li>
                <li>Business tax preparation</li>
                <li>Quarterly tax planning</li>
                <li>Tax compliance & audit support</li>
              </ul>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-4">💻 Portal Technology</h3>
              <ul className="text-blue-100 space-y-2">
                <li>Client communication hub</li>
                <li>Secure document sharing</li>
                <li>Automated invoicing & payments</li>
                <li>White label solutions available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to transform your practice?
          </h2>
          <p className="text-gray-600 mb-8">
            Join hundreds of tax professionals who trust our platform
          </p>
          <Link to="/register">
            <Button size="lg" className="mr-4">
              Start Free Trial
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;