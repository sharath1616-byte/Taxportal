from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from pathlib import Path

# Import database connection
from database import connect_to_mongo, close_mongo_connection

# Import route modules
from routes import auth, clients, documents, tasks, messages, invoices, emails, payments, bookkeeping

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="TaxPortal Pro API",
    description="A comprehensive tax and accounting client portal API",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "TaxPortal Pro API is running"}

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(clients.router)
api_router.include_router(documents.router)
api_router.include_router(tasks.router)
api_router.include_router(messages.router)
api_router.include_router(invoices.router)
api_router.include_router(emails.router)
api_router.include_router(payments.router)
api_router.include_router(bookkeeping.router)

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files (for file downloads)
uploads_path = Path("/app/uploads")
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    logger.info("TaxPortal Pro API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    logger.info("TaxPortal Pro API shutting down")
