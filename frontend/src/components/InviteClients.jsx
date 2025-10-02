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
    client_email: '',
    client_first_name: '',
    client_last_name: '',
    personal_message: 'I\'d like to invite you to use our secure client portal for managing your tax documents and communications.',
    provider: 'sendgrid'
  });
  const [invitations, setInvitations] = useState([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load invitations on component mount
  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await emailAPI.getInvitations();
      setInvitations(data.invitations || []);
    } catch (err) {
      setError('Failed to load invitations');
      console.error('Error loading invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await emailAPI.sendClientInvitation(inviteForm);
      
      setSuccessMessage(`Invitation sent successfully to ${inviteForm.client_email}!`);
      
      // Reset form (keep message and provider)
      setInviteForm({
        ...inviteForm,
        client_email: '',
        client_first_name: '',
        client_last_name: ''
      });
      
      // Reload invitations to show the new one
      await loadInvitations();
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send invitation. Please try again.');
      console.error('Error sending invitation:', err);
    } finally {
      setIsInviting(false);
    }
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

  const resendInvitation = async (inviteId) => {
    try {
      setError(null);
      await emailAPI.resendInvitation(inviteId);
      setSuccessMessage('Invitation resent successfully!');
      await loadInvitations(); // Reload to get updated data
    } catch (err) {
      setError('Failed to resend invitation. Please try again.');
      console.error('Error resending invitation:', err);
    }
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
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-700 text-sm">{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        required
                        value={inviteForm.client_first_name}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, client_first_name: e.target.value }))}
                        placeholder="John"
                        disabled={isInviting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        required
                        value={inviteForm.client_last_name}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, client_last_name: e.target.value }))}
                        placeholder="Doe"
                        disabled={isInviting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      required
                      value={inviteForm.client_email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, client_email: e.target.value }))}
                      placeholder="john.doe@example.com"
                      disabled={isInviting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Provider</label>
                    <Select
                      value={inviteForm.provider}
                      onValueChange={(value) => setInviteForm(prev => ({ ...prev, provider: value }))}
                      disabled={isInviting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sendgrid">SendGrid (Reliable)</SelectItem>
                        <SelectItem value="gmail">Gmail (Development)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Personal Message</label>
                    <Textarea
                      value={inviteForm.personal_message}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, personal_message: e.target.value }))}
                      placeholder="Add a personal message to your invitation..."
                      className="min-h-[100px]"
                      disabled={isInviting}
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