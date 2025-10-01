import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert } from './ui/alert';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';

const DocumentUpload = ({ clientId, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const documentCategories = [
    { value: 'w2', label: 'W-2 Forms' },
    { value: '1099', label: '1099 Forms' },
    { value: 'receipt', label: 'Receipts' },
    { value: 'bank_statement', label: 'Bank Statements' },
    { value: 'investment', label: 'Investment Documents' },
    { value: 'previous_return', label: 'Previous Tax Returns' },
    { value: 'other', label: 'Other Documents' }
  ];

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setError('');
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setError('');
  }, []);

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!category) {
      setError('Please select a document category');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploadPromises = selectedFiles.map(file => 
        documentAPI.uploadDocument(clientId, category, file)
      );

      await Promise.all(uploadPromises);
      
      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} document(s) uploaded successfully`,
      });

      setSelectedFiles([]);
      setCategory('');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to upload documents';
      setError(errorMessage);
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Tax Documents
        </CardTitle>
        <CardDescription>
          Upload your tax documents securely. Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {/* Document Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Category</label>
          <Select value={category} onValueChange={setCategory} disabled={isUploading}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Drop Zone */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Maximum file size: 10MB per file
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload').click()}
            disabled={isUploading}
          >
            Select Files
          </Button>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Selected Files:</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0 || !category}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Upload {selectedFiles.length} Document{selectedFiles.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;