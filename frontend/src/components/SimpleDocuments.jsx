import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Search,
  Filter,
  Plus
} from 'lucide-react';

const SimpleDocuments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  // Mock documents data
  const documents = [
    {
      id: 1,
      name: 'W-2_2024_Johnson.pdf',
      category: 'w2',
      size: '245 KB',
      uploadDate: '2024-01-15',
      uploadedBy: 'Sarah Johnson'
    },
    {
      id: 2,
      name: '1099_Interest_Chase_2024.pdf',
      category: '1099',
      size: '156 KB',
      uploadDate: '2024-01-20',
      uploadedBy: 'Sarah Johnson'
    },
    {
      id: 3,
      name: 'Medical_Receipts_Jan2024.zip',
      category: 'receipt',
      size: '2.1 MB',
      uploadDate: '2024-02-01',
      uploadedBy: 'Sarah Johnson'
    },
    {
      id: 4,
      name: 'Bank_Statement_Dec2023.pdf',
      category: 'bank_statement',
      size: '890 KB',
      uploadDate: '2024-01-10',
      uploadedBy: 'Sarah Johnson'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'w2', label: 'W-2 Forms' },
    { value: '1099', label: '1099 Forms' },
    { value: 'receipt', label: 'Receipts' },
    { value: 'bank_statement', label: 'Bank Statements' },
    { value: 'other', label: 'Other' }
  ];

  const getCategoryBadge = (category) => {
    const colors = {
      w2: 'bg-blue-100 text-blue-800',
      '1099': 'bg-green-100 text-green-800',
      receipt: 'bg-purple-100 text-purple-800',
      bank_statement: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      w2: 'W-2',
      '1099': '1099',
      receipt: 'Receipt',
      bank_statement: 'Bank Statement',
      other: 'Other'
    };
    return labels[category] || 'Other';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setIsUploading(true);
    
    // Mock upload process
    setTimeout(() => {
      alert(`${files.length} file(s) uploaded successfully!`);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">
            {user.role === 'client' 
              ? 'Upload and manage your tax documents securely.' 
              : 'View and manage client documents.'}
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload your tax documents. Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => document.getElementById('file-upload').click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Select Files
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="sm:w-48">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents ({filteredDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterCategory !== 'all' 
                    ? 'No documents match your search criteria.' 
                    : 'No documents uploaded yet.'}
                </p>
                <p className="text-sm text-gray-400">
                  Upload your first document using the form above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{doc.size}</span>
                          <span>Uploaded {doc.uploadDate}</span>
                          <span>by {doc.uploadedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getCategoryBadge(doc.category)}>
                        {getCategoryLabel(doc.category)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {user.role !== 'client' && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
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
  );
};

export default SimpleDocuments;