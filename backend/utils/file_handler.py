import os
import uuid
import shutil
from typing import List, Optional
from pathlib import Path
from fastapi import UploadFile, HTTPException
import mimetypes

# Configuration
UPLOAD_DIR = Path("/app/uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', 
    '.xls', '.xlsx', '.txt', '.csv', '.zip'
}

ALLOWED_MIME_TYPES = {
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip'
}

# Create upload directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    # Check file size
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB")
    
    # Check file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {file_extension} not allowed")
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"MIME type {file.content_type} not allowed")
    
    return True

async def save_file(file: UploadFile, client_id: str) -> dict:
    """Save uploaded file and return file info"""
    validate_file(file)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create client-specific directory
    client_dir = UPLOAD_DIR / client_id
    client_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = client_dir / unique_filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    return {
        "fileName": unique_filename,
        "originalFileName": file.filename,
        "filePath": str(file_path),
        "fileSize": file.size,
        "fileType": file.content_type
    }

async def delete_file(file_path: str) -> bool:
    """Delete file from storage"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False

def get_file_url(file_path: str) -> str:
    """Generate download URL for file"""
    # This would typically be a signed URL or served through a different route
    # For now, we'll use the file path as identifier
    return f"/api/documents/download/{Path(file_path).name}"