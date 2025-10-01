from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class MessageAttachment(BaseModel):
    fileName: str
    fileSize: int
    filePath: str

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    clientId: str  # Reference to client relationship
    senderId: str  # User ID who sent the message
    receiverId: str  # User ID who should receive the message
    subject: Optional[str] = None
    message: str
    isRead: bool = False
    attachments: List[MessageAttachment] = []
    sentAt: datetime = Field(default_factory=datetime.utcnow)
    readAt: Optional[datetime] = None

class MessageCreate(BaseModel):
    clientId: str
    receiverId: str
    subject: Optional[str] = None
    message: str
    attachments: List[MessageAttachment] = []

class MessageResponse(BaseModel):
    id: str
    clientId: str
    senderId: str
    receiverId: str
    subject: Optional[str]
    message: str
    isRead: bool
    attachments: List[MessageAttachment]
    sentAt: datetime
    readAt: Optional[datetime]
    
    # These will be populated from user data
    senderName: Optional[str] = None
    receiverName: Optional[str] = None