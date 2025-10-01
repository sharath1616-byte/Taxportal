from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional
from models.document import Document, DocumentCreate, DocumentResponse, DocumentCategory
from models.user import UserRole
from utils.auth import get_current_user
from utils.file_handler import save_file, delete_file, get_file_url
from database import BaseRepository
import os

router = APIRouter(prefix="/documents", tags=["Documents"])
document_repo = BaseRepository("documents")
client_repo = BaseRepository("clients")

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    client_id: str = Form(...),
    category: DocumentCategory = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a document for a client"""
    # Verify client exists and user has access
    client = await client_repo.find_by_id(client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if (current_user["role"] == UserRole.CLIENT and client["userId"] != current_user["user_id"]) or \
       (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents for this client"
        )
    
    # Save file
    file_info = await save_file(file, client_id)
    
    # Create document record
    document_data = DocumentCreate(
        clientId=client_id,
        fileName=file_info["fileName"],
        originalFileName=file_info["originalFileName"],
        fileType=file_info["fileType"],
        fileSize=file_info["fileSize"],
        filePath=file_info["filePath"],
        category=category,
        description=description,
        uploadedBy=current_user["user_id"]
    )
    
    document = Document(**document_data.dict())
    created_document = await document_repo.create(document.dict())
    
    # Add download URL
    created_document["downloadUrl"] = get_file_url(created_document["filePath"])
    
    return DocumentResponse(**created_document)

@router.get("/{client_id}", response_model=List[DocumentResponse])
async def get_client_documents(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    category: Optional[DocumentCategory] = None
):
    """Get all documents for a client"""
    # Verify client exists and user has access
    client = await client_repo.find_by_id(client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if (current_user["role"] == UserRole.CLIENT and client["userId"] != current_user["user_id"]) or \
       (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view documents for this client"
        )
    
    filter_dict = {"clientId": client_id}
    if category:
        filter_dict["category"] = category
    
    documents = await document_repo.find_many(filter_dict)
    
    # Add download URLs
    for doc in documents:
        doc["downloadUrl"] = get_file_url(doc["filePath"])
    
    return [DocumentResponse(**doc) for doc in documents]

@router.get("/download/{document_id}")
async def download_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download a document"""
    document = await document_repo.find_by_id(document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Verify client access
    client = await client_repo.find_by_id(document["clientId"])
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated client not found"
        )
    
    # Check permissions
    if (current_user["role"] == UserRole.CLIENT and client["userId"] != current_user["user_id"]) or \
       (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this document"
        )
    
    # Check if file exists
    if not os.path.exists(document["filePath"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=document["filePath"],
        filename=document["originalFileName"],
        media_type=document["fileType"]
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a document"""
    document = await document_repo.find_by_id(document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Verify client access
    client = await client_repo.find_by_id(document["clientId"])
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated client not found"
        )
    
    # Check permissions (only uploader, tax professional, or admin can delete)
    if not (document["uploadedBy"] == current_user["user_id"] or 
            (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] == current_user["user_id"]) or
            current_user["role"] == UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )
    
    # Delete file from storage
    await delete_file(document["filePath"])
    
    # Delete document record
    success = await document_repo.delete_by_id(document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete document"
        )
    
    return {"message": "Document deleted successfully"}