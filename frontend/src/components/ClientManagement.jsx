import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import SimpleNavbar from './SimpleNavbar';
import { clientAPI, documentAPI, messageAPI, invoiceAPI } from '../services/api';
import { 
  Users, 
  Plus, 
  Search,
  Eye,
  FileText,
  MessageSquare,
  Receipt,
  Settings,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  UserCheck,
  MoreVertical,
  User
} from 'lucide-react';

const ClientManagement = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  // Mock client data with expanded information
  const mockClients = [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Johnson Consulting LLC',
      status: 'active',
      joinDate: '2024-01-15',
      lastActivity: '2024-02-01',
      totalInvoices: 5,
      paidInvoices: 4,
      totalAmount: 2250.00,
      documents: 8,
      messages: 12
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@techcorp.com',
      phone: '+1 (555) 987-6543',
      company: 'TechCorp Industries',
      status: 'active',
      joinDate: '2023-11-20',
      lastActivity: '2024-01-28',
      totalInvoices: 8,
      paidInvoices: 7,
      totalAmount: 4200.00,
      documents: 15,
      messages: 24
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@startup.io',
      phone: '+1 (555) 456-7890',
      company: 'StartUp Innovations',
      status: 'pending',
      joinDate: '2024-02-10',
      lastActivity: '2024-02-10',
      totalInvoices: 1,
      paidInvoices: 0,
      totalAmount: 350.00,
      documents: 2,
      messages: 3
    }
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      // For now, using mock data. Replace with real API call:
      // const data = await clientAPI.getClients();
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      // Mock implementation - replace with real API call
      const newClient = {
        id: Date.now(),
        ...newClientForm,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        totalInvoices: 0,
        paidInvoices: 0,
        totalAmount: 0,
        documents: 0,
        messages: 0
      };
      
      setClients([...clients, newClient]);
      setNewClientForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      });
      setShowAddClient(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ClientOverview = ({ client }) => (
    <div className="space-y-6">
      {/* Client Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{client.totalInvoices}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${client.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold">{client.documents}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{client.messages}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Document uploaded: Tax_Form_2024.pdf</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Invoice INV-2024-003 paid</p>
                <p className="text-xs text-gray-500">5 days ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New message received</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ClientDocuments = ({ client }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Client Documents</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[
              { name: 'Tax_Form_2024.pdf', size: '2.4 MB', date: '2024-02-01', type: 'Tax Documents' },
              { name: 'Receipt_Jan2024.jpg', size: '1.8 MB', date: '2024-01-28', type: 'Receipts' },
              { name: 'Bank_Statement.pdf', size: '3.2 MB', date: '2024-01-25', type: 'Financial' }
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ClientInvoices = ({ client }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Client Invoices</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[
              { number: 'INV-2024-003', amount: 450.00, status: 'paid', date: '2024-02-01' },
              { number: 'INV-2024-002', amount: 275.00, status: 'sent', date: '2024-01-15' },
              { number: 'INV-2024-001', amount: 350.00, status: 'paid', date: '2024-01-01' }
            ].map((invoice, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Receipt className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">{invoice.number}</p>
                    <p className="text-xs text-gray-500">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ClientMessages = ({ client }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Messages & Communications</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[
              { 
                subject: 'Tax document clarification needed', 
                preview: 'Hi, I have a question about the tax document you requested...', 
                date: '2024-02-01', 
                unread: true 
              },
              { 
                subject: 'Invoice payment confirmation', 
                preview: 'Thank you for the invoice. The payment has been processed...', 
                date: '2024-01-28', 
                unread: false 
              },
              { 
                subject: 'Meeting reschedule request', 
                preview: 'I need to reschedule our meeting for next week...', 
                date: '2024-01-25', 
                unread: false 
              }
            ].map((message, idx) => (
              <div key={idx} className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${message.unread ? 'bg-blue-50 border-blue-200' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${message.unread ? 'font-semibold' : ''}`}>
                      {message.subject}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{message.preview}</p>
                    <p className="text-xs text-gray-500 mt-2">{message.date}</p>
                  </div>
                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedClient ? (
          // Client List View
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                <p className="text-gray-600 mt-2">Manage your clients and their information</p>
              </div>
              <Button onClick={() => setShowAddClient(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search clients by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <Card key={client.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedClient(client)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{client.firstName} {client.lastName}</h3>
                          <p className="text-sm text-gray-600">{client.company}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {client.phone}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-blue-600">{client.totalInvoices}</p>
                          <p className="text-xs text-gray-500">Invoices</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-600">{client.documents}</p>
                          <p className="text-xs text-gray-500">Documents</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-purple-600">{client.messages}</p>
                          <p className="text-xs text-gray-500">Messages</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Client Modal */}
            {showAddClient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md m-4">
                  <CardHeader>
                    <CardTitle>Add New Client</CardTitle>
                    <CardDescription>Enter client information to create a new client profile</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleAddClient}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="First Name"
                          value={newClientForm.firstName}
                          onChange={(e) => setNewClientForm({...newClientForm, firstName: e.target.value})}
                          required
                        />
                        <Input
                          placeholder="Last Name"
                          value={newClientForm.lastName}
                          onChange={(e) => setNewClientForm({...newClientForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={newClientForm.email}
                        onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Phone Number"
                        value={newClientForm.phone}
                        onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
                      />
                      <Input
                        placeholder="Company Name"
                        value={newClientForm.company}
                        onChange={(e) => setNewClientForm({...newClientForm, company: e.target.value})}
                      />
                      <Textarea
                        placeholder="Address (Optional)"
                        value={newClientForm.address}
                        onChange={(e) => setNewClientForm({...newClientForm, address: e.target.value})}
                      />
                    </CardContent>
                    <div className="flex justify-end space-x-2 p-6 pt-0">
                      <Button type="button" variant="outline" onClick={() => setShowAddClient(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Add Client
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </>
        ) : (
          // Client Detail View
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setSelectedClient(null)}>
                  ← Back to Clients
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h1>
                  <p className="text-gray-600">{selectedClient.company}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Client
                </Button>
                <Badge className={getStatusColor(selectedClient.status)}>
                  {selectedClient.status}
                </Badge>
              </div>
            </div>

            {/* Client Info Header */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.company}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        Joined: {selectedClient.joinDate}
                      </div>
                      <div className="flex items-center text-sm">
                        <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                        Last Active: {selectedClient.lastActivity}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Financial Summary</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        Total Revenue: ${selectedClient.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm">
                        <Receipt className="w-4 h-4 mr-2 text-gray-400" />
                        Paid: {selectedClient.paidInvoices}/{selectedClient.totalInvoices}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: Eye },
                  { id: 'documents', name: 'Documents', icon: FileText },
                  { id: 'invoices', name: 'Invoices', icon: Receipt },
                  { id: 'messages', name: 'Messages', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && <ClientOverview client={selectedClient} />}
              {activeTab === 'documents' && <ClientDocuments client={selectedClient} />}
              {activeTab === 'invoices' && <ClientInvoices client={selectedClient} />}
              {activeTab === 'messages' && <ClientMessages client={selectedClient} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;