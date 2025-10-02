import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { 
  CreditCard, 
  DollarSign, 
  Clock,
  Check,
  AlertCircle,
  ShoppingCart,
  Receipt,
  Loader
} from 'lucide-react';

const PaymentIntegration = () => {
  const { user } = useAuth();
  const [servicePackages, setServicePackages] = useState({});
  const [userTransactions, setUserTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [packagesData, transactionsData] = await Promise.all([
        paymentAPI.getServicePackages(),
        paymentAPI.getUserTransactions()
      ]);
      
      setServicePackages(packagesData.packages);
      setUserTransactions(transactionsData.transactions);
    } catch (err) {
      setError('Failed to load payment data');
      console.error('Error loading payment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServicePayment = async (servicePackage) => {
    try {
      setIsProcessingPayment(true);
      setError(null);
      
      const originUrl = window.location.origin;
      const response = await paymentAPI.createServicePayment(servicePackage, originUrl, {
        user_email: user.email,
        user_name: `${user.profile?.firstName} ${user.profile?.lastName}`
      });
      
      if (response.success && response.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initiate payment');
      console.error('Payment error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'initiated':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'initiated':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Services</h1>
          <p className="text-gray-600">
            Purchase tax and bookkeeping services securely through our integrated payment system.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Service Packages */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Available Services
              </CardTitle>
              <CardDescription>
                Choose from our professional tax and bookkeeping service packages
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(servicePackages).map(([packageId, packageInfo]) => (
                  <div key={packageId} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold mb-2">{packageInfo.name}</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatCurrency(packageInfo.price, packageInfo.currency)}
                      </div>
                      <p className="text-gray-600 text-sm">{packageInfo.description}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {packageInfo.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => handleServicePayment(packageId)}
                      disabled={isProcessingPayment}
                      className="w-full"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Purchase Service
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Payment History
            </CardTitle>
            <CardDescription>
              Your recent payment transactions and service purchases
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {userTransactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No payment transactions yet</p>
                <p className="text-sm text-gray-400">
                  Purchase a service above to see your transaction history
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTransactions.map((transaction, index) => (
                  <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        {getStatusIcon(transaction.payment_status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {transaction.transaction_type === 'service_payment' 
                            ? servicePackages[transaction.service_package]?.name || transaction.service_package
                            : `Invoice Payment`
                          }
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
                          <span>•</span>
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Stripe</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(transaction.payment_status)}>
                        {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                      </Badge>
                      
                      {transaction.payment_status === 'paid' && transaction.paid_at && (
                        <div className="text-xs text-gray-500">
                          Paid: {new Date(transaction.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Secure Payment Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Stripe Integration</h3>
                <p className="text-sm text-gray-600">
                  Secure payment processing with industry-leading encryption
                </p>
              </div>
              
              <div>
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Multiple Payment Methods</h3>
                <p className="text-sm text-gray-600">
                  Accept all major credit cards and digital payment methods
                </p>
              </div>
              
              <div>
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Instant Processing</h3>
                <p className="text-sm text-gray-600">
                  Real-time payment processing with immediate confirmation
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Security Note:</strong> All payments are processed securely through Stripe. 
                Your payment information is never stored on our servers and is protected with 
                bank-level encryption.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentIntegration;