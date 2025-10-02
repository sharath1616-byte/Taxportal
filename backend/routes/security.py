from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any
from pydantic import BaseModel
import pyotp
import qrcode
import io
import base64
from datetime import datetime
import uuid

from ..utils.auth import get_current_user, require_roles
from ..database import get_database

router = APIRouter(prefix="/api/security", tags=["security"])

class TotpSetupRequest(BaseModel):
    app_name: str = "TaxPortal Pro"

class TotpVerifyRequest(BaseModel):
    token: str

class RecaptchaVerifyRequest(BaseModel):
    token: str
    action: str

@router.post("/2fa/setup")
async def setup_2fa(
    setup_data: TotpSetupRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Setup Two-Factor Authentication for user"""
    
    user_id = current_user["user_id"]
    
    # Generate secret key
    secret = pyotp.random_base32()
    
    # Create TOTP object
    totp = pyotp.TOTP(secret)
    
    # Generate provisioning URI
    provisioning_uri = totp.provisioning_uri(
        name=current_user["email"],
        issuer_name=setup_data.app_name
    )
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Store encrypted secret in database (you'll need to implement encryption)
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "totp_secret": secret,  # Should be encrypted in production
            "totp_enabled": False,  # Will be enabled after verification
            "updated_at": datetime.now()
        }}
    )
    
    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_code_base64}",
        "provisioning_uri": provisioning_uri,
        "backup_codes": [str(uuid.uuid4())[:8].upper() for _ in range(8)]
    }

@router.post("/2fa/verify")
async def verify_2fa(
    verify_data: TotpVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Verify and enable Two-Factor Authentication"""
    
    user_id = current_user["user_id"]
    
    # Get user's TOTP secret
    user = await db.users.find_one({"user_id": user_id})
    if not user or not user.get("totp_secret"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not setup for this user"
        )
    
    # Verify TOTP token
    totp = pyotp.TOTP(user["totp_secret"])
    if not totp.verify(verify_data.token, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP token"
        )
    
    # Enable 2FA for user
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "totp_enabled": True,
            "totp_verified_at": datetime.now(),
            "updated_at": datetime.now()
        }}
    )
    
    return {"message": "Two-Factor Authentication enabled successfully"}

@router.post("/2fa/disable")
async def disable_2fa(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Disable Two-Factor Authentication"""
    
    user_id = current_user["user_id"]
    
    # Remove 2FA settings
    await db.users.update_one(
        {"user_id": user_id},
        {"$unset": {
            "totp_secret": "",
            "totp_enabled": "",
            "totp_verified_at": ""
        },
        "$set": {
            "updated_at": datetime.now()
        }}
    )
    
    return {"message": "Two-Factor Authentication disabled"}

@router.get("/2fa/status")
async def get_2fa_status(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get 2FA status for current user"""
    
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    return {
        "enabled": user.get("totp_enabled", False) if user else False,
        "verified_at": user.get("totp_verified_at") if user else None
    }

@router.post("/recaptcha/verify")
async def verify_recaptcha(
    request: Request,
    verify_data: RecaptchaVerifyRequest
):
    """Verify reCAPTCHA token (for testing/debugging)"""
    
    import httpx
    import os
    
    secret_key = os.getenv("RECAPTCHA_SECRET_KEY")
    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="reCAPTCHA not configured"
        )
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": secret_key,
                "response": verify_data.token,
                "remoteip": request.client.host
            }
        )
        
        result = response.json()
        
        return {
            "success": result.get("success", False),
            "score": result.get("score", 0.0),
            "action": result.get("action"),
            "challenge_ts": result.get("challenge_ts"),
            "hostname": result.get("hostname"),
            "error_codes": result.get("error-codes", [])
        }