import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clientAPI, taskAPI, messageAPI, invoiceAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { 
  FileText, 
  MessageSquare, 
  Receipt, 
  Users,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SimpleDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    documents: 0,
    tasks: 0,
    completedTasks: 0,
    messages: 0,
    unreadMessages: 0,
    invoices: 0,
    paidInvoices: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for now - replace with real API calls
      setStats({
        clients: user.role === 'client' ? 1 : 12,
        documents: user.role === 'client' ? 8 : 156,
        tasks: user.role === 'client' ? 3 : 24,
        completedTasks: user.role === 'client' ? 2 : 18,
        messages: user.role === 'client' ? 5 : 47,
        unreadMessages: user.role === 'client' ? 1 : 8,
        invoices: user.role === 'client' ? 2 : 15,
        paidInvoices: user.role === 'client' ? 1 : 12
      });

      // Mock recent activity
      const activities = [
        { type: 'document', title: 'W-2 Form uploaded', time: '2 hours ago', status: 'new' },
        { type: 'message', title: 'New message from John Doe', time: '4 hours ago', status: 'unread' },
        { type: 'invoice', title: 'Invoice #2024-001 paid', time: '1 day ago', status: 'completed' },
        { type: 'task', title: 'Review tax documents', time: '2 days ago', status: 'pending' }
      ];
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'invoice': return <Receipt className="w-4 h-4" />;
      case 'task': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'unread': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.profile.firstName}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'client' 
              ? "Here's an overview of your tax information and recent activity." 
              : "Here's an overview of your practice and client activity."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.role === 'client' ? 'Active Year' : 'Clients'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
              <p className="text-xs text-muted-foreground">
                {user.role === 'client' ? '2024 tax year' : 'Total active clients'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documents}</div>
              <p className="text-xs text-muted-foreground">Files uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unreadMessages} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidInvoices}/{stats.invoices}</div>
              <p className="text-xs text-muted-foreground">Paid invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === 'client' ? (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Receipt className="w-4 h-4 mr-2" />
                      View Invoices
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Client
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Receipt className="w-4 h-4 mr-2" />
                      Create Invoice
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Task Summary */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Task Summary</CardTitle>
              <CardDescription>
                {user.role === 'client' ? 'Your current tax preparation progress' : 'Overview of client tasks'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {stats.completedTasks} of {stats.tasks} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(stats.completedTasks / stats.tasks) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
                  {stats.completedTasks} completed
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                  {stats.tasks - stats.completedTasks} pending
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;