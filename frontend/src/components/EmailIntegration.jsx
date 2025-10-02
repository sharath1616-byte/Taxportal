import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import SimpleNavbar from './SimpleNavbar';
import { 
  Mail, 
  Settings, 
  Check,
  AlertCircle,
  RefreshCw,
  Zap,
  Shield
} from 'lucide-react';

const EmailIntegration = () => {
  const { user } = useAuth();
  const [emailSettings, setEmailSettings] = useState({
    gmail: { connected: false, email: '', autoSync: false },
    outlook: { connected: true, email: 'john@taxfirm.com', autoSync: true },
    imap: { connected: false, server: '', port: 993, username: '', ssl: true }
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const emailProviders = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      description: 'Connect your Gmail account for seamless email integration',
      features: ['Auto-sync client emails', 'Thread conversations', 'Attachment extraction']
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: '📮', 
      description: 'Connect Outlook/Office 365 for professional email management',
      features: ['Exchange integration', 'Calendar sync', 'Contact management']
    },
    {
      id: 'imap',
      name: 'IMAP/SMTP',
      icon: '⚙️',
      description: 'Connect any email provider using IMAP configuration',
      features: ['Universal compatibility', 'Custom server settings', 'Secure connections']
    }
  ];

  const connectProvider = async (providerId) => {
    setIsConnecting(true);
    
    // Mock connection process
    setTimeout(() => {
      if (providerId === 'gmail') {
        // Simulate OAuth flow
        setEmailSettings(prev => ({
          ...prev,
          gmail: { 
            connected: true, 
            email: 'professional@gmail.com', 
            autoSync: true 
          }
        }));
        alert('Gmail connected successfully!');
      }
      setIsConnecting(false);
    }, 2000);
  };

  const disconnectProvider = (providerId) => {
    setEmailSettings(prev => ({
      ...prev,
      [providerId]: { 
        connected: false, 
        email: '', 
        autoSync: false 
      }
    }));
    alert(`${providerId} disconnected successfully!`);
  };

  const toggleAutoSync = (providerId) => {
    setEmailSettings(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        autoSync: !prev[providerId].autoSync
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Integration</h1>
          <p className="text-gray-600">
            Connect your email accounts to sync client communications automatically and keep everything organized in one place.
          </p>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Sync className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Auto-Sync Emails</h3>
                <p className="text-sm text-gray-600">
                  Automatically sync client emails and organize them by client in your portal
                </p>
              </div>
              
              <div>
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Smart Organization</h3>
                <p className="text-sm text-gray-600">
                  AI-powered categorization of emails, documents, and attachments
                </p>
              </div>
              
              <div>
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-gray-600">
                  Bank-level encryption with OAuth 2.0 authentication for maximum security
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Providers */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {emailProviders.map((provider) => {
            const isConnected = emailSettings[provider.id].connected;
            const settings = emailSettings[provider.id];
            
            return (
              <Card key={provider.id} className={isConnected ? 'ring-2 ring-green-200' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{provider.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {isConnected ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {provider.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connection Status */}
                  {isConnected ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Connected:</strong> {settings.email}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Auto-sync emails</p>
                          <p className="text-xs text-gray-500">Automatically import new emails</p>
                        </div>
                        <Switch
                          checked={settings.autoSync}
                          onCheckedChange={() => toggleAutoSync(provider.id)}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => disconnectProvider(provider.id)}
                          className="flex-1"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {provider.id === 'imap' && (
                        <div className="space-y-3">
                          <Input placeholder="IMAP Server (e.g., imap.gmail.com)" />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Port (993)" />
                            <Input placeholder="Username" />
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => connectProvider(provider.id)}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Connect {provider.name}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Email Rules & Automation */}
        <Card>
          <CardHeader>
            <CardTitle>Email Automation Rules</CardTitle>
            <CardDescription>
              Set up automatic rules for organizing and processing client emails
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Auto-categorize by client email</p>
                  <p className="text-sm text-gray-600">Automatically assign emails to clients based on sender address</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Extract attachments</p>
                  <p className="text-sm text-gray-600">Automatically save email attachments to client document folders</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Send read receipts</p>
                  <p className="text-sm text-gray-600">Notify clients when you've read their emails</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Auto-reply to common questions</p>
                  <p className="text-sm text-gray-600">Set up automated responses for frequently asked questions</p>
                </div>
                <Switch />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Advanced Email Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailIntegration;