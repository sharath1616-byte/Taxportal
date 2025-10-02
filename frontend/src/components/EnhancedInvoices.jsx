import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { invoiceAPI, clientAPI, paymentAPI } from '../services/api';
import { 
  Receipt, 
  Plus, 
  Search,
  Filter,
  Eye,
  Download,
  DollarSign,
  Calendar,
  User,
  Send,
  Edit,
  Trash2,
  FileText,
  Image,
  Upload,
  X,
  CreditCard,
  Mail
} from 'lucide-react';

const EnhancedInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationSettings, setOrganizationSettings] = useState({
    companyName: 'Your Tax Firm',
    companyLogo: null,
    address: '123 Business St, Suite 100',
    city: 'Business City',
    state: 'ST',
    zip: '12345',
    phone: '(555) 123-4567',
    email: 'info@yourtaxfirm.com',
    website: 'www.yourtaxfirm.com'
  });

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '',
    terms: 'Payment is due within 30 days',
    subtotal: 0,
    tax: 0,
    taxRate: 0,
    total: 0,
    status: 'draft'
  });

  // Mock data for demonstration
  const mockInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      clientId: 1,
      clientName: 'Sarah Johnson',
      clientCompany: 'Johnson Consulting LLC',
      issueDate: '2024-02-01',
      dueDate: '2024-03-03',
      subtotal: 350.00,
      tax: 28.00,
      total: 378.00,
      status: 'sent',
      items: [
        { description: 'Individual Tax Preparation', quantity: 1, rate: 350.00, amount: 350.00 }
      ]
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      clientId: 2,
      clientName: 'Michael Chen',
      clientCompany: 'TechCorp Industries',
      issueDate: '2024-02-05',
      dueDate: '2024-03-07',
      subtotal: 500.00,
      tax: 40.00,
      total: 540.00,
      status: 'paid',
      paidDate: '2024-02-20',
      items: [
        { description: 'Business Tax Preparation', quantity: 1, rate: 400.00, amount: 400.00 },
        { description: 'Bookkeeping Services', quantity: 1, rate: 100.00, amount: 100.00 }
      ]
    }
  ];

  const mockClients = [
    { id: 1, firstName: 'Sarah', lastName: 'Johnson', company: 'Johnson Consulting LLC', email: 'sarah@johnson.com' },
    { id: 2, firstName: 'Michael', lastName: 'Chen', company: 'TechCorp Industries', email: 'michael@techcorp.com' },
    { id: 3, firstName: 'Emily', lastName: 'Rodriguez', company: 'StartUp Innovations', email: 'emily@startup.io' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // For now using mock data, replace with real API calls:
      // const [invoicesData, clientsData] = await Promise.all([
      //   invoiceAPI.getInvoices(),
      //   clientAPI.getClients()
      // ]);
      setInvoices(mockInvoices);
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOrganizationSettings({
          ...organizationSettings,
          companyLogo: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addInvoiceItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeInvoiceItem = (index) => {
    const items = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items });
    calculateTotals(items);
  };

  const updateInvoiceItem = (index, field, value) => {
    const items = [...newInvoice.items];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    
    setNewInvoice({ ...newInvoice, items });
    calculateTotals(items);
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (newInvoice.taxRate / 100);
    const total = subtotal + tax;
    
    setNewInvoice(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      // Generate invoice number if not provided
      const invoiceNumber = newInvoice.invoiceNumber || `INV-${Date.now()}`;
      
      const invoiceData = {
        ...newInvoice,
        invoiceNumber,
        id: Date.now(), // Mock ID
        clientName: clients.find(c => c.id === parseInt(newInvoice.clientId))?.firstName + ' ' + 
                   clients.find(c => c.id === parseInt(newInvoice.clientId))?.lastName,
        clientCompany: clients.find(c => c.id === parseInt(newInvoice.clientId))?.company
      };
      
      setInvoices([invoiceData, ...invoices]);
      setNewInvoice({
        clientId: '',
        invoiceNumber: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        notes: '',
        terms: 'Payment is due within 30 days',
        subtotal: 0,
        tax: 0,
        taxRate: 0,
        total: 0,
        status: 'draft'
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      // Update invoice status to sent
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'sent' } : inv
      ));
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handlePayInvoice = async (invoice) => {
    try {
      const originUrl = window.location.origin;
      const response = await paymentAPI.createInvoicePayment(invoice.id, originUrl);
      
      if (response.success && response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientCompany.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const InvoicePreview = ({ invoice }) => (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          {organizationSettings.companyLogo && (
            <img 
              src={organizationSettings.companyLogo} 
              alt="Company Logo" 
              className="h-16 w-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organizationSettings.companyName}</h1>
            <div className="text-sm text-gray-600">
              <p>{organizationSettings.address}</p>
              <p>{organizationSettings.city}, {organizationSettings.state} {organizationSettings.zip}</p>
              <p>{organizationSettings.phone} • {organizationSettings.email}</p>
              <p>{organizationSettings.website}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
          <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Client and Invoice Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
          <div className="text-gray-700">
            <p className="font-semibold">{invoice.clientName}</p>
            <p>{invoice.clientCompany}</p>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Invoice Date:</p>
              <p className="text-gray-700">{invoice.issueDate}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Due Date:</p>
              <p className="text-gray-700">{invoice.dueDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 font-semibold">Description</th>
              <th className="text-center py-3 font-semibold">Qty</th>
              <th className="text-right py-3 font-semibold">Rate</th>
              <th className="text-right py-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3">{item.description}</td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">${item.rate.toFixed(2)}</td>
                <td className="text-right py-3">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax:</span>
            <span>${invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(newInvoice.notes || newInvoice.terms) && (
        <div className="border-t pt-6">
          {newInvoice.notes && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Notes:</h4>
              <p className="text-gray-700">{newInvoice.notes}</p>
            </div>
          )}
          {newInvoice.terms && (
            <div>
              <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
              <p className="text-gray-700">{newInvoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  // Client-specific view for viewing and paying invoices
  if (user?.role === 'client') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
              <p className="text-gray-600 mt-2">View and pay your invoices from your tax professional</p>
            </div>
          </div>

          {/* Search and Filters for clients */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices by number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Client Invoice List */}
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No invoices match your current filters.'
                      : 'You have no invoices yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-600">
                            From your tax professional
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Due: {invoice.dueDate}
                            </span>
                            <span className="text-sm text-gray-500">
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              ${invoice.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <Button 
                              size="sm"
                              onClick={() => handlePayInvoice(invoice)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Payment Methods Info for Clients */}
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-2">Create and manage client invoices</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setSelectedInvoice('settings')}>
              <Image className="w-4 h-4 mr-2" />
              Branding Settings
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices by number, client, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoice List */}
        {selectedInvoice === 'settings' ? (
          // Organization Settings
          <Card>
            <CardHeader>
              <CardTitle>Invoice Branding Settings</CardTitle>
              <CardDescription>
                Customize your invoice appearance with your company logo and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Logo</label>
                    <div className="flex items-center space-x-4">
                      {organizationSettings.companyLogo ? (
                        <div className="relative">
                          <img 
                            src={organizationSettings.companyLogo} 
                            alt="Company Logo" 
                            className="h-16 w-16 object-contain border rounded"
                          />
                          <button
                            onClick={() => setOrganizationSettings({...organizationSettings, companyLogo: null})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Logo
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Input
                    placeholder="Company Name"
                    value={organizationSettings.companyName}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, companyName: e.target.value})}
                  />
                  
                  <Input
                    placeholder="Address"
                    value={organizationSettings.address}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, address: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="City"
                      value={organizationSettings.city}
                      onChange={(e) => setOrganizationSettings({...organizationSettings, city: e.target.value})}
                    />
                    <Input
                      placeholder="State"
                      value={organizationSettings.state}
                      onChange={(e) => setOrganizationSettings({...organizationSettings, state: e.target.value})}
                    />
                    <Input
                      placeholder="ZIP"
                      value={organizationSettings.zip}
                      onChange={(e) => setOrganizationSettings({...organizationSettings, zip: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Phone"
                    value={organizationSettings.phone}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, phone: e.target.value})}
                  />
                  
                  <Input
                    placeholder="Email"
                    value={organizationSettings.email}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, email: e.target.value})}
                  />
                  
                  <Input
                    placeholder="Website"
                    value={organizationSettings.website}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, website: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={() => setSelectedInvoice(null)}>
                  Save Settings
                </Button>
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No invoices match your current filters.'
                      : 'Create your first invoice to get started.'
                    }
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {invoice.clientName} • {invoice.clientCompany}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Due: {invoice.dueDate}
                            </span>
                            <span className="text-sm text-gray-500">
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              ${invoice.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {invoice.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && user?.role === 'client' && (
                            <Button 
                              size="sm"
                              onClick={() => handlePayInvoice(invoice)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>Create a professional invoice with your company branding</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateInvoice}>
                <CardContent className="space-y-6">
                  {/* Basic Invoice Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client *</label>
                      <Select value={newInvoice.clientId} onValueChange={(value) => setNewInvoice({...newInvoice, clientId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.firstName} {client.lastName} - {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Invoice Number</label>
                      <Input
                        placeholder="Auto-generated if empty"
                        value={newInvoice.invoiceNumber}
                        onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue Date *</label>
                      <Input
                        type="date"
                        value={newInvoice.issueDate}
                        onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Due Date *</label>
                      <Input
                        type="date"
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={newInvoice.taxRate}
                        onChange={(e) => {
                          const taxRate = parseFloat(e.target.value) || 0;
                          setNewInvoice({...newInvoice, taxRate});
                          calculateTotals(newInvoice.items);
                        }}
                      />
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Invoice Items</h3>
                      <Button type="button" variant="outline" onClick={addInvoiceItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {newInvoice.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5">
                            <Input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Rate"
                              value={item.rate}
                              onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <div className="text-right font-medium">
                              ${item.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-span-1">
                            {newInvoice.items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInvoiceItem(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 border-t pt-4">
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${newInvoice.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax ({newInvoice.taxRate}%):</span>
                            <span>${newInvoice.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${newInvoice.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <Textarea
                        placeholder="Additional notes for the client"
                        value={newInvoice.notes}
                        onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                      <Textarea
                        placeholder="Payment terms and conditions"
                        value={newInvoice.terms}
                        onChange={(e) => setNewInvoice({...newInvoice, terms: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <div className="flex justify-end space-x-2 p-6 pt-0">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Invoice
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedInvoices;