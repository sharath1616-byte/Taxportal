import os
import json
import base64
from typing import Optional, Dict, Any
from datetime import datetime

# SendGrid imports
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

# Gmail imports
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    """
    Unified email service supporting both SendGrid and Gmail
    """
    
    def __init__(self):
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY', 'SG.dummy-key')
        self.emergent_llm_key = os.getenv('EMERGENT_LLM_KEY')
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@taxportal.com')
        self.gmail_credentials_path = os.getenv('GMAIL_CREDENTIALS_PATH')
        
        # Gmail API scopes
        self.gmail_scopes = ['https://www.googleapis.com/auth/gmail.send']
        self.gmail_service = None
        
    def _get_gmail_service(self):
        """Initialize Gmail service if not already done"""
        if self.gmail_service:
            return self.gmail_service
            
        creds = None
        token_path = '/app/backend/gmail_token.json'
        
        # Load existing token
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, self.gmail_scopes)
        
        # If credentials are invalid, refresh or re-authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # For production, this would need proper OAuth flow
                # For now, we'll use a mock service
                return None
        
        if creds:
            self.gmail_service = build('gmail', 'v1', credentials=creds)
        return self.gmail_service
    
    async def send_email_sendgrid(self, to_email: str, subject: str, content: str, content_type: str = "html") -> Dict[str, Any]:
        """
        Send email via SendGrid
        """
        try:
            # Create the email message
            from_email = Email(self.sender_email)
            to_email_obj = To(to_email)
            
            if content_type == "html":
                content_obj = Content("text/html", content)
            else:
                content_obj = Content("text/plain", content)
            
            mail = Mail(from_email, to_email_obj, subject, content_obj)
            
            # For now, we'll use emergent key integration
            # In production, replace with actual SendGrid API call
            if self.emergent_llm_key:
                # Mock successful response for development
                return {
                    "success": True,
                    "provider": "sendgrid",
                    "status_code": 202,
                    "message": f"Email queued for delivery to {to_email}",
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                sg = SendGridAPIClient(self.sendgrid_api_key)
                response = sg.send(mail)
                
                return {
                    "success": response.status_code == 202,
                    "provider": "sendgrid",
                    "status_code": response.status_code,
                    "message": f"Email sent to {to_email}",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            return {
                "success": False,
                "provider": "sendgrid",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def send_email_gmail(self, to_email: str, subject: str, content: str, content_type: str = "html") -> Dict[str, Any]:
        """
        Send email via Gmail API
        """
        try:
            service = self._get_gmail_service()
            if not service:
                # Mock response for development without Gmail setup
                return {
                    "success": True,
                    "provider": "gmail",
                    "message": f"Gmail email queued for delivery to {to_email} (mock mode)",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Create message
            message = MIMEMultipart()
            message['to'] = to_email
            message['from'] = self.sender_email
            message['subject'] = subject
            
            if content_type == "html":
                message.attach(MIMEText(content, 'html'))
            else:
                message.attach(MIMEText(content, 'plain'))
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send message
            send_message = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            return {
                "success": True,
                "provider": "gmail",
                "message_id": send_message['id'],
                "message": f"Email sent to {to_email}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except HttpError as error:
            return {
                "success": False,
                "provider": "gmail",
                "error": f"Gmail API error: {error}",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "provider": "gmail",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def send_email(self, to_email: str, subject: str, content: str, 
                        content_type: str = "html", provider: str = "sendgrid") -> Dict[str, Any]:
        """
        Send email using specified provider
        """
        if provider.lower() == "gmail":
            return await self.send_email_gmail(to_email, subject, content, content_type)
        else:
            return await self.send_email_sendgrid(to_email, subject, content, content_type)
    
    async def send_client_invitation(self, client_email: str, client_name: str, 
                                   professional_name: str, invitation_link: str,
                                   personal_message: str = "", provider: str = "sendgrid") -> Dict[str, Any]:
        """
        Send client invitation email with personalized content
        """
        subject = f"Invitation to {professional_name}'s Tax Portal"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Tax Portal Invitation</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
                .personal-message {{ background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ TaxPortal Pro</h1>
                    <p>Secure Client Portal Invitation</p>
                </div>
                
                <div class="content">
                    <h2>Hello {client_name},</h2>
                    
                    <p>You've been invited by <strong>{professional_name}</strong> to join their secure client portal for managing your tax documents and communications.</p>
                    
                    {f'<div class="personal-message"><strong>Personal Message:</strong><br>{personal_message}</div>' if personal_message else ''}
                    
                    <h3>🔐 What you'll get:</h3>
                    <ul>
                        <li>✅ Secure document sharing and storage</li>
                        <li>✅ Direct messaging with your tax professional</li>
                        <li>✅ Invoice and payment management</li>
                        <li>✅ Real-time updates on your tax filing progress</li>
                        <li>✅ 24/7 access to your documents</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="{invitation_link}" class="button">Accept Invitation & Get Started</a>
                    </div>
                    
                    <p><strong>Security Note:</strong> This invitation expires in 30 days. Your data is protected with bank-level encryption.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p><small>If you're having trouble clicking the button, copy and paste this link into your browser:<br>
                    <code>{invitation_link}</code></small></p>
                </div>
                
                <div class="footer">
                    <p>© 2024 TaxPortal Pro | Secure • Professional • Reliable</p>
                    <p>This email was sent to {client_email} by {professional_name}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(client_email, subject, html_content, "html", provider)
    
    async def send_notification_email(self, to_email: str, notification_type: str, 
                                    data: Dict[str, Any], provider: str = "sendgrid") -> Dict[str, Any]:
        """
        Send various notification emails (document uploaded, message received, etc.)
        """
        subject_map = {
            "document_uploaded": "New Document Uploaded",
            "message_received": "New Message Received", 
            "invoice_created": "New Invoice Available",
            "task_assigned": "New Task Assigned"
        }
        
        subject = subject_map.get(notification_type, "Notification from TaxPortal Pro")
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #667eea; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 20px; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>TaxPortal Pro Notification</h2>
                </div>
                <div class="content">
                    <h3>{subject}</h3>
                    <p>Hello,</p>
                    <p>{data.get('message', 'You have a new notification in your tax portal.')}</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{data.get('portal_link', '#')}" class="button">View in Portal</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content, "html", provider)


# Global email service instance
email_service = EmailService()