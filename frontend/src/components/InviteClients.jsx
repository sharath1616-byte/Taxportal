import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import SimpleNavbar from './SimpleNavbar';
import { emailAPI } from '../services/api';
import { 
  UserPlus, 
  Mail, 
  Copy,
  Send,
  Check,
  Clock,
  X,
  AlertCircle,
  Loader
} from 'lucide-react';

const InviteClients = () => {
  const { user } = useAuth();
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    message: 'I\'d like to invite you to use our secure client portal for managing your tax documents and communications.'
  });
  const [invitations, setInvitations] = useState([
    {
      id: 1,
      email: 'john.doe@example.com',
      name: 'John Doe',
      status: 'pending',
      sentDate: '2024-01-15',
      expiresDate: '2024-02-15'
    },
    {
      id: 2,
      email: 'sarah.johnson@example.com', 
      name: 'Sarah Johnson',
      status: 'accepted',
      sentDate: '2024-01-10',
      acceptedDate: '2024-01-12'
    },
    {
      id: 3,
      email: 'mike.wilson@example.com',
      name: 'Mike Wilson', 
      status: 'expired',
      sentDate: '2024-12-15',
      expiresDate: '2024-01-15'
    }
  ]);
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);

    // Mock invitation sending
    setTimeout(() => {
      const newInvitation = {
        id: Date.now(),
        email: inviteForm.email,
        name: `${inviteForm.firstName} ${inviteForm.lastName}`,
        status: 'pending',
        sentDate: new Date().toISOString().split('T')[0],
        expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      setInvitations(prev => [newInvitation, ...prev]);
      setInviteForm({ email: '', firstName: '', lastName: '', message: inviteForm.message });
      setIsInviting(false);
      alert('Invitation sent successfully!');
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const resendInvitation = (inviteId) => {
    setInvitations(prev => 
      prev.map(inv => 
        inv.id === inviteId 
          ? { ...inv, status: 'pending', sentDate: new Date().toISOString().split('T')[0] }
          : inv
      )
    );
    alert('Invitation resent successfully!');
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/accept-invite?token=example-token-123`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite Clients</h1>
          <p className="text-gray-600">
            Send secure invitations to clients to join your portal. No registration required - they'll be guided through the setup process.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Invite Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Send Invitation
                </CardTitle>
                <CardDescription>
                  Invite a new client to your secure portal
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        required
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        required
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Personal Message</label>
                    <Textarea
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Add a personal message to your invitation..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isInviting}
                  >
                    {isInviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={copyInviteLink}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Invite Link
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Or copy a direct link to share manually
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invitations List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sent Invitations ({invitations.length})</CardTitle>
                <CardDescription>
                  Track your client invitations and their status
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No invitations sent yet</p>
                    <p className="text-sm text-gray-400">
                      Use the form to send your first client invitation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            {getStatusIcon(invitation.status)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{invitation.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{invitation.email}</span>
                              <span>Sent: {invitation.sentDate}</span>
                              {invitation.status === 'pending' && (
                                <span>Expires: {invitation.expiresDate}</span>
                              )}
                              {invitation.status === 'accepted' && (
                                <span className="text-green-600">Accepted: {invitation.acceptedDate}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusBadge(invitation.status)}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </Badge>
                          
                          {invitation.status === 'pending' && (
                            <Button variant="ghost" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {(invitation.status === 'expired' || invitation.status === 'pending') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resendInvitation(invitation.id)}
                            >
                              Resend
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Client Invitations Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Send Invitation</h3>
                <p className="text-sm text-gray-600">
                  Enter client details and send a secure invitation email
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Client Receives Email</h3>
                <p className="text-sm text-gray-600">
                  Client gets a personalized invitation with secure setup link
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Instant Access</h3>
                <p className="text-sm text-gray-600">
                  Client creates password and gains immediate portal access
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Security Note:</strong> All invitations expire after 30 days and include two-factor authentication setup for enhanced security.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteClients;