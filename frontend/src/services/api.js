import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;
const API_BASE = `${BACKEND_URL}/api`;

// Debug logging for development
console.log('Backend URL configured as:', BACKEND_URL);
console.log('API Base URL:', API_BASE);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Client API
export const clientAPI = {
  getClients: async (params = {}) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },
  
  getClient: async (clientId) => {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  },
  
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  updateClient: async (clientId, updateData) => {
    const response = await api.put(`/clients/${clientId}`, updateData);
    return response.data;
  },
  
  deleteClient: async (clientId) => {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  }
};

// Document API
export const documentAPI = {
  uploadDocument: async (clientId, category, file, description = null) => {
    const formData = new FormData();
    formData.append('client_id', clientId);
    formData.append('category', category);
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getClientDocuments: async (clientId, category = null) => {
    const params = category ? { category } : {};
    const response = await api.get(`/documents/${clientId}`, { params });
    return response.data;
  },
  
  downloadDocument: async (documentId) => {
    const response = await api.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    });
    return response;
  },
  
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  }
};

// Task API
export const taskAPI = {
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  getClientTasks: async (clientId, params = {}) => {
    const response = await api.get(`/tasks/${clientId}`, { params });
    return response.data;
  },
  
  getTask: async (taskId) => {
    const response = await api.get(`/tasks/task/${taskId}`);
    return response.data;
  },
  
  updateTask: async (taskId, updateData) => {
    const response = await api.put(`/tasks/${taskId}`, updateData);
    return response.data;
  },
  
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }
};

// Message API
export const messageAPI = {
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  
  getClientMessages: async (clientId, params = {}) => {
    const response = await api.get(`/messages/${clientId}`, { params });
    return response.data;
  },
  
  markMessageRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
  
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }
};

// Invoice API
export const invoiceAPI = {
  createInvoice: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },
  
  getClientInvoices: async (clientId, params = {}) => {
    const response = await api.get(`/invoices/${clientId}`, { params });
    return response.data;
  },
  
  getInvoice: async (invoiceId) => {
    const response = await api.get(`/invoices/invoice/${invoiceId}`);
    return response.data;
  },
  
  updateInvoice: async (invoiceId, updateData) => {
    const response = await api.put(`/invoices/${invoiceId}`, updateData);
    return response.data;
  },
  
  payInvoice: async (invoiceId) => {
    const response = await api.post(`/invoices/${invoiceId}/pay`);
    return response.data;
  },
  
  deleteInvoice: async (invoiceId) => {
    const response = await api.delete(`/invoices/${invoiceId}`);
    return response.data;
  }
};

// Email API
export const emailAPI = {
  sendClientInvitation: async (invitationData) => {
    const response = await api.post('/emails/send-client-invitation', invitationData);
    return response.data;
  },
  
  sendTestEmail: async (emailData) => {
    const response = await api.post('/emails/send-test-email', emailData);
    return response.data;
  },
  
  sendNotification: async (notificationData) => {
    const response = await api.post('/emails/send-notification', notificationData);
    return response.data;
  },
  
  getInvitations: async () => {
    const response = await api.get('/emails/invitations');
    return response.data;
  },
  
  resendInvitation: async (invitationId) => {
    const response = await api.post(`/emails/resend-invitation/${invitationId}`);
    return response.data;
  }
};

// Payment API
export const paymentAPI = {
  createInvoicePayment: async (invoiceId, originUrl) => {
    const response = await api.post('/payments/invoice/checkout', {
      invoice_id: invoiceId,
      origin_url: originUrl
    });
    return response.data;
  },
  
  createServicePayment: async (servicePackage, originUrl, metadata = null) => {
    const response = await api.post('/payments/service/checkout', {
      service_package: servicePackage,
      origin_url: originUrl,
      metadata: metadata
    });
    return response.data;
  },
  
  getPaymentStatus: async (sessionId) => {
    const response = await api.get(`/payments/status/${sessionId}`);
    return response.data;
  },
  
  getUserTransactions: async () => {
    const response = await api.get('/payments/transactions');
    return response.data;
  },
  
  getServicePackages: async () => {
    const response = await api.get('/payments/services/packages');
    return response.data;
  }
};

// Utility functions
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};

export default api;