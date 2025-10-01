# TaxPortal Pro - Frontend/Backend Integration Contracts

## API Contracts

### Authentication
- `POST /api/auth/login` - Client login
- `POST /api/auth/register` - Client registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Client Portal
- `GET /api/clients` - Get all clients (for tax professionals)
- `GET /api/clients/:id` - Get specific client details
- `PUT /api/clients/:id` - Update client information
- `POST /api/clients` - Add new client

### Document Management
- `POST /api/documents/upload` - Upload tax documents
- `GET /api/documents/:clientId` - Get client documents
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download document

### Task Management
- `GET /api/tasks/:clientId` - Get client tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Messaging
- `GET /api/messages/:clientId` - Get client messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Invoicing
- `GET /api/invoices/:clientId` - Get client invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/pay` - Process payment

## Mock Data Integration Points

### Frontend Components Using Mock Data:

1. **Hero Section** (`/src/components/Hero.jsx`)
   - Mock: `customerLogos` array
   - Replace with: Real client testimonials and partner logos from database

2. **Navigation Menu** (`/src/components/Navbar.jsx`)
   - Mock: `navigationMenu` object with static menu items
   - Replace with: Dynamic menu based on user role and permissions

3. **Industry Showcase** (`/src/components/IndustryShowcase.jsx`)
   - Mock: `industryShowcase` array with static images
   - Replace with: Service categories and real case studies

4. **Client Portal Section** (`/src/components/ClientPortalSection.jsx`)
   - Mock: `testimonials[0]` static testimonial
   - Replace with: Real client testimonials from database

5. **Integrations Section** (`/src/components/IntegrationsSection.jsx`)
   - Mock: `integrationLogos` and `testimonials[1]`
   - Replace with: Available integrations and real testimonials

6. **Features Grid** (`/src/components/FeaturesGrid.jsx`)
   - Mock: `features` array with static feature data
   - Replace with: Dynamic feature availability based on subscription

## Backend Implementation Plan

### Database Models

1. **User Model**
   ```javascript
   {
     id: String,
     email: String,
     password: String (hashed),
     role: String, // 'client' | 'tax_professional' | 'admin'
     profile: {
       firstName: String,
       lastName: String,
       phone: String,
       company: String
     },
     createdAt: Date,
     updatedAt: Date
   }
   ```

2. **Client Model**
   ```javascript
   {
     id: String,
     userId: String, // Reference to User
     taxProfessionalId: String, // Reference to tax professional
     taxYear: Number,
     status: String, // 'pending' | 'in_progress' | 'completed'
     documents: [DocumentReference],
     tasks: [TaskReference],
     invoices: [InvoiceReference],
     createdAt: Date,
     updatedAt: Date
   }
   ```

3. **Document Model**
   ```javascript
   {
     id: String,
     clientId: String,
     fileName: String,
     fileType: String,
     fileSize: Number,
     filePath: String,
     category: String, // 'w2' | '1099' | 'receipt' | 'other'
     uploadedAt: Date,
     uploadedBy: String
   }
   ```

4. **Task Model**
   ```javascript
   {
     id: String,
     clientId: String,
     title: String,
     description: String,
     status: String, // 'pending' | 'completed' | 'overdue'
     dueDate: Date,
     priority: String, // 'low' | 'medium' | 'high'
     createdAt: Date,
     completedAt: Date
   }
   ```

5. **Message Model**
   ```javascript
   {
     id: String,
     clientId: String,
     senderId: String,
     receiverId: String,
     message: String,
     isRead: Boolean,
     attachments: [String],
     sentAt: Date
   }
   ```

6. **Invoice Model**
   ```javascript
   {
     id: String,
     clientId: String,
     amount: Number,
     description: String,
     status: String, // 'draft' | 'sent' | 'paid' | 'overdue'
     dueDate: Date,
     paidAt: Date,
     createdAt: Date
   }
   ```

## Frontend Integration Steps

1. **Replace Mock Data**
   - Remove imports from `/src/mock/data.js`
   - Add API service functions in `/src/services/api.js`
   - Update components to use real API calls

2. **Add State Management**
   - Implement React Context for authentication state
   - Add loading states for all API calls
   - Implement error handling for failed requests

3. **Add Authentication**
   - Create login/register forms
   - Implement protected routes
   - Add authentication persistence

4. **Add Real Functionality**
   - File upload for tax documents
   - Real-time messaging system
   - Task management interface
   - Invoice generation and payment processing

## Security Considerations

1. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control
   - Session management

2. **File Upload Security**
   - File type validation
   - File size limits
   - Virus scanning for uploaded files
   - Secure file storage

3. **Data Protection**
   - Encryption for sensitive tax data
   - HTTPS enforcement
   - Input validation and sanitization
   - Rate limiting for API endpoints

## Testing Strategy

1. **Backend Testing**
   - Unit tests for all API endpoints
   - Integration tests for database operations
   - Security testing for authentication

2. **Frontend Testing**
   - Component testing for all UI components
   - E2E testing for critical user flows
   - Cross-browser compatibility testing