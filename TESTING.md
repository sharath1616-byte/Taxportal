# TaxPortal Pro - Testing Guide

## 🧪 Comprehensive Testing Instructions

### Prerequisites for Testing
1. Application running locally (see README.md)
2. MongoDB accessible
3. API keys configured (can use test/mock keys)

## 🚀 Quick Start Testing

### 1. Health Check
```bash
# Test backend is running
curl http://localhost:8001/api/health

# Expected response:
# {"status":"healthy","message":"TaxPortal Pro API is running"}
```

### 2. Frontend Access
1. Open browser: `http://localhost:3000`
2. Should see TaxPortal landing page
3. Click "Get Started" or "Login" buttons

## 👤 User Registration & Authentication Testing

### Test Tax Professional Registration
1. Go to `http://localhost:3000/register`
2. Fill form:
   - First Name: John
   - Last Name: Professional
   - Email: john@taxfirm.com
   - Account Type: Tax Professional
   - Password: TestPass123!
   - Confirm Password: TestPass123!
3. Submit and verify redirect to dashboard

### Test Client Registration
1. Go to `http://localhost:3000/register`
2. Fill form:
   - First Name: Jane
   - Last Name: Client
   - Email: jane@example.com
   - Account Type: Client
   - Password: ClientPass123!
   - Confirm Password: ClientPass123!
3. Submit and verify redirect to dashboard

### Test Login Flow
1. Go to `http://localhost:3000/login`
2. Use credentials from registration
3. Verify successful login and dashboard access

## 📧 Email Integration Testing

### Test Client Invitation (Tax Professional Only)
1. Login as tax professional
2. Navigate to "Invite Clients"
3. Fill invitation form:
   - First Name: Test
   - Last Name: Client
   - Email: testclient@example.com
   - Email Provider: SendGrid
   - Personal Message: "Welcome to our portal!"
4. Submit and check for success message
5. Verify invitation appears in "Sent Invitations" list

### Test Email Integration Page
1. Navigate to "Email Sync" (tax professionals only)
2. Test provider connections:
   - Click "Connect Gmail" (will show mock success)
   - Toggle automation settings
   - Verify UI responsiveness

## 💳 Payment Integration Testing

### Test Service Payment Flow
1. Navigate to "Payments" section
2. Choose a service package (e.g., "Basic Tax Filing")
3. Click "Purchase Service"
4. Should redirect to Stripe checkout (test mode)
5. Use Stripe test card: `4242424242424242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - Postal Code: Any (e.g., 12345)

### Test Payment Status Polling
1. After payment, verify redirect to success page
2. Check that payment status updates correctly
3. Navigate back to "Payments" to see transaction history

### Test Stripe Test Cards
```bash
# Successful payment
4242424242424242

# Declined card
4000000000000002

# Requires authentication (3D Secure)
4000002500003155

# Insufficient funds
4000000000009995
```

## 📄 Document Management Testing

### Test Document Upload
1. Navigate to "Documents"
2. Click "Select Files" or drag and drop
3. Choose a test file (PDF, JPG, or TXT)
4. Select category (e.g., "Tax Documents")
5. Add description
6. Upload and verify success

### Test Document Viewing
1. Verify uploaded documents appear in list
2. Test search functionality
3. Test category filtering
4. Test download functionality

## 💬 Messaging System Testing

### Test Message Sending
1. Navigate to "Messages"
2. Click "New" to start conversation
3. Select recipient (if multiple users exist)
4. Type message and send
5. Verify message appears in conversation

## 🧾 Invoice Management Testing

### Test Invoice Creation (Tax Professional)
1. Navigate to "Invoices"
2. Click "Create Invoice"
3. Fill invoice details:
   - Client: Select from dropdown
   - Description: "Tax preparation services"
   - Amount: 500.00
   - Due Date: Future date
4. Save and verify invoice creation

### Test Invoice Payment (Client)
1. Login as client
2. Navigate to "Invoices"
3. Find unpaid invoice
4. Click "Pay Now"
5. Complete Stripe payment flow
6. Verify invoice status updates to "Paid"

## 🔐 Security Testing

### Test Protected Routes
1. Logout from application
2. Try to access protected URLs directly:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/documents`
   - `http://localhost:3000/invite-clients`
