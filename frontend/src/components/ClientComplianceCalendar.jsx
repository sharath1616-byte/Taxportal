import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  FileText,
  DollarSign,
  Building,
  Eye,
  Download
} from 'lucide-react';

const ClientComplianceCalendar = () => {
  const { user } = useAuth();
  const [complianceTasks, setComplianceTasks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock compliance tasks for the client
  const mockComplianceTasks = [
    {
      id: 1,
      taskType: 'tax_return',
      formType: '1040',
      description: 'Individual Tax Return Filing',
      dueDate: '2024-04-15',
      status: 'pending',
      priority: 'high',
      estimatedCost: 350.00,
      professionalNotes: 'Please gather all W-2s, 1099s, and receipts for deductions'
    },
    {
      id: 2,
      taskType: 'quarterly_estimated',
      formType: '1040ES',
      description: 'Q1 Estimated Tax Payment',
      dueDate: '2024-04-15',
      status: 'pending',
      priority: 'high',
      estimatedCost: 0.00,
      professionalNotes: 'Estimated tax payment of $2,500 due'
    },
    {
      id: 3,
      taskType: 'sales_tax',
      formType: 'ST-3',
      description: 'Q1 Sales Tax Return',
      dueDate: '2024-04-30',
      status: 'pending',
      priority: 'medium',
      estimatedCost: 75.00,
      professionalNotes: 'Monthly sales tax filings for January-March'
    },
    {
      id: 4,
      taskType: 'payroll_tax',
      formType: '941',
      description: 'Q1 Payroll Tax Return',
      dueDate: '2024-04-30',
      status: 'completed',
      priority: 'medium',
      estimatedCost: 150.00,
      professionalNotes: 'Filed on 2024-03-28',
      completedDate: '2024-03-28'
    },
    {
      id: 5,
      taskType: 'quarterly_estimated',
      formType: '1040ES',
      description: 'Q2 Estimated Tax Payment',
      dueDate: '2024-06-17',
      status: 'pending',
      priority: 'medium',
      estimatedCost: 0.00,
      professionalNotes: 'Second quarterly estimated payment'
    }
  ];

  useEffect(() => {
    loadComplianceTasks();
  }, []);

  const loadComplianceTasks = async () => {
    try {
      // For now using mock data, replace with real API call:
      // const data = await complianceAPI.getClientTasks();
      setComplianceTasks(mockComplianceTasks);
    } catch (error) {
      console.error('Error loading compliance tasks:', error);
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

  const getTaskTypeLabel = (taskType) => {
    const types = {
      tax_return: 'Tax Return',
      quarterly_estimated: 'Estimated Tax',
      sales_tax: 'Sales Tax',
      payroll_tax: 'Payroll Tax',
      annual_report: 'Annual Report',
      other: 'Other'
    };
    return types[taskType] || taskType;
  };

  // Filter tasks for current view
  const filteredTasks = complianceTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate.getMonth() === selectedMonth && taskDate.getFullYear() === selectedYear;
  });

  const upcomingTasks = complianceTasks.filter(task => {
    const days = getDaysUntilDue(task.dueDate);
    return days >= 0 && days <= 30 && task.status !== 'completed';
  });

  const overdueTasks = complianceTasks.filter(task => {
    const days = getDaysUntilDue(task.dueDate);
    return days < 0 && task.status !== 'completed';
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Calendar</h1>
          <p className="text-gray-600 mt-2">Track your tax and compliance deadlines</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due This Month</p>
                  <p className="text-2xl font-bold">{filteredTasks.filter(t => t.status !== 'completed').length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming (30 days)</p>
                  <p className="text-2xl font-bold text-yellow-600">{upcomingTasks.length}</p>
                </div>
                <Bell className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estimated Costs</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${upcomingTasks.reduce((sum, t) => sum + t.estimatedCost, 0).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month/Year Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Calendar
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks Alert */}
        {overdueTasks.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Overdue Tasks Require Immediate Attention</h3>
                  <div className="space-y-2">
                    {overdueTasks.map(task => (
                      <p key={task.id} className="text-sm text-red-800">
                        • {task.description} - {Math.abs(getDaysUntilDue(task.dueDate))} days overdue
                      </p>
                    ))}
                  </div>
                  <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                    Contact Tax Professional
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {months[selectedMonth]} {selectedYear} Compliance Tasks
          </h2>
          
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No compliance tasks this month</h3>
                <p className="text-gray-600">
                  No tax or compliance deadlines scheduled for {months[selectedMonth]} {selectedYear}.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const daysUntilDue = getDaysUntilDue(task.dueDate);
              
              return (
                <Card 
                  key={task.id} 
                  className={`${
                    daysUntilDue < 0 && task.status !== 'completed' ? 'border-red-200 bg-red-50' : 
                    daysUntilDue <= 7 && task.status !== 'completed' ? 'border-orange-200 bg-orange-50' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {getStatusIcon(task.status, task.dueDate)}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{task.description}</h3>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <p><strong>Form Type:</strong> {task.formType}</p>
                              <p><strong>Task Type:</strong> {getTaskTypeLabel(task.taskType)}</p>
                            </div>
                            <div>
                              <p><strong>Due Date:</strong> {task.dueDate}</p>
                              <p className={`font-medium ${
                                daysUntilDue < 0 ? 'text-red-600' :
                                daysUntilDue <= 7 ? 'text-orange-600' :
                                'text-gray-600'
                              }`}>
                                {task.status === 'completed' ? 
                                  `Completed: ${task.completedDate}` :
                                  daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                  daysUntilDue === 0 ? 'Due today' :
                                  `${daysUntilDue} days remaining`
                                }
                              </p>
                            </div>
                            <div>
                              <p><strong>Estimated Cost:</strong> ${task.estimatedCost.toFixed(2)}</p>
                              <p><strong>Status:</strong> 
                                <span className={`ml-1 ${
                                  task.status === 'completed' ? 'text-green-600' :
                                  task.status === 'pending' ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`}>
                                  {task.status === 'completed' ? 'Completed' : 'In Progress'}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          {task.professionalNotes && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Professional Notes:</strong> {task.professionalNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {task.status !== 'completed' && task.estimatedCost > 0 && (
                          <Button size="sm">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Pay
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Professional Contact Info */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Building className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Tax Professional</h3>
                <p className="text-gray-600 mb-2">
                  For questions about these compliance requirements or to schedule a consultation, 
                  contact your tax professional.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="sm">
                    View Documents
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientComplianceCalendar;