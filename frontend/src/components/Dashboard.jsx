import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clientAPI, taskAPI, messageAPI, invoiceAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Receipt, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    tasks: 0,
    completedTasks: 0,
    messages: 0,
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
      
      if (user.role === 'client') {
        // For clients, fetch their own data
        const clients = await clientAPI.getClients();
        const myClient = clients[0]; // Assuming client has one relationship
        
        if (myClient) {
          const [tasks, messages, invoices] = await Promise.all([
            taskAPI.getClientTasks(myClient.id),
            messageAPI.getClientMessages(myClient.id),
            invoiceAPI.getClientInvoices(myClient.id)
          ]);
          
          setStats({
            clients: 1,
            tasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            messages: messages.length,
            invoices: invoices.length,
            paidInvoices: invoices.filter(i => i.status === 'paid').length
          });
          
          // Create recent activity from tasks and messages
          const activity = [
            ...tasks.slice(0, 3).map(task => ({
              type: 'task',
              title: task.title,
              status: task.status,
              date: task.createdAt
            })),
            ...messages.slice(0, 3).map(message => ({
              type: 'message',
              title: message.subject || 'New Message',
              status: message.isRead ? 'read' : 'unread',
              date: message.sentAt
            }))
          ];
          
          setRecentActivity(activity.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
        }
      } else if (user.role === 'tax_professional') {
        // For tax professionals, fetch all their clients' data
        const clients = await clientAPI.getClients();
        
        let allTasks = [];
        let allMessages = [];
        let allInvoices = [];
        
        for (const client of clients) {
          const [tasks, messages, invoices] = await Promise.all([
            taskAPI.getClientTasks(client.id),
            messageAPI.getClientMessages(client.id),
            invoiceAPI.getClientInvoices(client.id)
          ]);
          
          allTasks = [...allTasks, ...tasks];
          allMessages = [...allMessages, ...messages];
          allInvoices = [...allInvoices, ...invoices];
        }
        
        setStats({
          clients: clients.length,
          tasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.status === 'completed').length,
          messages: allMessages.length,
          invoices: allInvoices.length,
          paidInvoices: allInvoices.filter(i => i.status === 'paid').length
        });
        
        // Create recent activity
        const activity = [
          ...allTasks.slice(0, 3).map(task => ({
            type: 'task',
            title: task.title,
            status: task.status,
            date: task.createdAt
          })),
          ...allMessages.slice(0, 3).map(message => ({
            type: 'message', 
            title: message.subject || 'New Message',
            status: message.isRead ? 'read' : 'unread',
            date: message.sentAt
          }))
        ];
        
        setRecentActivity(activity.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (type, status) => {
    if (type === 'task') {
      switch (status) {
        case 'completed':
          return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
        case 'in_progress':
          return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
        case 'overdue':
          return <Badge variant="destructive">Overdue</Badge>;
        default:
          return <Badge variant="secondary">Pending</Badge>;
      }
    }
    
    if (type === 'message') {
      return status === 'read' ? 
        <Badge variant="secondary">Read</Badge> : 
        <Badge variant="default" className="bg-blue-100 text-blue-800">Unread</Badge>;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">▲</span> TaxPortal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">
                  {user.profile.firstName} {user.profile.lastName}
                </p>
              </div>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.role === 'client' ? 'Tax Year' : 'Clients'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
              <p className="text-xs text-muted-foreground">
                {user.role === 'client' ? 'Active engagement' : 'Active clients'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}/{stats.tasks}</div>
              <p className="text-xs text-muted-foreground">Completed tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">Total messages</p>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {item.type === 'task' ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.type, item.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;