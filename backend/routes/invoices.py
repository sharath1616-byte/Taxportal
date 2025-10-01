from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models.invoice import Invoice, InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceStatus
from models.user import UserRole
from utils.auth import get_current_user, require_role
from database import BaseRepository
from datetime import datetime
import uuid

router = APIRouter(prefix="/invoices", tags=["Invoices"])
invoice_repo = BaseRepository("invoices")
client_repo = BaseRepository("clients")

@router.post("/", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Create a new invoice for a client"""
    # Verify client exists and user has access
    client = await client_repo.find_by_id(invoice_data.clientId)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions for tax professional
    if current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create invoices for this client"
        )
    
    # Calculate totals
    subtotal = sum(item.quantity * item.rate for item in invoice_data.items)
    total_amount = subtotal + invoice_data.taxAmount
    
    # Update item amounts
    for item in invoice_data.items:
        item.amount = item.quantity * item.rate
    
    # Generate invoice number
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    invoice = Invoice(
        clientId=invoice_data.clientId,
        invoiceNumber=invoice_number,
        items=invoice_data.items,
        subtotal=subtotal,
        taxAmount=invoice_data.taxAmount,
        totalAmount=total_amount,
        dueDate=invoice_data.dueDate,
        notes=invoice_data.notes
    )
    
    created_invoice = await invoice_repo.create(invoice.dict())
    
    return InvoiceResponse(**created_invoice)

@router.get("/{client_id}", response_model=List[InvoiceResponse])
async def get_client_invoices(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    status: Optional[InvoiceStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all invoices for a client"""
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
            detail="Not authorized to view invoices for this client"
        )
    
    filter_dict = {"clientId": client_id}
    if status:
        filter_dict["status"] = status
    
    invoices = await invoice_repo.find_many(filter_dict, limit=limit, skip=skip)
    
    # Update overdue invoices
    for invoice in invoices:
        if (invoice["status"] in [InvoiceStatus.SENT] and 
            datetime.fromisoformat(invoice["dueDate"]) < datetime.utcnow()):
            invoice["status"] = InvoiceStatus.OVERDUE
            await invoice_repo.update_by_id(invoice["id"], {"status": InvoiceStatus.OVERDUE})
    
    return [InvoiceResponse(**invoice) for invoice in invoices]

@router.get("/invoice/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific invoice details"""
    invoice = await invoice_repo.find_by_id(invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Verify client access
    client = await client_repo.find_by_id(invoice["clientId"])
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
            detail="Not authorized to view this invoice"
        )
    
    return InvoiceResponse(**invoice)

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice_update: InvoiceUpdate,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Update invoice"""
    invoice = await invoice_repo.find_by_id(invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Verify client access for tax professional
    if current_user["role"] == UserRole.TAX_PROFESSIONAL:
        client = await client_repo.find_by_id(invoice["clientId"])
        if not client or client["taxProfessionalId"] != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this invoice"
            )
    
    # Don't allow updates to paid invoices
    if invoice["status"] == InvoiceStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update paid invoices"
        )
    
    update_data = invoice_update.dict(exclude_unset=True)
    
    # Recalculate totals if items are updated
    if "items" in update_data:
        subtotal = sum(item["quantity"] * item["rate"] for item in update_data["items"])
        tax_amount = update_data.get("taxAmount", invoice["taxAmount"])
        
        # Update item amounts
        for item in update_data["items"]:
            item["amount"] = item["quantity"] * item["rate"]
        
        update_data.update({
            "subtotal": subtotal,
            "totalAmount": subtotal + tax_amount
        })
    
    update_data["updatedAt"] = datetime.utcnow()
    
    updated_invoice = await invoice_repo.update_by_id(invoice_id, update_data)
    if not updated_invoice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update invoice"
        )
    
    return InvoiceResponse(**updated_invoice)

@router.post("/{invoice_id}/pay", response_model=InvoiceResponse)
async def pay_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark invoice as paid (simplified payment processing)"""
    invoice = await invoice_repo.find_by_id(invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Verify client access
    client = await client_repo.find_by_id(invoice["clientId"])
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated client not found"
        )
    
    # Check if user is the client or tax professional
    if not ((current_user["role"] == UserRole.CLIENT and client["userId"] == current_user["user_id"]) or
            (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] == current_user["user_id"]) or
            current_user["role"] == UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay this invoice"
        )
    
    if invoice["status"] == InvoiceStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice is already paid"
        )
    
    # In a real implementation, this would integrate with a payment processor
    update_data = {
        "status": InvoiceStatus.PAID,
        "paidAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    updated_invoice = await invoice_repo.update_by_id(invoice_id, update_data)
    if not updated_invoice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update invoice payment status"
        )
    
    return InvoiceResponse(**updated_invoice)

@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: str,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Delete invoice (only if not paid)"""
    invoice = await invoice_repo.find_by_id(invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    if invoice["status"] == InvoiceStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete paid invoices"
        )
    
    # Verify client access for tax professional
    if current_user["role"] == UserRole.TAX_PROFESSIONAL:
        client = await client_repo.find_by_id(invoice["clientId"])
        if not client or client["taxProfessionalId"] != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this invoice"
            )
    
    success = await invoice_repo.delete_by_id(invoice_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete invoice"
        )
    
    return {"message": "Invoice deleted successfully"}