from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..services.email_service import email_service
from ..utils.auth import get_current_user, require_roles
from ..database import get_database

router = APIRouter()

# Pydantic models for email requests
class ClientInvitationRequest(BaseModel):
    client_email: EmailStr
    client_first_name: str
    client_last_name: str
    personal_message: Optional[str] = ""
    provider: Optional[str] = "sendgrid"

class EmailTestRequest(BaseModel):
    to_email: EmailStr
    subject: str
    content: str
    content_type: Optional[str] = "html"
    provider: Optional[str] = "sendgrid"

class NotificationRequest(BaseModel):
    to_email: EmailStr
    notification_type: str
    data: Dict[str, Any]
    provider: Optional[str] = "sendgrid"

class EmailResponse(BaseModel):
    success: bool
    message: str
    provider: str
    timestamp: str
    error: Optional[str] = None

@router.post("/send-client-invitation", response_model=EmailResponse)
async def send_client_invitation(
    request: ClientInvitationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_roles(["tax_professional", "admin"]))
):
    """
    Send invitation email to a client
    """
    try:
        # Generate invitation token and link
        invitation_token = str(uuid.uuid4())
        invitation_link = f"{request.client_email}?token={invitation_token}"
        
        client_name = f"{request.client_first_name} {request.client_last_name}"
        professional_name = current_user.get("name", "Your Tax Professional")
        
        # Store invitation in database
        db = await get_database()
        invitation_data = {
            "id": str(uuid.uuid4()),
            "token": invitation_token,
            "client_email": request.client_email,
            "client_name": client_name,
            "professional_id": current_user["id"], 
            "professional_name": professional_name,
            "personal_message": request.personal_message,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "accepted_at": None
        }
        
        await db.client_invitations.insert_one(invitation_data)
        
        # Send email in background
        background_tasks.add_task(
            send_invitation_email_task,
            request.client_email,
            client_name,
            professional_name,
            invitation_link,
            request.personal_message,
            request.provider
        )
        
        return EmailResponse(
            success=True,
            message=f"Invitation email queued for delivery to {request.client_email}",
            provider=request.provider,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invitation: {str(e)}")

@router.post("/send-test-email", response_model=EmailResponse)
async def send_test_email(
    request: EmailTestRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_roles(["tax_professional", "admin"]))
):
    """
    Send a test email (for testing email integration)
    """
    try:
        background_tasks.add_task(
            send_test_email_task,
            request.to_email,
            request.subject,
            request.content,
            request.content_type,
            request.provider
        )
        
        return EmailResponse(
            success=True,
            message=f"Test email queued for delivery to {request.to_email}",
            provider=request.provider,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")

@router.post("/send-notification", response_model=EmailResponse)
async def send_notification_email(
    request: NotificationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Send notification emails (document uploaded, message received, etc.)
    """
    try:
        background_tasks.add_task(
            send_notification_email_task,
            request.to_email,
            request.notification_type,
            request.data,
            request.provider
        )
        
        return EmailResponse(
            success=True,
            message=f"Notification email queued for delivery to {request.to_email}",
            provider=request.provider,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {str(e)}")

@router.get("/invitations")
async def get_sent_invitations(
    current_user: dict = Depends(require_roles(["tax_professional", "admin"]))
):
    """
    Get all invitations sent by the current professional
    """
    try:
        db = await get_database()
        invitations = await db.client_invitations.find(
            {"professional_id": current_user["id"]}
        ).to_list(length=None)
        
        return {
            "invitations": invitations,
            "total": len(invitations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve invitations: {str(e)}")

@router.post("/resend-invitation/{invitation_id}")
async def resend_invitation(
    invitation_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_roles(["tax_professional", "admin"]))
):
    """
    Resend an existing invitation
    """
    try:
        db = await get_database()
        invitation = await db.client_invitations.find_one({
            "id": invitation_id,
            "professional_id": current_user["id"]
        })
        
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")
        
        # Update invitation
        await db.client_invitations.update_one(
            {"id": invitation_id},
            {
                "$set": {
                    "status": "pending",
                    "resent_at": datetime.utcnow().isoformat(),
                    "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat()
                }
            }
        )
        
        # Resend email
        invitation_link = f"{invitation['client_email']}?token={invitation['token']}"
        
        background_tasks.add_task(
            send_invitation_email_task,
            invitation["client_email"],
            invitation["client_name"],
            invitation["professional_name"],
            invitation_link,
            invitation["personal_message"],
            "sendgrid"
        )
        
        return {"message": "Invitation resent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend invitation: {str(e)}")

# Background tasks
async def send_invitation_email_task(
    client_email: str, client_name: str, professional_name: str,
    invitation_link: str, personal_message: str, provider: str
):
    """Background task to send invitation email"""
    try:
        result = await email_service.send_client_invitation(
            client_email, client_name, professional_name,
            invitation_link, personal_message, provider
        )
        print(f"Invitation email result: {result}")
    except Exception as e:
        print(f"Failed to send invitation email: {e}")

async def send_test_email_task(
    to_email: str, subject: str, content: str, content_type: str, provider: str
):
    """Background task to send test email"""
    try:
        result = await email_service.send_email(to_email, subject, content, content_type, provider)
        print(f"Test email result: {result}")
    except Exception as e:
        print(f"Failed to send test email: {e}")

async def send_notification_email_task(
    to_email: str, notification_type: str, data: Dict[str, Any], provider: str
):
    """Background task to send notification email"""
    try:
        result = await email_service.send_notification_email(to_email, notification_type, data, provider)
        print(f"Notification email result: {result}")
    except Exception as e:
        print(f"Failed to send notification email: {e}")