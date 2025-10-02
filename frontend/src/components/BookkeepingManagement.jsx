import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import SimpleNavbar from './SimpleNavbar';
import { 
  Calculator, 
  Plus, 
  Search,
  Filter,
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  Timer,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  PieChart
} from 'lucide-react';

const BookkeepingManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateService, setShowCreateService] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTimeEntry, setShowTimeEntry] = useState(false);

  const [newService, setNewService] = useState({
    client_id: '',
    service_type: 'monthly_bookkeeping',
    frequency: 'monthly',
    service_name: '',
    description: '',
    monthly_fee: '',
    hourly_rate: '',
    estimated_hours: '',
    start_date: new Date().toISOString().split('T')[0],
    auto_invoice: true,
    include_reports: true,
    client_access_level: 'view_only',
    notes: ''
  });

  const [newTask, setNewTask] = useState({
    service_id: '',
    task_name: '',
    description: '',
    task_type: 'monthly_bookkeeping',
    priority: 'medium',
    estimated_hours: '',
    due_date: '',
    notes: ''
  });

  const [newTimeEntry, setNewTimeEntry] = useState({
    service_id: '',
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    notes: '',
    billable: true,
    hourly_rate: ''
  });

  const serviceTypes = [
    { value: 'monthly_bookkeeping', label: 'Monthly Bookkeeping' },
    { value: 'quarterly_bookkeeping', label: 'Quarterly Bookkeeping' },
    { value: 'payroll_processing', label: 'Payroll Processing' },
    { value: 'accounts_payable', label: 'Accounts Payable' },
    { value: 'accounts_receivable', label: 'Accounts Receivable' },
    { value: 'financial_reporting', label: 'Financial Reporting' },
    { value: 'bank_reconciliation', label: 'Bank Reconciliation' },
    { value: 'tax_preparation', label: 'Tax Preparation' },
    { value: 'audit_preparation', label: 'Audit Preparation' }
  ];

  const mockClients = [
    { id: '1', name: 'Sarah Johnson', company: 'Johnson Consulting LLC' },
    { id: '2', name: 'Michael Chen', company: 'TechCorp Industries' },
    { id: '3', name: 'Emily Rodriguez', company: 'StartUp Innovations' }
  ];

  const mockServices = [
    {
      id: '1',
      client_id: '1',
      client_name: 'Sarah Johnson',
      service_name: 'Monthly Bookkeeping',
      service_type: 'monthly_bookkeeping',
      frequency: 'monthly',
      status: 'in_progress',
      monthly_fee: 300,
      start_date: '2024-01-01',
      next_due_date: '2024-03-01'
    },
    {
      id: '2', 
      client_id: '2',
      client_name: 'Michael Chen',
      service_name: 'Quarterly Financial Reports',
      service_type: 'financial_reporting',
      frequency: 'quarterly',
      status: 'pending',
      monthly_fee: 500,
      start_date: '2024-02-01',
      next_due_date: '2024-03-15'
    }
  ];

  const mockTasks = [
    {
      id: '1',
      service_id: '1',
      client_name: 'Sarah Johnson',
      task_name: 'February Bank Reconciliation',
      task_type: 'bank_reconciliation',
      status: 'pending',
      priority: 'high',
      due_date: '2024-03-05',
      estimated_hours: 3
    },
    {
      id: '2',
      service_id: '2', 
      client_name: 'Michael Chen',
      task_name: 'Q1 Profit & Loss Report',
      task_type: 'financial_reporting',
      status: 'in_progress',
      priority: 'medium',
      due_date: '2024-03-15',
      estimated_hours: 5
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with real API calls
      setServices(mockServices);
      setTasks(mockTasks);
      setDashboardStats({
        total_services: 15,
        active_services: 12,
        pending_tasks: 8,
        overdue_tasks: 2,
        total_hours_this_month: 45.5,
        total_revenue_this_month: 4250
      });
    } catch (error) {
      console.error('Error loading bookkeeping data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      // Mock implementation - replace with real API call
      const serviceData = {
        id: Date.now().toString(),
        ...newService,
        client_name: mockClients.find(c => c.id === newService.client_id)?.name || 'Unknown Client',
        status: 'pending'
      };
      
      setServices([serviceData, ...services]);
      setNewService({
        client_id: '',
        service_type: 'monthly_bookkeeping',
        frequency: 'monthly',
        service_name: '',
        description: '',
        monthly_fee: '',
        hourly_rate: '',
        estimated_hours: '',
        start_date: new Date().toISOString().split('T')[0],
        auto_invoice: true,
        include_reports: true,
        client_access_level: 'view_only',
        notes: ''
      });
      setShowCreateService(false);
      alert('Bookkeeping service created successfully!');
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.active_services}</p>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pending_tasks}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours This Month</p>
                <p className="text-2xl font-bold text-green-600">{dashboardStats.total_hours_this_month}</p>
              </div>
              <Timer className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${dashboardStats.total_revenue_this_month?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{task.task_name}</p>
                    <p className="text-xs text-gray-500">{task.client_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">{task.due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{service.service_name}</p>
                    <p className="text-xs text-gray-500">{service.client_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(service.status)}>
                      {service.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">${service.monthly_fee}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ServicesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bookkeeping Services</h2>
        <Button onClick={() => setShowCreateService(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Service
        </Button>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{service.service_name}</h3>
                    <p className="text-sm text-gray-600">{service.client_name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {service.frequency}
                      </span>
                      <span className="text-sm text-gray-500">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        ${service.monthly_fee}/month
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TasksView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bookkeeping Tasks</h2>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{task.task_name}</h3>
                    <p className="text-sm text-gray-600">{task.client_name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Due: {task.due_date}
                      </span>
                      <span className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {task.estimated_hours}h estimated
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TimeTrackingView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Time Tracking</h2>
        <Button onClick={() => setShowTimeEntry(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Time
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Time Entries Yet</h3>
            <p className="text-gray-600 mb-6">Start logging your time to track billable hours</p>
            <Button onClick={() => setShowTimeEntry(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookkeeping data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookkeeping Management</h1>
          <p className="text-gray-600">Manage bookkeeping services, tasks, and time tracking</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'services', name: 'Services', icon: Calculator },
              { id: 'tasks', name: 'Tasks', icon: CheckCircle },
              { id: 'time', name: 'Time Tracking', icon: Timer }
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
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'time' && <TimeTrackingView />}
        </div>

        {/* Create Service Modal */}
        {showCreateService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create Bookkeeping Service</CardTitle>
                <CardDescription>Set up a new bookkeeping service for a client</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateService}>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client</label>
                      <Select value={newService.client_id} onValueChange={(value) => setNewService({...newService, client_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Type</label>
                      <Select value={newService.service_type} onValueChange={(value) => setNewService({...newService, service_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Service Name</label>
                    <Input
                      placeholder="e.g., Monthly Bookkeeping for ABC Corp"
                      value={newService.service_name}
                      onChange={(e) => setNewService({...newService, service_name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Describe the bookkeeping services included..."
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Frequency</label>
                      <Select value={newService.frequency} onValueChange={(value) => setNewService({...newService, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Fee</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newService.monthly_fee}
                        onChange={(e) => setNewService({...newService, monthly_fee: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newService.hourly_rate}
                        onChange={(e) => setNewService({...newService, hourly_rate: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-end space-x-2 p-6 pt-0">
                  <Button type="button" variant="outline" onClick={() => setShowCreateService(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Service
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

export default BookkeepingManagement;