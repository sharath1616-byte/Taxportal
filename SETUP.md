# Simple Tax Portal - Local Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Download & Extract
```bash
# Extract the downloaded tar.gz file
tar -xzf simple-tax-portal.tar.gz
cd simple-tax-portal
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
echo "MONGO_URL=mongodb://localhost:27017/taxportal" > .env
echo "DB_NAME=taxportal" >> .env
echo "SECRET_KEY=your-secret-key-change-this-in-production" >> .env
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies (choose one)
npm install
# OR
yarn install

# Create environment file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
```

### 4. Start MongoDB
```bash
# Start MongoDB service
# Windows (if installed as service):
net start MongoDB
# macOS (if installed via Homebrew):
brew services start mongodb-community
# Linux:
sudo systemctl start mongod
# OR run directly:
mongod
```

### 5. Run the Application
Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start  # or yarn start
```

**Terminal 3 - MongoDB (if not running as service):**
```bash
mongod
```

### 6. Open Your Browser
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8001/docs

## 🧪 Test the Application

### Register New Accounts:
1. Click "Get Started" on homepage
2. Fill registration form
3. Choose role: "Client" or "Tax Professional"
4. Test different dashboard views for each role

### Test Features:
- **Documents**: Upload files (drag & drop works!)
- **Messages**: Send messages between users
- **Invoices**: View/manage invoices
- **Dashboard**: See stats and activity

## 🛠️ Troubleshooting

### Common Issues:

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running:
mongod --version
# Start MongoDB:
mongod
```

**Port Already in Use:**
```bash
# Kill process on port 3000:
npx kill-port 3000
# Kill process on port 8001:
npx kill-port 8001
```

**Frontend Won't Start:**
```bash
# Clear npm cache:
npm cache clean --force
# Delete node_modules and reinstall:
rm -rf node_modules package-lock.json
npm install
```

**Backend Import Errors:**
```bash
# Make sure virtual environment is activated:
source venv/bin/activate
# Reinstall requirements:
pip install -r requirements.txt
```

## 📁 Project Structure
```
simple-tax-portal/
├── backend/                 # FastAPI backend
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── utils/              # Auth & utilities
│   ├── server.py           # Main FastAPI app
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── context/        # Auth context
│   ├── package.json        # Node dependencies
│   └── .env               # Environment variables
└── README.md
```

## 🔧 Development Tips

### Hot Reload:
- Backend: Auto-reloads on file changes (--reload flag)
- Frontend: Auto-reloads in browser

### API Testing:
- Visit: http://localhost:8001/docs
- Test all endpoints with interactive docs

### Database:
- MongoDB runs on: mongodb://localhost:27017
- Database name: taxportal
- Use MongoDB Compass for GUI: https://mongodb.com/compass

## 🎯 What to Test

1. **Landing Page**: Clean, simple design ✅
2. **Registration**: Both client & tax professional roles ✅
3. **Login/Dashboard**: Different views per role ✅
4. **Documents**: Upload, view, categorize files ✅
5. **Messages**: Real-time messaging interface ✅
6. **Invoices**: Create, view, manage invoices ✅
7. **Navigation**: Smooth transitions between pages ✅
8. **Security**: Authentication & authorization ✅

## 💡 Features Included

- ✅ **Simple, Clean UI** (no heavy Assembly.com design)
- ✅ **Full Authentication** (JWT-based, secure)
- ✅ **Document Management** (upload, categorize, download)
- ✅ **Messaging System** (client-professional communication)
- ✅ **Invoice Management** (create, track, pay)
- ✅ **Role-Based Access** (client vs professional views)
- ✅ **Mobile Responsive** (works on all devices)
- ✅ **Fast & Lightweight** (quick loading times)

Enjoy testing your Simple Tax Portal! 🎉