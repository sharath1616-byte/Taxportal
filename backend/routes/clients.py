from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models.client import Client, ClientCreate, ClientUpdate, ClientResponse
from models.user import UserRole
from utils.auth import get_current_user, require_role
from database import BaseRepository
from datetime import datetime

router = APIRouter(prefix="/clients", tags=["Clients"])
client_repo = BaseRepository("clients")
user_repo = BaseRepository("users")
document_repo = BaseRepository("documents")
task_repo = BaseRepository("tasks")
invoice_repo = BaseRepository("invoices")

@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Create a new client relationship"""
    # Verify the user exists and is a client
    user = await user_repo.find_by_id(client_data.userId)
    if not user or user["role"] != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client user ID"
        )
    
    # Check if client relationship already exists for this tax year
    existing_client = await client_repo.collection.find_one({
        "userId": client_data.userId,
        "taxProfessionalId": client_data.taxProfessionalId,
        "taxYear": client_data.taxYear
    })
    
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client relationship already exists for this tax year"
        )
    
    client = Client(**client_data.dict())
    created_client = await client_repo.create(client.dict())
    
    return await _enrich_client_response(created_client)

@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    tax_year: Optional[int] = Query(None)
):
    """Get clients based on user role"""
    filter_dict = {}
    
    if current_user["role"] == UserRole.CLIENT:
        filter_dict["userId"] = current_user["user_id"]
    elif current_user["role"] == UserRole.TAX_PROFESSIONAL:
        filter_dict["taxProfessionalId"] = current_user["user_id"]
    # Admin can see all clients
    
    if status:
        filter_dict["status"] = status
    if tax_year:
        filter_dict["taxYear"] = tax_year
    
    clients = await client_repo.find_many(filter_dict, limit=limit, skip=skip)
    
    # Enrich client responses
    enriched_clients = []
    for client in clients:
        enriched_client = await _enrich_client_response(client)
        enriched_clients.append(enriched_client)
    
    return enriched_clients

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific client details"""
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
            detail="Not authorized to access this client"
        )
    
    return await _enrich_client_response(client)

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_update: ClientUpdate,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Update client information"""
    client = await client_repo.find_by_id(client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions for tax professional
    if current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this client"
        )
    
    update_data = client_update.dict(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()
    
    updated_client = await client_repo.update_by_id(client_id, update_data)
    if not updated_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update client"
        )
    
    return await _enrich_client_response(updated_client)

@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    current_user: dict = Depends(require_role(UserRole.ADMIN))
):
    """Delete client (admin only)"""
    success = await client_repo.delete_by_id(client_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return {"message": "Client deleted successfully"}

async def _enrich_client_response(client: dict) -> ClientResponse:
    """Add related counts to client response"""
    client_id = client["id"]
    
    # Count related documents, tasks, and invoices
    document_count = await document_repo.count({"clientId": client_id})
    task_count = await task_repo.count({"clientId": client_id})
    completed_task_count = await task_repo.count({"clientId": client_id, "status": "completed"})
    invoice_count = await invoice_repo.count({"clientId": client_id})
    
    client.update({
        "documentCount": document_count,
        "taskCount": task_count,
        "completedTaskCount": completed_task_count,
        "invoiceCount": invoice_count
    })
    
    return ClientResponse(**client)