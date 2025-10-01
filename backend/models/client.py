from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class ClientStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str  # Reference to User (client)
    taxProfessionalId: str  # Reference to User (tax professional)
    taxYear: int
    status: ClientStatus = ClientStatus.PENDING
    estimatedCompletion: Optional[datetime] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ClientCreate(BaseModel):
    userId: str
    taxProfessionalId: str
    taxYear: int
    estimatedCompletion: Optional[datetime] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    status: Optional[ClientStatus] = None
    estimatedCompletion: Optional[datetime] = None
    notes: Optional[str] = None
    taxYear: Optional[int] = None

class ClientResponse(BaseModel):
    id: str
    userId: str
    taxProfessionalId: str
    taxYear: int
    status: ClientStatus
    estimatedCompletion: Optional[datetime]
    notes: Optional[str]
    createdAt: datetime
    updatedAt: datetime
    
    # These will be populated from related models
    documentCount: Optional[int] = 0
    taskCount: Optional[int] = 0
    completedTaskCount: Optional[int] = 0
    invoiceCount: Optional[int] = 0