3. Verify all redirect to login page

### Test Role-Based Access
1. Login as client
2. Try to access tax professional features:
   - Should not see "Invite Clients" in navigation
   - Should not see "Email Sync" in navigation
   - Direct URL access should be blocked

## 📊 API Testing with curl

### Authentication Endpoints
```bash
# Register new user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "client"
  }'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Save the token from login response for authenticated requests
TOKEN="your_jwt_token_here"
```

### Protected Endpoints
```bash
# Get user profile
curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get service packages
curl -X GET http://localhost:8001/api/payments/services/packages \
  -H "Authorization: Bearer $TOKEN"

# Get user transactions
curl -X GET http://localhost:8001/api/payments/transactions \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Common Test Scenarios

### Error Handling Tests
1. **Invalid Login**: Try login with wrong credentials
2. **Expired Token**: Use old/invalid JWT token
3. **Invalid Email**: Try registration with malformed email
4. **Duplicate Email**: Try registering same email twice
5. **Large File Upload**: Try uploading file > 10MB
6. **Invalid Payment**: Use declined test card

### Edge Cases
1. **Empty Forms**: Submit forms with missing required fields
2. **SQL Injection**: Try malicious input in text fields
3. **XSS**: Try script injection in message fields
4. **CORS**: Test from different origin

## 📝 Test Data Generation

### Sample Test Users
```json
[
  {
    "email": "professional1@taxfirm.com",
    "password": "TaxPro123!",
    "firstName": "John",
    "lastName": "Professional",
    "role": "tax_professional"
  },
  {
    "email": "client1@example.com",
    "password": "Client123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "client"
  },
  {
    "email": "admin@taxportal.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
]
```

### Sample Test Files
Create these files for document upload testing:
- `test-document.pdf`
- `tax-form.jpg`
- `receipt.png`
- `statement.txt`

## 🔍 Monitoring During Testing

### Backend Logs
```bash
# Watch backend logs
tail -f backend/app.log

# Or if running with uvicorn directly:
# Logs will appear in terminal
```

### Database Monitoring
```bash
# Connect to MongoDB
mongosh

# Switch to taxportal database
use taxportal_pro

# Check collections
show collections

# View users
db.users.find().pretty()

# View payment transactions
db.payment_transactions.find().pretty()
```

### Frontend Debugging
1. Open browser Developer Tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API requests
4. Check Application tab for localStorage data

## ✅ Testing Checklist

### Basic Functionality
- [ ] Application starts without errors
- [ ] Landing page loads correctly
- [ ] Registration works for both user types
- [ ] Login/logout works correctly
- [ ] Dashboard loads and shows user data
- [ ] Navigation between pages works

### Email Integration
- [ ] Client invitation form submits successfully
- [ ] Invitations are stored and displayed
- [ ] Email integration page loads
- [ ] Provider connection simulation works

### Payment Integration
- [ ] Service packages load correctly
- [ ] Payment checkout redirects to Stripe
- [ ] Test payments process successfully
- [ ] Payment status updates correctly
- [ ] Transaction history displays

### Security
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based access control works
- [ ] JWT tokens work for API authentication
- [ ] Sensitive data is not exposed

### Error Handling
- [ ] Form validation works correctly
- [ ] API errors are handled gracefully
- [ ] User-friendly error messages display
- [ ] Application doesn't crash on errors

## 🚨 Known Issues & Workarounds

1. **Registration Dropdown**: If role selection doesn't work in automated tests, use manual testing
2. **Email Delivery**: Uses mock responses in development - real emails won't be sent without production keys
3. **Payment Processing**: Uses Stripe test mode - no real charges will occur
4. **File Uploads**: Large files (>10MB) may timeout - use smaller test files

## 📞 Getting Help

If you encounter issues during testing:
1. Check the troubleshooting section in README.md
2. Review browser console for frontend errors
3. Check backend logs for API errors
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed