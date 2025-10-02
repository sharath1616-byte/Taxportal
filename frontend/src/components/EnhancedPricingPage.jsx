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
  Layers,
  Phone,
  Mail,
  Lock,
  Unlock,
  Database,
  Cloud
} from 'lucide-react';

const EnhancedPricingPage = () => {
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
      icon: <Briefcase className="w-8 h-8" />,
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
      popular: false,
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 79, yearly: 790 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Ideal for growing practices with advanced needs',
      icon: <Building className="w-8 h-8" />,
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
      popular: true,
      color: 'green'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 199, yearly: 1990 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Complete solution for large practices and firms',
      icon: <Crown className="w-8 h-8" />,
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
      popular: false,
      color: 'purple'
    },
    {
      id: 'white_label',
      name: 'White Label',
      price: { monthly: 499, yearly: 4990 },
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Complete white-label solution for agencies and software companies',
      icon: <Layers className="w-8 h-8" />,
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
      isWhiteLabel: true,
      color: 'orange'
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
      icon: <Database className="w-6 h-6 text-green-500" />
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

  const whiteLabel = [
    {
      title: 'Complete Branding Control',
      description: 'Replace all TaxPortal branding with your own',
      icon: <Palette className="w-8 h-8 text-orange-500" />,
      features: [
        'Custom logo upload',
        'Brand color customization',
        'Custom favicon',
        'Branded login pages',
        'Custom email templates'
      ]
    },
    {
      title: 'Custom Domain & Infrastructure',
      description: 'Host on your own domain with dedicated resources',
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      features: [
        'Custom domain setup',
        'SSL certificate included',
        'Dedicated server resources',
        'CDN optimization',
        'Regional data centers'
      ]
    },
    {
      title: 'White-Label Mobile Apps',
      description: 'Branded mobile apps for iOS and Android',
      icon: <Phone className="w-8 h-8 text-green-500" />,
      features: [
        'Custom app icons',
        'Your branding throughout',
        'App store publication',
        'Push notifications',
        'Offline functionality'
      ]
    }
  ];

  const getColorClasses = (color, isPopular = false, isWhiteLabel = false) => {
    if (isWhiteLabel) {
      return {
        bg: 'bg-gradient-to-br from-orange-50 to-red-50',
        border: 'border-orange-200',
        icon: 'bg-orange-100 text-orange-600',
        button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0'
      };
    }
    
    if (isPopular) {
      return {
        bg: 'bg-white',
        border: 'ring-2 ring-blue-500',
        icon: 'bg-blue-100 text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }

    const colors = {
      blue: {
        bg: 'bg-white',
        border: 'border-gray-200',
        icon: 'bg-blue-100 text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      green: {
        bg: 'bg-white',
        border: 'border-gray-200',
        icon: 'bg-green-100 text-green-600',
        button: 'bg-green-600 hover:bg-green-700 text-white'
      },
      purple: {
        bg: 'bg-white',
        border: 'border-gray-200',
        icon: 'bg-purple-100 text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700 text-white'
      }
    };

    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From solo practitioners to enterprise solutions and white-label offerings. 
            Scale your tax and accounting practice with our comprehensive platform.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <Badge className="bg-green-100 text-green-800 ml-2">Save up to 20%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, index) => {
            const colorClasses = getColorClasses(plan.color, plan.popular, plan.isWhiteLabel);
            
            return (
              <Card 
                key={index} 
                className={`relative ${colorClasses.bg} ${colorClasses.border} ${
                  plan.popular ? 'shadow-lg scale-105' : ''
                } transition-all duration-200 hover:shadow-lg`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`px-4 py-1 ${
                      plan.isWhiteLabel 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                        : plan.popular 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-green-500 text-white'
                    }`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${colorClasses.icon}`}>
                      {plan.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${colorClasses.button}`}
                    variant={plan.popular || plan.isWhiteLabel ? 'default' : 'outline'}
                    disabled={isProcessing}
                    onClick={() => {
                      if (plan.name === 'Enterprise' || plan.name === 'White Label') {
                        window.open('mailto:sales@taxportal.com?subject=Enterprise Inquiry', '_blank');
                      } else {
                        handlePurchase(plan.id, plan.name, plan.price[billingCycle]);
                      }
                    }}
                  >
                    {isProcessing ? 'Processing...' : plan.buttonText}
                  </Button>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* White Label Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">White Label Solution Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform our platform into your own branded solution with complete customization control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whiteLabel.map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-8">
                  <div className="flex justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  <ul className="text-left space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enhance Your Plan</h2>
            <p className="text-xl text-gray-600">
              Add powerful features to customize your experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {addon.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{addon.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
                  <div className="text-2xl font-bold text-gray-900 mb-4">
                    ${addon.price[billingCycle]}
                    <span className="text-sm font-normal text-gray-500">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Add to Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can change your plan at any time. Upgrades take effect immediately, 
                  and downgrades take effect at the start of your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-gray-600 text-sm">
                  All plans come with a 14-day free trial. No credit card required to start.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How does white-label billing work?</h3>
                <p className="text-gray-600 text-sm">
                  White-label customers can set their own pricing and collect payments directly. 
                  We offer flexible revenue sharing models.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, we use bank-level encryption, regular security audits, and comply with 
                  SOC 2 Type II and other industry standards.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your subscription at any time. Your account remains 
                  active until the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of tax professionals who trust TaxPortal Pro
              </p>
              <div className="space-x-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPricingPage;