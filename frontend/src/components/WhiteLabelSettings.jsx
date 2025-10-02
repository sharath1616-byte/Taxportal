import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import SimpleNavbar from './SimpleNavbar';
import { 
  Palette, 
  Upload, 
  Eye,
  Save,
  RefreshCw,
  Settings,
  Crown,
  Sparkles,
  Image,
  Type,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const WhiteLabelSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isWhiteLabelEnabled, setIsWhiteLabelEnabled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop');

  const [branding, setBranding] = useState({
    companyName: 'TaxPortal Pro',
    logo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#06b6d4',
    backgroundColor: '#f8fafc',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    customCSS: '',
    footerText: '© 2024 TaxPortal Pro. All rights reserved.',
    supportEmail: 'support@taxpro.com',
    customDomain: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  const colorPresets = [
    { name: 'Default Blue', primary: '#3b82f6', secondary: '#1e40af', accent: '#06b6d4' },
    { name: 'Professional Green', primary: '#059669', secondary: '#047857', accent: '#10b981' },
    { name: 'Corporate Gray', primary: '#6b7280', secondary: '#4b5563', accent: '#9ca3af' },
    { name: 'Modern Purple', primary: '#7c3aed', secondary: '#5b21b6', accent: '#8b5cf6' },
    { name: 'Warm Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c' },
    { name: 'Deep Red', primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' }
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito', 'Poppins'
  ];

  useEffect(() => {
    loadWhiteLabelSettings();
  }, []);

  const loadWhiteLabelSettings = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user has white label subscription
      setIsWhiteLabelEnabled(user?.subscription?.includes('white_label') || false);
      
      // Load existing settings if any
      const savedSettings = localStorage.getItem('whiteLabelSettings');
      if (savedSettings) {
        setBranding({ ...branding, ...JSON.parse(savedSettings) });
      }
    } catch (err) {
      setError('Failed to load white label settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBranding(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorPreset = (preset) => {
    setBranding(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      
      if (type === 'logo') {
        setLogoFile(file);
        setBranding(prev => ({ ...prev, logo: dataURL }));
      } else if (type === 'favicon') {
        setFaviconFile(file);
        setBranding(prev => ({ ...prev, favicon: dataURL }));
      }
    };
    
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    if (!isWhiteLabelEnabled) {
      setError('White label features require a premium subscription');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage for demo
      localStorage.setItem('whiteLabelSettings', JSON.stringify(branding));
      
      setSuccess('White label settings saved successfully!');
      
      // Apply theme to preview
      applyThemePreview();
      
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setBranding({
      companyName: 'TaxPortal Pro',
      logo: '',
      favicon: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#06b6d4',
      backgroundColor: '#f8fafc',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      customCSS: '',
      footerText: '© 2024 TaxPortal Pro. All rights reserved.',
      supportEmail: 'support@taxpro.com',
      customDomain: ''
    });
    setLogoFile(null);
    setFaviconFile(null);
  };

  const applyThemePreview = () => {
    // Apply CSS variables for live preview
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
    root.style.setProperty('--accent-color', branding.accentColor);
    root.style.setProperty('--background-color', branding.backgroundColor);
    root.style.setProperty('--text-color', branding.textColor);
  };

  const upgradeToWhiteLabel = () => {
    // Redirect to subscription upgrade
    alert('Redirecting to subscription upgrade...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Palette className="w-8 h-8 mr-3" />
            White Label Branding
          </h1>
          <p className="text-gray-600">Customize the appearance and branding of your portal</p>
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

        {/* White Label Status */}
        {!isWhiteLabelEnabled && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <Crown className="w-5 h-5 mr-2" />
                Premium Feature
              </CardTitle>
              <CardDescription className="text-orange-700">
                White label branding is available with premium subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-800 mb-2">Unlock white label features to:</p>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Custom logo and branding</li>
                    <li>• Custom color schemes</li>
                    <li>• Custom domain support</li>
                    <li>• Remove "Powered by TaxPortal Pro" branding</li>
                  </ul>
                </div>
                <Button onClick={upgradeToWhiteLabel} className="bg-orange-600 hover:bg-orange-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Basic Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <Input
                    value={branding.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    disabled={!isWhiteLabelEnabled}
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input
                    type="email"
                    value={branding.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    disabled={!isWhiteLabelEnabled}
                    placeholder="support@yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custom Domain</label>
                  <Input
                    value={branding.customDomain}
                    onChange={(e) => handleInputChange('customDomain', e.target.value)}
                    disabled={!isWhiteLabelEnabled}
                    placeholder="portal.yourcompany.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo & Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Logo & Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Logo</label>
                  <div className="flex items-center space-x-4">
                    {branding.logo && (
                      <img 
                        src={branding.logo} 
                        alt="Logo preview" 
                        className="w-16 h-16 object-contain border rounded-lg bg-white p-2"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        disabled={!isWhiteLabelEnabled}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button 
                          variant="outline" 
                          disabled={!isWhiteLabelEnabled}
                          className="cursor-pointer"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. Recommended: 200x50px</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Favicon</label>
                  <div className="flex items-center space-x-4">
                    {branding.favicon && (
                      <img 
                        src={branding.favicon} 
                        alt="Favicon preview" 
                        className="w-8 h-8 object-contain border rounded bg-white p-1"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'favicon')}
                        disabled={!isWhiteLabelEnabled}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <label htmlFor="favicon-upload">
                        <Button 
                          variant="outline" 
                          disabled={!isWhiteLabelEnabled}
                          className="cursor-pointer"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Favicon
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">ICO, PNG up to 1MB. Recommended: 32x32px</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Scheme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Color Scheme
                </CardTitle>
                <CardDescription>
                  Customize colors to match your brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">Color Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorPreset(preset)}
                        disabled={!isWhiteLabelEnabled}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                      >
                        <div className="flex space-x-1">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.primary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.secondary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.accent }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="w-12 h-10 border rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="w-12 h-10 border rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Accent Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={branding.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="w-12 h-10 border rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Input
                        value={branding.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={branding.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="w-12 h-10 border rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Input
                        value={branding.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        disabled={!isWhiteLabelEnabled}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <Select 
                    value={branding.fontFamily} 
                    onValueChange={(value) => handleInputChange('fontFamily', value)}
                    disabled={!isWhiteLabelEnabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={branding.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      disabled={!isWhiteLabelEnabled}
                      className="w-12 h-10 border rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Input
                      value={branding.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      disabled={!isWhiteLabelEnabled}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Footer Text</label>
                  <Input
                    value={branding.footerText}
                    onChange={(e) => handleInputChange('footerText', e.target.value)}
                    disabled={!isWhiteLabelEnabled}
                    placeholder="© 2024 Your Company. All rights reserved."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custom CSS</label>
                  <Textarea
                    value={branding.customCSS}
                    onChange={(e) => handleInputChange('customCSS', e.target.value)}
                    disabled={!isWhiteLabelEnabled}
                    placeholder="/* Add custom CSS here */"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add custom CSS to further customize your portal's appearance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Preview
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant={previewMode === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('desktop')}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewMode === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('tablet')}
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewMode === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('mobile')}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`
                      border rounded-lg overflow-hidden transition-all duration-300
                      ${previewMode === 'desktop' ? 'w-full h-96' : ''}
                      ${previewMode === 'tablet' ? 'w-80 h-80 mx-auto' : ''}
                      ${previewMode === 'mobile' ? 'w-64 h-96 mx-auto' : ''}
                    `}
                  >
                    <div 
                      className="h-full overflow-auto"
                      style={{
                        backgroundColor: branding.backgroundColor,
                        color: branding.textColor,
                        fontFamily: branding.fontFamily
                      }}
                    >
                      {/* Preview Header */}
                      <div 
                        className="p-4 border-b"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        <div className="flex items-center justify-between">
                          {branding.logo ? (
                            <img src={branding.logo} alt="Logo" className="h-8 object-contain" />
                          ) : (
                            <div className="text-white font-bold">{branding.companyName}</div>
                          )}
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded"></div>
                        </div>
                      </div>

                      {/* Preview Content */}
                      <div className="p-4 space-y-4">
                        <div>
                          <div 
                            className="h-2 rounded mb-2"
                            style={{ backgroundColor: branding.accentColor }}
                          ></div>
                          <div className="h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>

                        <div 
                          className="p-3 rounded"
                          style={{ backgroundColor: branding.secondaryColor, color: 'white' }}
                        >
                          <div className="h-3 bg-white bg-opacity-30 rounded mb-1"></div>
                          <div className="h-3 bg-white bg-opacity-20 rounded w-1/2"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-12 bg-gray-200 rounded"></div>
                          <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      {/* Preview Footer */}
                      <div className="p-2 border-t bg-gray-100 text-xs text-center">
                        {branding.footerText}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={resetToDefaults} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={applyThemePreview} disabled={!isWhiteLabelEnabled || loading}>
              <Eye className="w-4 h-4 mr-2" />
              Apply Preview
            </Button>
            <Button onClick={saveSettings} disabled={!isWhiteLabelEnabled || loading}>
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteLabelSettings;