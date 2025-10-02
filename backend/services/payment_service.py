import os
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import Request, HTTPException
from dotenv import load_dotenv

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)
from database import get_database

# Load environment variables
load_dotenv()

class PaymentService:
    """
    Payment service handling Stripe and PayPal payments for invoice processing
    """
    
    def __init__(self):
        self.stripe_api_key = os.getenv('STRIPE_API_KEY')
        if not self.stripe_api_key:
            raise ValueError("STRIPE_API_KEY environment variable is required")
    
    def _get_stripe_checkout(self, request: Request) -> StripeCheckout:
        """Initialize Stripe checkout with webhook URL"""
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/payments/webhook/stripe"
        return StripeCheckout(api_key=self.stripe_api_key, webhook_url=webhook_url)
    
    async def create_invoice_payment_session(
        self, 
        invoice_id: str, 
        amount: float, 
        currency: str,
        user_id: str,
        origin_url: str,
        request: Request
    ) -> CheckoutSessionResponse:
        """
        Create Stripe checkout session for invoice payment
        """
        try:
            stripe_checkout = self._get_stripe_checkout(request)
            
            # Build dynamic URLs
            success_url = f"{origin_url}/invoice-payment-success?session_id={{CHECKOUT_SESSION_ID}}&invoice_id={invoice_id}"
            cancel_url = f"{origin_url}/invoices?payment=cancelled&invoice_id={invoice_id}"
            
            # Create metadata for tracking
            metadata = {
                "invoice_id": invoice_id,
                "user_id": user_id,
                "payment_type": "invoice_payment",
                "source": "tax_portal"
            }
            
            # Create checkout session request
            checkout_request = CheckoutSessionRequest(
                amount=amount,
                currency=currency,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata
            )
            
            # Create session
            session = await stripe_checkout.create_checkout_session(checkout_request)
            
            # Store payment transaction in database
            await self._create_payment_transaction(
                session_id=session.session_id,
                invoice_id=invoice_id,
                user_id=user_id,
                amount=amount,
                currency=currency,
                payment_status="initiated",
                metadata=metadata
            )
            
            return session
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create payment session: {str(e)}")
    
    async def create_service_payment_session(
        self,
        service_package: str,
        user_id: str, 
        origin_url: str,
        request: Request,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CheckoutSessionResponse:
        """
        Create payment session for tax/bookkeeping service packages
        """
        try:
            # Define fixed service packages (security - never accept amounts from frontend)
            SERVICE_PACKAGES = {
                "tax_basic": {"amount": 299.00, "currency": "usd", "name": "Basic Tax Filing"},
                "tax_premium": {"amount": 599.00, "currency": "usd", "name": "Premium Tax Filing"}, 
                "bookkeeping_monthly": {"amount": 150.00, "currency": "usd", "name": "Monthly Bookkeeping"},
                "bookkeeping_quarterly": {"amount": 400.00, "currency": "usd", "name": "Quarterly Bookkeeping"},
                "consultation": {"amount": 125.00, "currency": "usd", "name": "Tax Consultation"}
            }
            
            if service_package not in SERVICE_PACKAGES:
                raise HTTPException(status_code=400, detail="Invalid service package")
            
            package_info = SERVICE_PACKAGES[service_package]
            
            stripe_checkout = self._get_stripe_checkout(request)
            
            # Build dynamic URLs
            success_url = f"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&service={service_package}"
            cancel_url = f"{origin_url}/services?payment=cancelled&service={service_package}"
            
            # Create metadata
            payment_metadata = {
                "service_package": service_package,
                "service_name": package_info["name"],
                "user_id": user_id,
                "payment_type": "service_payment",
                "source": "tax_portal"
            }
            if metadata:
                payment_metadata.update(metadata)
            
            # Create checkout session request
            checkout_request = CheckoutSessionRequest(
                amount=package_info["amount"],
                currency=package_info["currency"],
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=payment_metadata
            )
            
            # Create session
            session = await stripe_checkout.create_checkout_session(checkout_request)
            
            # Store payment transaction
            await self._create_payment_transaction(
                session_id=session.session_id,
                service_package=service_package,
                user_id=user_id,
                amount=package_info["amount"],
                currency=package_info["currency"],
                payment_status="initiated",
                metadata=payment_metadata
            )
            
            return session
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create service payment session: {str(e)}")
    
    async def get_payment_status(self, session_id: str, request: Request) -> CheckoutStatusResponse:
        """
        Get payment status and update database
        """
        try:
            stripe_checkout = self._get_stripe_checkout(request)
            
            # Get status from Stripe
            status_response = await stripe_checkout.get_checkout_status(session_id)
            
            # Update payment transaction in database
            await self._update_payment_transaction(session_id, status_response)
            
            return status_response
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get payment status: {str(e)}")
    
    async def handle_stripe_webhook(self, request_body: bytes, signature: str, request: Request):
        """
        Handle Stripe webhook events
        """
        try:
            stripe_checkout = self._get_stripe_checkout(request)
            
            # Handle webhook
            webhook_response = await stripe_checkout.handle_webhook(request_body, signature)
            
            # Update payment transaction based on webhook
            if webhook_response.session_id:
                await self._process_webhook_event(webhook_response)
            
            return {"status": "success", "event_processed": True}
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Webhook processing failed: {str(e)}")
    
    async def _create_payment_transaction(
        self,
        session_id: str,
        user_id: str,
        amount: float,
        currency: str,
        payment_status: str,
        metadata: Dict[str, Any],
        invoice_id: Optional[str] = None,
        service_package: Optional[str] = None
    ):
        """
        Create payment transaction record in database
        """
        db = await get_database()
        
        transaction_data = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": user_id,
            "amount": amount,
            "currency": currency,
            "payment_status": payment_status,
            "payment_method": "stripe",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": metadata
        }
        
        if invoice_id:
            transaction_data["invoice_id"] = invoice_id
            transaction_data["transaction_type"] = "invoice_payment"
        elif service_package:
            transaction_data["service_package"] = service_package
            transaction_data["transaction_type"] = "service_payment"
        
        await db.payment_transactions.insert_one(transaction_data)
    
    async def _update_payment_transaction(self, session_id: str, status_response: CheckoutStatusResponse):
        """
        Update payment transaction status
        """
        db = await get_database()
        
        # Check if transaction exists and hasn't been processed
        existing_transaction = await db.payment_transactions.find_one({"session_id": session_id})
        
        if not existing_transaction:
            return
        
        # Prevent duplicate processing for successful payments
        if existing_transaction.get("payment_status") == "paid" and status_response.payment_status == "paid":
            return
        
        update_data = {
            "payment_status": status_response.payment_status,
            "stripe_status": status_response.status,
            "amount_total": status_response.amount_total,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # If payment is successful, process related actions
        if status_response.payment_status == "paid" and existing_transaction.get("payment_status") != "paid":
            update_data["paid_at"] = datetime.utcnow().isoformat()
            
            # Process invoice payment
            if existing_transaction.get("invoice_id"):
                await self._process_invoice_payment(existing_transaction["invoice_id"])
            
            # Process service payment  
            if existing_transaction.get("service_package"):
                await self._process_service_payment(existing_transaction)
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
    
    async def _process_webhook_event(self, webhook_response):
        """
        Process webhook events and update transaction
        """
        db = await get_database()
        
        if webhook_response.session_id:
            update_data = {
                "payment_status": webhook_response.payment_status,
                "webhook_event_type": webhook_response.event_type,
                "webhook_event_id": webhook_response.event_id,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # If payment completed via webhook, mark as paid
            if webhook_response.payment_status == "paid":
                update_data["paid_at"] = datetime.utcnow().isoformat()
                
                # Get transaction to process related actions
                transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
                
                if transaction and transaction.get("payment_status") != "paid":
                    if transaction.get("invoice_id"):
                        await self._process_invoice_payment(transaction["invoice_id"])
                    
                    if transaction.get("service_package"):
                        await self._process_service_payment(transaction)
            
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": update_data}
            )
    
    async def _process_invoice_payment(self, invoice_id: str):
        """
        Process successful invoice payment
        """
        db = await get_database()
        
        # Update invoice status to paid
        await db.invoices.update_one(
            {"id": invoice_id},
            {
                "$set": {
                    "status": "paid",
                    "paid_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
    
    async def _process_service_payment(self, transaction: Dict[str, Any]):
        """
        Process successful service payment
        """
        db = await get_database()
        
        # Create service record or update client account
        service_data = {
            "id": str(uuid.uuid4()),
            "client_id": transaction["user_id"],
            "service_type": transaction["service_package"],
            "amount_paid": transaction["amount"],
            "currency": transaction["currency"],
            "status": "active",
            "purchased_at": datetime.utcnow().isoformat(),
            "transaction_id": transaction["id"]
        }
        
        await db.client_services.insert_one(service_data)


# Global payment service instance
payment_service = PaymentService()