import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { paymentAPI } from '../services/api';
import { 
  Crown,
  Check,
  Zap,
  Building,
  Users,
  CreditCard,
  Calendar,
  Loader,
  AlertCircle
} from 'lucide-react';

const PlatformSubscription = () => {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const subscriptionPlans = [
    {
      id: 'starter_subscription',
      name: 'Starter',
      price: { monthly: 29, yearly: 290 },
      description: 'Perfect for individual tax professionals getting started',
      features: [
        'Up to 25 active clients',
        '5GB document storage',
        'Basic invoicing & payments',
        'Email support',
        'Client portal access',
        'Standard reporting',
        'Mobile app access'
      ],
      limits: {
        clients: 25,
        storage: '5GB',
        users: 1
      }
    },
    {
      id: 'professional_subscription',
      name: 'Professional',
      price: { monthly: 79, yearly: 790 },
      description: 'Ideal for growing practices with advanced needs',
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
      limits: {
        clients: 100,
        storage: '50GB',
        users: 3
      },
      popular: true
    },
    {
      id: 'enterprise_subscription',
      name: 'Enterprise',
      price: { monthly: 199, yearly: 1990 },
      description: 'Complete solution for large practices and firms',
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
      limits: {
        clients: 'Unlimited',
        storage: 'Unlimited',
        users: 25
      }
    },
    {
      id: 'white_label_subscription',
      name: 'White Label',
      price: { monthly: 499, yearly: 4990 },
      description: 'Complete white-label solution for agencies',
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
      limits: {
        clients: 'Unlimited',
        storage: 'Unlimited',
        users: 'Unlimited'
      },
      isWhiteLabel: true
    }
  ];

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  const loadCurrentSubscription = async () => {
    try {
      setIsLoading(true);
      // Mock current subscription - replace with real API call
      setCurrentSubscription({
        plan: 'professional_subscription',
        status: 'active',
        billingCycle: 'monthly',
        nextBillingDate: '2024-11-02',
        amount: 79.00
      });
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setIsProcessing(true);
      const originUrl = window.location.origin;
      
      const response = await paymentAPI.createServicePayment(
        planId,
        originUrl,
        { 
          plan_type: 'platform_subscription',
          billing_cycle: billingCycle,
          current_plan: currentSubscription?.plan 
        }
      );
      
      if (response.success && response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanStatus = (planId) => {
    if (!currentSubscription) return 'available';
    if (currentSubscription.plan === planId) return 'current';
    
    const currentPlanIndex = subscriptionPlans.findIndex(p => p.id === currentSubscription.plan);
    const thisPlanIndex = subscriptionPlans.findIndex(p => p.id === planId);
    
    if (thisPlanIndex > currentPlanIndex) return 'upgrade';
    if (thisPlanIndex < currentPlanIndex) return 'downgrade';
    
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Subscription</h1>
          <p className="text-gray-600 mt-2">Manage your TaxPortal Pro subscription and billing</p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Subscription</span>
                <Badge className={getStatusColor(currentSubscription.status)}>
                  {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
                  <p className="text-lg font-semibold text-blue-600">
                    {subscriptionPlans.find(p => p.id === currentSubscription.plan)?.name || 'Unknown Plan'}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${currentSubscription.amount}/{currentSubscription.billingCycle}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Next Billing Date</h3>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{currentSubscription.nextBillingDate}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment
                    </Button>
                    <Button variant="outline" size="sm">
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
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

        {/* Subscription Plans */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {subscriptionPlans.map((plan) => {
            const planStatus = getPlanStatus(plan.id);
            
            return (
              <Card 
                key={plan.id}
                className={`relative ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                } ${planStatus === 'current' ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                {planStatus === 'current' && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.isWhiteLabel ? 'bg-orange-100' : 
                      plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {plan.isWhiteLabel ? (
                        <Crown className="w-8 h-8 text-orange-600" />
                      ) : plan.popular ? (
                        <Zap className="w-8 h-8 text-blue-600" />
                      ) : (
                        <Building className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    className="w-full mb-6"
                    disabled={planStatus === 'current' || isProcessing}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isProcessing ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {planStatus === 'current' ? 'Current Plan' :
                     planStatus === 'upgrade' ? 'Upgrade' :
                     planStatus === 'downgrade' ? 'Downgrade' : 'Subscribe'}
                  </Button>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Plan Limits:</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex justify-between">
                          <span>Clients:</span>
                          <span className="font-medium">{plan.limits.clients}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Storage:</span>
                          <span className="font-medium">{plan.limits.storage}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Team Users:</span>
                          <span className="font-medium">{plan.limits.users}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-xs">
                            <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-xs text-gray-500">
                            +{plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Billing Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-4">Payment Method</h3>
                <div className="flex items-center p-4 border rounded-lg">
                  <CreditCard className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/26</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Update
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Billing Address</h3>
                <div className="text-sm text-gray-600">
                  <p>123 Business Street</p>
                  <p>Suite 100</p>
                  <p>Business City, ST 12345</p>
                  <p>United States</p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Update Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>Your usage for the current billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Clients</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">12</span>
                  <span className="text-sm text-gray-500">/ 100 limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Storage Used</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">2.4GB</span>
                  <span className="text-sm text-gray-500">/ 50GB limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Team Members</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">1</span>
                  <span className="text-sm text-gray-500">/ 3 limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformSubscription;