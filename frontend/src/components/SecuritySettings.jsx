import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import SimpleNavbar from './SimpleNavbar';
import { 
  Shield, 
  ShieldCheck,
  ShieldX,
  Smartphone,
  QrCode,
  Key,
  Copy,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/security/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTwoFAEnabled(data.enabled);
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/security/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          app_name: 'TaxPortal Pro'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setBackupCodes(data.backup_codes);
        setShowSetup2FA(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to setup 2FA');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/security/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          token: verificationToken
        })
      });

      if (response.ok) {
        setSuccess('Two-Factor Authentication enabled successfully!');
        setTwoFAEnabled(true);
        setShowSetup2FA(false);
        setVerificationToken('');
        setQrCode('');
        setSecret('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/security/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setSuccess('Two-Factor Authentication disabled');
        setTwoFAEnabled(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and authentication methods</p>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Two-Factor Authentication Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Two-Factor Authentication (2FA)
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by requiring a code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {twoFAEnabled ? (
                  <>
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Two-Factor Authentication is enabled</p>
                      <p className="text-sm text-green-600">Your account is protected with 2FA</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </>
                ) : (
                  <>
                    <ShieldX className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Two-Factor Authentication is disabled</p>
                      <p className="text-sm text-red-600">Enable 2FA to secure your account</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                  </>
                )}
              </div>
              
              <div className="flex space-x-2">
                {twoFAEnabled ? (
                  <Button 
                    variant="outline" 
                    onClick={disable2FA}
                    disabled={loading}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Disable 2FA
                  </Button>
                ) : (
                  <Button 
                    onClick={setup2FA}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2FA Setup Modal */}
        {showSetup2FA && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Setup Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Scan the QR code with your authenticator app and enter the verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <h3 className="font-medium mb-4">1. Scan QR Code</h3>
                  {qrCode && (
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this code with Google Authenticator, Authy, or any TOTP app
                  </p>
                </div>

                {/* Manual Setup */}
                <div>
                  <h3 className="font-medium mb-2">2. Or enter manually</h3>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                      value={secret}
                      readOnly
                      type={showSecret ? 'text' : 'password'}
                      className="flex-1 bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Verification */}
                <div>
                  <h3 className="font-medium mb-2">3. Enter verification code</h3>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="6-digit code"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button onClick={verify2FA} disabled={loading}>
                      Verify
                    </Button>
                  </div>
                </div>

                {/* Backup Codes */}
                {backupCodes.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">4. Save backup codes</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 mb-3">
                        Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="bg-white p-2 rounded border text-center">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <div className="flex justify-end space-x-2 p-6 pt-0">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSetup2FA(false);
                    setError('');
                    setQrCode('');
                    setSecret('');
                    setVerificationToken('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Security Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-blue-700">
                    Protect your account with an additional security layer that prevents unauthorized access even if your password is compromised.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Use a Strong Password</h4>
                  <p className="text-sm text-green-700">
                    Create a unique, complex password that includes uppercase and lowercase letters, numbers, and special characters.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <QrCode className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Keep Backup Codes Safe</h4>
                  <p className="text-sm text-purple-700">
                    Store your backup codes in a secure location separate from your authenticator device for account recovery.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;