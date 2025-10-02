import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import SimpleNavbar from './SimpleNavbar';
import { 
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Bell,
  FileText,
  Building,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';

const ComplianceTracker = () => {
  const { user } = useAuth();
  const [complianceTasks, setComplianceTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [newTask, setNewTask] = useState({
    clientId: '',
    taskType: 'tax_return',
    formType: '1040',
    entityType: 'individual',
    description: '',
    dueDate: '',
    reminderDays: 30,
    status: 'pending',
    priority: 'medium'
  });

  // Mock data for demonstration
  const mockClients = [
    { id: 1, name: 'Sarah Johnson', company: 'Johnson Consulting LLC', entityType: 'LLC' },
    { id: 2, name: 'Michael Chen', company: 'TechCorp Industries', entityType: 'S-Corp' },
    { id: 3, name: 'Emily Rodriguez', company: 'StartUp Innovations', entityType: 'C-Corp' },
    { id: 4, name: 'Robert Williams', company: 'Williams & Associates', entityType: 'Partnership' }
  ];

  const mockComplianceTasks = [
    {
      id: 1,
      clientId: 1,
      clientName: 'Sarah Johnson',
      taskType: 'tax_return',
      formType: '1120S',
      entityType: 'S-Corp',
      description: 'S-Corporation Tax Return Filing',
      dueDate: '2024-03-15',
      reminderDate: '2024-02-15',
      status: 'pending',
      priority: 'high',
      createdDate: '2024-01-15'
    },
    {
      id: 2,
      clientId: 2,
      taskType: 'sales_tax',
      formType: 'ST-3',
      entityType: 'LLC',
      description: 'Quarterly Sales Tax Return',
      dueDate: '2024-01-31',
      reminderDate: '2024-01-01',
      status: 'completed',
      priority: 'medium',
      createdDate: '2024-01-01',
      completedDate: '2024-01-25'
    },
    {
      id: 3,
      clientId: 3,
      taskType: 'payroll_tax',
      formType: '941',
      entityType: 'C-Corp',
      description: 'Quarterly Payroll Tax Return',
      dueDate: '2024-01-31',
      reminderDate: '2024-01-15',
      status: 'overdue',
      priority: 'high',
      createdDate: '2024-01-01'
    },
    {
      id: 4,
      clientId: 1,
      taskType: 'annual_report',
      formType: 'Annual Report',
      entityType: 'LLC',
      description: 'Annual State Filing',
      dueDate: '2024-04-15',
      reminderDate: '2024-03-15',
      status: 'pending',
      priority: 'low',
      createdDate: '2024-02-01'
    }
  ];

  const formTypes = {
    tax_return: [
      { value: '1040', label: 'Form 1040 (Individual)' },
      { value: '1120', label: 'Form 1120 (C-Corporation)' },
      { value: '1120S', label: 'Form 1120S (S-Corporation)' },
      { value: '1065', label: 'Form 1065 (Partnership)' },
      { value: '1041', label: 'Form 1041 (Estate/Trust)' }
    ],
    sales_tax: [
      { value: 'ST-3', label: 'Sales Tax Return' },
      { value: 'ST-4', label: 'Use Tax Return' },
      { value: 'ST-5', label: 'Resale Certificate' }
    ],
    payroll_tax: [
      { value: '941', label: 'Form 941 (Quarterly)' },
      { value: '940', label: 'Form 940 (Annual FUTA)' },
      { value: 'W-2', label: 'W-2 Forms' },
      { value: 'W-3', label: 'Form W-3' }
    ],
    annual_report: [
      { value: 'Annual Report', label: 'State Annual Report' },
      { value: 'Franchise Tax', label: 'Franchise Tax Report' }
    ],
    other: [
      { value: 'Custom', label: 'Custom Compliance Task' }
    ]
  };

  const entityTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'LLC' },
    { value: 's_corp', label: 'S-Corporation' },
    { value: 'c_corp', label: 'C-Corporation' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'estate_trust', label: 'Estate/Trust' }
  ];

  const taskTypes = [
    { value: 'tax_return', label: 'Tax Return Filing' },
    { value: 'sales_tax', label: 'Sales Tax Compliance' },
    { value: 'payroll_tax', label: 'Payroll Tax Compliance' },
    { value: 'annual_report', label: 'Annual State Filing' },
    { value: 'other', label: 'Other Compliance' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // For now using mock data, replace with real API calls:
      setClients(mockClients);
      setComplianceTasks(mockComplianceTasks);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status, dueDate) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'overdue' || daysUntilDue < 0) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (daysUntilDue <= 7) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        id: Date.now(),
        clientName: clients.find(c => c.id === parseInt(newTask.clientId))?.name || '',
        reminderDate: new Date(new Date(newTask.dueDate).getTime() - (newTask.reminderDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      setComplianceTasks([taskData, ...complianceTasks]);
      setNewTask({
        clientId: '',
        taskType: 'tax_return',
        formType: '1040',
        entityType: 'individual',
        description: '',
        dueDate: '',
        reminderDays: 30,
        status: 'pending',
        priority: 'medium'
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating compliance task:', error);
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setComplianceTasks(complianceTasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
          }
        : task
    ));
  };

  const filteredTasks = complianceTasks.filter(task => {
    const matchesSearch = 
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.formType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesClient = filterClient === 'all' || task.clientId === parseInt(filterClient);
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  // Statistics
  const totalTasks = complianceTasks.length;
  const pendingTasks = complianceTasks.filter(t => t.status === 'pending').length;
  const overdueTasks = complianceTasks.filter(t => t.status === 'overdue' || getDaysUntilDue(t.dueDate) < 0).length;
  const upcomingTasks = complianceTasks.filter(t => {
    const days = getDaysUntilDue(t.dueDate);
    return days >= 0 && days <= 30 && t.status !== 'completed';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Tracker</h1>
            <p className="text-gray-600 mt-2">Track tax returns, sales tax, payroll, and other compliance deadlines</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Compliance Task
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{upcomingTasks}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No compliance tasks found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' || filterClient !== 'all'
                    ? 'No tasks match your current filters.'
                    : 'Create your first compliance task to start tracking deadlines.'
                  }
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Compliance Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const daysUntilDue = getDaysUntilDue(task.dueDate);
              
              return (
                <Card key={task.id} className={`${daysUntilDue < 0 && task.status !== 'completed' ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {getStatusIcon(task.status, task.dueDate)}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{task.description}</h3>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Client:</strong> {task.clientName}</p>
                              <p><strong>Form Type:</strong> {task.formType}</p>
                            </div>
                            <div>
                              <p><strong>Entity Type:</strong> {task.entityType}</p>
                              <p><strong>Task Type:</strong> {taskTypes.find(t => t.value === task.taskType)?.label}</p>
                            </div>
                            <div>
                              <p><strong>Due Date:</strong> {task.dueDate}</p>
                              <p className={`font-medium ${
                                daysUntilDue < 0 ? 'text-red-600' :
                                daysUntilDue <= 7 ? 'text-orange-600' :
                                'text-gray-600'
                              }`}>
                                {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                 daysUntilDue === 0 ? 'Due today' :
                                 `${daysUntilDue} days remaining`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add Compliance Task</CardTitle>
                <CardDescription>Create a new compliance tracking task with due date reminders</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleCreateTask}>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client *</label>
                      <Select 
                        value={newTask.clientId} 
                        onValueChange={(value) => setNewTask({...newTask, clientId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Task Type *</label>
                      <Select 
                        value={newTask.taskType} 
                        onValueChange={(value) => {
                          setNewTask({
                            ...newTask, 
                            taskType: value,
                            formType: formTypes[value]?.[0]?.value || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Form Type *</label>
                      <Select 
                        value={newTask.formType} 
                        onValueChange={(value) => setNewTask({...newTask, formType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select form type" />
                        </SelectTrigger>
                        <SelectContent>
                          {formTypes[newTask.taskType]?.map(form => (
                            <SelectItem key={form.value} value={form.value}>
                              {form.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Entity Type *</label>
                      <Select 
                        value={newTask.entityType} 
                        onValueChange={(value) => setNewTask({...newTask, entityType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {entityTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <Input
                      placeholder="Brief description of the compliance task"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Due Date *</label>
                      <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Reminder (Days Before)</label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={newTask.reminderDays}
                        onChange={(e) => setNewTask({...newTask, reminderDays: parseInt(e.target.value) || 30})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value) => setNewTask({...newTask, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                
                <div className="flex justify-end space-x-2 p-6 pt-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddModal(false);
                      setNewTask({
                        clientId: '',
                        taskType: 'tax_return',
                        formType: '1040',
                        entityType: 'individual',
                        description: '',
                        dueDate: '',
                        reminderDays: 30,
                        status: 'pending',
                        priority: 'medium'
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Task
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

export default ComplianceTracker;