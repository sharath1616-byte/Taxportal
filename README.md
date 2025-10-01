# TaxPortal Pro - Tax & Accounting Client Portal

A pixel-perfect clone of Assembly.com tailored for tax and accounting services with full backend functionality.

## 🚀 Features

- **Frontend**: Beautiful Assembly.com-inspired design with TaxPortal branding
- **Authentication**: JWT-based auth with role-based access (Client/Tax Professional/Admin)
- **Document Management**: Secure file upload with categorization (W-2, 1099, receipts, etc.)
- **Client Portal**: Professional dashboard with task tracking and messaging
- **Invoice Management**: Create, send, and track invoices with payment processing
- **Task Management**: Assign and track client tasks
- **Messaging System**: Secure client-professional communication
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file with:
   # MONGO_URL=mongodb://localhost:27017/taxportal
   # DB_NAME=taxportal
   # SECRET_KEY=your-secret-key-here
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   yarn install
   
   # Create .env file with:
   # REACT_APP_BACKEND_URL=http://localhost:8001
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend** (in backend directory)
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Start Frontend** (in frontend directory)
   ```bash
   yarn start
   ```

4. **Open**: http://localhost:3000

## 🧪 Key Features to Test

1. **Registration/Login** - Test both client and tax professional roles
2. **Document Upload** - Upload files in Documents tab after login
3. **Navigation** - Test Customers, Pricing pages
4. **Dashboard** - Different views for clients vs tax professionals
5. **Mobile** - Test responsive design

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── models/             # Database models
│   ├── routes/             # API endpoints  
│   ├── utils/              # Auth & file handling
│   └── server.py           # Main app
├── frontend/               # React frontend
│   ├── src/components/     # UI components
│   ├── src/services/       # API layer
│   └── src/context/        # Auth context
```

## 🔧 Troubleshooting

- **MongoDB**: Ensure it's running and connection string is correct
- **API Errors**: Check backend is on port 8001
- **File Upload**: Verify uploads directory permissions
- **Auth Issues**: Clear browser localStorage if needed

## 📋 API Documentation

Available at: http://localhost:8001/docs
