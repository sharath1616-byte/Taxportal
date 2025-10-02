# 🚀 TaxPortal Pro - Quick Local Setup

## One-Command Setup (Recommended)

### Using Docker Compose
```bash
# Clone and start everything
git clone <your-repo>
cd taxportal-pro
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up --build
```

**That's it!** Application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## Manual Setup (Alternative)

### 1. Prerequisites
```bash
# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python (3.11+)
sudo apt-get install python3.11 python3.11-venv python3-pip

# Install MongoDB
sudo apt-get install mongodb
sudo systemctl start mongod
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install emergent integrations
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Setup environment
cp .env.example .env
# Edit .env file with your settings

# Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start frontend
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```bash
# Required
MONGO_URL="mongodb://localhost:27017"
DB_NAME="taxportal_pro"
SECRET_KEY="your-secret-key"
STRIPE_API_KEY="sk_test_emergent"

# Optional (for full functionality)
SENDGRID_API_KEY="your-sendgrid-key"
SENDER_EMAIL="noreply@yourdomain.com"
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL="http://localhost:8001"
```

## 🧪 Quick Test

1. **Open**: http://localhost:3000
2. **Register**: Create account as "Tax Professional"
3. **Navigate**: Try all menu items
4. **Test Payment**: Go to Payments → Purchase service (use card 4242424242424242)
5. **Test Email**: Go to Email Sync → Connect providers

## 🎯 API Keys for Testing

### Stripe (Payment Testing)
```bash
# Test API Key (safe to use)
STRIPE_API_KEY="sk_test_51234567890abcdef"

# Test Cards
# Success: 4242424242424242
# Decline: 4000000000000002
```

### SendGrid (Email Testing)
```bash
# Get free API key at sendgrid.com
SENDGRID_API_KEY="SG.your_key_here"
# Or use mock mode (emails won't send but UI works)
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build

# Reset database
docker-compose down -v
docker-compose up
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000/8001
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8001 | xargs kill -9
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or use Docker MongoDB
docker run -d --name mongo -p 27017:27017 mongo:5.0
```

### Python Dependencies
```bash
# If pip install fails
pip install --upgrade pip
pip install wheel setuptools

# For emergentintegrations issues
pip install --force-reinstall emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables** with production values
2. **Set up SSL** certificates
3. **Use production database** (MongoDB Atlas recommended)
4. **Configure domain** and DNS
5. **Set up monitoring** and logging

Example production backend .env:
```bash
MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/taxportal"
CORS_ORIGINS="https://yourdomain.com"
SECRET_KEY="super-long-random-production-secret"
STRIPE_API_KEY="sk_live_your_production_key"
```

## 📱 Mobile Testing

Test responsive design:
```bash
# Access from mobile device on same network
# Replace YOUR_IP with your computer's local IP
http://YOUR_IP:3000

# Find your IP
ifconfig | grep inet
```

## 🎯 Next Steps

1. **Customize branding** in frontend components
2. **Add real API keys** for full functionality
3. **Set up CI/CD** pipeline
4. **Add monitoring** and analytics
5. **Configure backup** strategy
6. **Set up staging** environment

Happy coding! 🎉