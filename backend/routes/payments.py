from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

from services.payment_service import payment_service
from utils.auth import get_current_user
from database import get_database

router = APIRouter(prefix="/payments", tags=["Payment Integration"])

# Pydantic models
class InvoicePaymentRequest(BaseModel):
    invoice_id: str
    origin_url: str

class ServicePaymentRequest(BaseModel):
    service_package: str
    origin_url: str
    metadata: Optional[Dict[str, Any]] = None

class PaymentResponse(BaseModel):
    success: bool
    checkout_url: Optional[str] = None
    session_id: Optional[str] = None
    message: str

class PaymentStatusResponse(BaseModel):
    session_id: str
    status: str
    payment_status: str
    amount_total: int
    currency: str
    metadata: Dict[str, str]

@router.post("/invoice/checkout", response_model=PaymentResponse)
async def create_invoice_payment_checkout(
    request_data: InvoicePaymentRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Create Stripe checkout session for invoice payment
    """
    try:
        # Get invoice from database
        db = await get_database()
        print(f"Looking for invoice with ID: {request_data.invoice_id}")
        invoice = await db.invoices.find_one({"id": request_data.invoice_id})
        print(f"Found invoice: {invoice}")
        
        if not invoice:
            # Try to find by _id as well
            try:
                from bson import ObjectId
                if ObjectId.is_valid(request_data.invoice_id):
                    invoice = await db.invoices.find_one({"_id": ObjectId(request_data.invoice_id)})
                    print(f"Found invoice by _id: {invoice}")
            except:
                pass
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Verify user has access to this invoice
        if current_user["role"] == "client":
            # For clients, check if they are the client on the invoice
            # We need to get the client relationship to verify
            client_relationship = await db.clients.find_one({"id": invoice.get("clientId")})
            if not client_relationship or client_relationship.get("userId") != current_user["user_id"]:
                raise HTTPException(status_code=403, detail="Access denied to this invoice")
        elif current_user["role"] == "tax_professional":
            # For tax professionals, check if they are the professional for this client
            client_relationship = await db.clients.find_one({"id": invoice.get("clientId")})
            if not client_relationship or client_relationship.get("taxProfessionalId") != current_user["user_id"]:
                raise HTTPException(status_code=403, detail="Access denied to this invoice")
        
        # Check if invoice is already paid
        if invoice.get("status") == "paid":
            raise HTTPException(status_code=400, detail="Invoice is already paid")
        
        # Create checkout session
        session = await payment_service.create_invoice_payment_session(
            invoice_id=request_data.invoice_id,
            amount=float(invoice["total_amount"]),
            currency="usd",
            user_id=current_user["user_id"],
            origin_url=request_data.origin_url,
            request=request
        )
        
        return PaymentResponse(
            success=True,
            checkout_url=session.url,
            session_id=session.session_id,
            message="Payment session created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create invoice payment session: {str(e)}")

@router.post("/service/checkout", response_model=PaymentResponse)
async def create_service_payment_checkout(
    request_data: ServicePaymentRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Create Stripe checkout session for service payment (tax filing, bookkeeping, etc.)
    """
    try:
        # Create checkout session
        session = await payment_service.create_service_payment_session(
            service_package=request_data.service_package,
            user_id=current_user["user_id"],
            origin_url=request_data.origin_url,
            request=request,
            metadata=request_data.metadata
        )
        
        return PaymentResponse(
            success=True,
            checkout_url=session.url,
            session_id=session.session_id,
            message="Service payment session created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create service payment session: {str(e)}")

@router.get("/status/{session_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    session_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Get payment status for a checkout session
    """
    try:
        # Verify user has access to this payment session
        db = await get_database()
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Payment session not found")
        
        if transaction.get("user_id") != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied to this payment session")
        
        # Get status from payment service
        status = await payment_service.get_payment_status(session_id, request)
        
        return PaymentStatusResponse(
            session_id=session_id,
            status=status.status,
            payment_status=status.payment_status,
            amount_total=status.amount_total,
            currency=status.currency,
            metadata=status.metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get payment status: {str(e)}")

@router.get("/transactions")
async def get_user_payment_transactions(
    current_user: dict = Depends(get_current_user)
):
    """
    Get payment transactions for current user
    """
    try:
        db = await get_database()
        transactions = await db.payment_transactions.find(
            {"user_id": current_user["user_id"]}
        ).sort("created_at", -1).to_list(length=50)
        
        # Convert ObjectId to string for JSON serialization
        for transaction in transactions:
            if "_id" in transaction:
                transaction["_id"] = str(transaction["_id"])
        
        return {
            "transactions": transactions,
            "total": len(transactions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve transactions: {str(e)}")

@router.get("/services/packages")
async def get_service_packages():
    """
    Get available service packages
    """
    packages = {
        "tax_basic": {
            "name": "Basic Tax Filing",
            "price": 299.00,
            "currency": "usd",
            "description": "Individual tax return preparation with standard deductions",
            "features": [
                "Form 1040 preparation",
                "Standard deduction optimization",
                "Basic tax consultation",
                "Electronic filing included"
            ]
        },
        "tax_premium": {
            "name": "Premium Tax Filing", 
            "price": 599.00,
            "currency": "usd",
            "description": "Comprehensive tax preparation with itemized deductions and complex situations",
            "features": [
                "All forms and schedules",
                "Itemized deduction optimization",
                "Investment and rental income",
                "Tax planning consultation",
                "Audit support included"
            ]
        },
        "bookkeeping_monthly": {
            "name": "Monthly Bookkeeping",
            "price": 150.00,
            "currency": "usd", 
            "description": "Complete monthly bookkeeping services for small businesses",
            "features": [
                "Transaction categorization",
                "Bank reconciliation", 
                "Financial statements",
                "Monthly reports",
                "QuickBooks setup"
            ]
        },
        "bookkeeping_quarterly": {
            "name": "Quarterly Bookkeeping",
            "price": 400.00,
            "currency": "usd",
            "description": "Quarterly bookkeeping and tax preparation for businesses",
            "features": [
                "3 months of bookkeeping",
                "Quarterly tax filings",
                "Payroll processing",
                "Financial analysis",
                "Tax planning meeting"
            ]
        },
        "consultation": {
            "name": "Tax Consultation",
            "price": 125.00,
            "currency": "usd",
            "description": "One-hour consultation with tax professional",
            "features": [
                "60-minute consultation",
                "Tax strategy planning",
                "Deduction optimization",
                "Written recommendations",
                "Follow-up email summary"
            ]
        }
    }
    
    return {"packages": packages}

@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Handle Stripe webhook events
    """
    try:
        # Get request body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Process webhook in background to return quickly
        background_tasks.add_task(
            process_stripe_webhook,
            body,
            signature,
            request
        )
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

async def process_stripe_webhook(body: bytes, signature: str, request: Request):
    """
    Background task to process Stripe webhook
    """
    try:
        result = await payment_service.handle_stripe_webhook(body, signature, request)
        print(f"Webhook processed successfully: {result}")
    except Exception as e:
        print(f"Webhook processing error: {e}")

# PayPal Integration (placeholder for future implementation)
@router.post("/paypal/checkout")
async def create_paypal_checkout():
    """
    Create PayPal checkout session (future implementation)
    """
    return {
        "message": "PayPal integration coming soon",
        "status": "not_implemented"
    }