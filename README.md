# TaxPortal Pro - Local Development Setup

A comprehensive tax and accounting client portal with email integration, payment processing, and secure document management.

## 🚀 Features

- **Email Integration**: SendGrid & Gmail support for client invitations
- **Payment Processing**: Stripe integration for service packages and invoice payments
- **Document Management**: Secure file upload and categorization
- **Client Communication**: Real-time messaging system
- **Invoice Management**: Create and track invoices with payment integration
- **Role-Based Access**: Tax professionals and client portals
- **Authentication**: JWT-based auth with role-based permissions

## 📋 Prerequisites

- Node.js (v18+)
- Python (3.11+)
- MongoDB (v5.0+)
- Git

## 🛠️ Local Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd taxportal-pro

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Ubuntu/Debian:
sudo apt-get install mongodb

# macOS with Homebrew:
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

#### Option B: Docker MongoDB
```bash
# Run MongoDB in Docker
docker run -d \
  --name taxportal-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:5.0
```

#### Option C: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `.env`

### 3. Environment Configuration

#### Backend Environment
Create `backend/.env` file:
```bash
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="taxportal_pro"
CORS_ORIGINS="*"

# Authentication
SECRET_KEY="your-jwt-secret-key-change-in-production"

# Email Integration
EMERGENT_LLM_KEY="sk-emergent-99bA44eAeA69c2eBd1"
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDER_EMAIL="noreply@yourdomain.com"
GMAIL_CREDENTIALS_PATH="/path/to/gmail_credentials.json"

# Payment Integration
STRIPE_API_KEY="sk_test_your_stripe_test_key"
```

#### Frontend Environment
Create `frontend/.env` file:
```bash
REACT_APP_BACKEND_URL="http://localhost:8001"
```

### 4. API Keys Setup

#### For Email Integration:
1. **SendGrid**: Get API key from [SendGrid](https://sendgrid.com)
2. **Gmail API**: 
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create project and enable Gmail API
   - Create credentials and download JSON file

#### For Payment Integration:
1. **Stripe**: Get test API keys from [Stripe Dashboard](https://dashboard.stripe.com)
   - Use test keys starting with `sk_test_`
   - Add webhook endpoint: `http://localhost:8001/api/payments/webhook/stripe`

### 5. Running the Application

#### Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will be available at: `http://localhost:8001`
API Documentation: `http://localhost:8001/docs`

#### Start Frontend
```bash
cd frontend
npm start
```

Frontend will be available at: `http://localhost:3000`

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/ -v

# Or test specific endpoints with curl:
curl -X GET http://localhost:8001/api/health
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
1. Register as a tax professional at `http://localhost:3000/register`
2. Login and navigate to different sections
3. Test email invitation system
4. Test payment integration with Stripe test cards

## 🎯 Test User Flows

### Tax Professional Flow:
1. Register with role "Tax Professional"
2. Login and access dashboard
3. Navigate to "Invite Clients" and send invitation
4. Go to "Email Sync" to configure email integration
5. Visit "Payments" to see service packages
6. Create invoices and test payment processing

### Client Flow:
1. Register with role "Client" 
2. Login and access client dashboard
3. Upload documents in "Documents" section
4. Send messages in "Messages" section
5. View and pay invoices in "Invoices" section
6. Purchase services in "Payments" section

## 📱 Test Payment Integration

### Stripe Test Cards:
```bash
# Successful payment
4242424242424242

# Declined payment
4000000000000002

# Requires authentication
4000002500003155
```

Use any future expiry date, any 3-digit CVC, and any postal code.

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check if MongoDB is running: `mongosh` or `mongo`
   - Verify connection string in `.env`

2. **Backend Import Errors**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

3. **Frontend Build Errors**
   - Delete `node_modules` and run `npm install`
   - Check Node.js version (should be 18+)

4. **CORS Issues**
   - Verify `CORS_ORIGINS` in backend `.env`
   - Check `REACT_APP_BACKEND_URL` in frontend `.env`

5. **Payment Integration Issues**
   - Verify Stripe API keys are test keys
   - Check webhook URL configuration
   - Ensure emergentintegrations library is installed

### Logs:
```bash
# Backend logs
tail -f backend/app.log

# Frontend logs
# Check browser console for errors
```

## 🔒 Security Notes

- Never commit real API keys to version control
- Use test keys for local development
- Change default JWT secret in production
- Enable HTTPS in production
- Configure proper CORS origins for production

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8001/docs` for interactive API documentation.

## 🚀 Deployment

For production deployment:
1. Use production API keys
2. Set up proper domain and SSL
3. Configure production database
4. Set secure environment variables
5. Enable proper logging and monitoring

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at `/docs`
3. Check browser console for frontend errors
4. Review backend logs for API errors