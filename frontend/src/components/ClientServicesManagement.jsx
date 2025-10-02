import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import SimpleNavbar from './SimpleNavbar';
import { 
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  Users,
  Eye,
  Copy,
  Settings,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';

const ClientServicesManagement = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: 'tax_preparation',
    price: '',
    duration: '',
    features: [''],
    isActive: true
  });

  // Mock data for demonstration
  const mockServices = [
    {
      id: 1,
      name: 'Individual Tax Preparation',
      description: 'Complete individual tax return preparation including all necessary forms and schedules',
      category: 'tax_preparation',
      price: 350.00,
      duration: '2-3 business days',
      features: [
        'Form 1040 preparation',
        'Standard and itemized deductions',
        'Electronic filing included',
        'Basic tax consultation'
      ],
      isActive: true,
      clientsServed: 45,
      totalRevenue: 15750.00,
      averageRating: 4.8
    },
    {
      id: 2,
      name: 'Business Tax Filing',
      description: 'Comprehensive business tax preparation for LLCs, S-Corps, and C-Corps',
      category: 'business_tax',
      price: 750.00,
      duration: '5-7 business days',
      features: [
        'All business tax forms',
        'Quarterly tax planning',
        'Business deduction optimization',
        'Financial statement preparation',
        'Consultation included'
      ],
      isActive: true,
      clientsServed: 23,
      totalRevenue: 17250.00,
      averageRating: 4.9
    },
    {
      id: 3,
      name: 'Monthly Bookkeeping',
      description: 'Monthly bookkeeping services including transaction categorization and reconciliation',
      category: 'bookkeeping',
      price: 150.00,
      duration: 'Monthly service',
      features: [
        'Transaction categorization',
        'Bank reconciliation',
        'Monthly financial statements',
        'QuickBooks setup and maintenance'
      ],
      isActive: true,
      clientsServed: 12,
      totalRevenue: 1800.00,
      averageRating: 4.7
    }
  ];

  const serviceCategories = [
    { value: 'tax_preparation', label: 'Tax Preparation' },
    { value: 'business_tax', label: 'Business Tax' },
    { value: 'bookkeeping', label: 'Bookkeeping' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'planning', label: 'Tax Planning' },
    { value: 'audit_support', label: 'Audit Support' },
    { value: 'payroll', label: 'Payroll Services' }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // For now using mock data, replace with real API call:
      // const data = await clientServicesAPI.getServices();
      setServices(mockServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...newService,
        id: Date.now(),
        price: parseFloat(newService.price),
        clientsServed: 0,
        totalRevenue: 0.00,
        averageRating: 0,
        features: newService.features.filter(f => f.trim() !== '')
      };
      
      setServices([serviceData, ...services]);
      setNewService({
        name: '',
        description: '',
        category: 'tax_preparation',
        price: '',
        duration: '',
        features: [''],
        isActive: true
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({
      ...service,
      price: service.price.toString(),
      features: [...service.features, ''] // Add empty field for editing
    });
    setShowCreateModal(true);
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const toggleServiceStatus = (serviceId) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const addFeature = () => {
    setNewService({
      ...newService,
      features: [...newService.features, '']
    });
  };

  const removeFeature = (index) => {
    const features = newService.features.filter((_, i) => i !== index);
    setNewService({ ...newService, features });
  };

  const updateFeature = (index, value) => {
    const features = [...newService.features];
    features[index] = value;
    setNewService({ ...newService, features });
  };

  const getCategoryLabel = (category) => {
    return serviceCategories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      tax_preparation: 'bg-blue-100 text-blue-800',
      business_tax: 'bg-green-100 text-green-800',
      bookkeeping: 'bg-purple-100 text-purple-800',
      consultation: 'bg-orange-100 text-orange-800',
      planning: 'bg-indigo-100 text-indigo-800',
      audit_support: 'bg-red-100 text-red-800',
      payroll: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Services</h1>
            <p className="text-gray-600 mt-2">Create and manage the services you offer to your clients</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Button>
        </div>

        {/* Services Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold">{services.filter(s => s.isActive).length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients Served</p>
                  <p className="text-2xl font-bold">{services.reduce((sum, s) => sum + s.clientsServed, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${services.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No services created yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first service package to start offering services to your clients.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                        <Badge className={getCategoryColor(service.category)}>
                          {getCategoryLabel(service.category)}
                        </Badge>
                        <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Price</p>
                          <p className="text-lg font-semibold text-green-600">${service.price}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-sm text-gray-900">{service.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Clients Served</p>
                          <p className="text-sm text-gray-900">{service.clientsServed}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Revenue</p>
                          <p className="text-sm text-gray-900">${service.totalRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleServiceStatus(service.id)}
                      >
                        {service.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <Settings className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(window.location.origin + '/services/' + service.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Service Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingService ? 'Edit Service' : 'Create New Service'}</CardTitle>
                <CardDescription>
                  {editingService ? 'Update your service details' : 'Create a new service package for your clients'}
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleCreateService}>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Name *</label>
                      <Input
                        placeholder="e.g., Individual Tax Preparation"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <Select 
                        value={newService.category} 
                        onValueChange={(value) => setNewService({...newService, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <Textarea
                      placeholder="Describe what this service includes..."
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <Input
                        placeholder="e.g., 2-3 business days"
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Features</label>
                    <div className="space-y-3">
                      {newService.features.map((feature, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            placeholder="Enter a feature or benefit"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                          />
                          {newService.features.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFeature(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFeature}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newService.isActive}
                      onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Make this service active and available to clients
                    </label>
                  </div>
                </CardContent>
                
                <div className="flex justify-end space-x-2 p-6 pt-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingService(null);
                      setNewService({
                        name: '',
                        description: '',
                        category: 'tax_preparation',
                        price: '',
                        duration: '',
                        features: [''],
                        isActive: true
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Update Service' : 'Create Service'}
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

export default ClientServicesManagement;