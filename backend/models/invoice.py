from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class InvoiceItem(BaseModel):
    description: str
    quantity: int = 1
    rate: float
    amount: float

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    clientId: str
    invoiceNumber: str
    items: List[InvoiceItem]
    subtotal: float
    taxAmount: float = 0.0
    totalAmount: float
    status: InvoiceStatus = InvoiceStatus.DRAFT
    issuedDate: datetime = Field(default_factory=datetime.utcnow)
    dueDate: datetime
    paidAt: Optional[datetime] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class InvoiceCreate(BaseModel):
    clientId: str
    items: List[InvoiceItem]
    dueDate: datetime
    notes: Optional[str] = None
    taxAmount: float = 0.0

class InvoiceUpdate(BaseModel):
    items: Optional[List[InvoiceItem]] = None
    status: Optional[InvoiceStatus] = None
    dueDate: Optional[datetime] = None
    notes: Optional[str] = None
    taxAmount: Optional[float] = None

class InvoiceResponse(BaseModel):
    id: str
    clientId: str
    invoiceNumber: str
    items: List[InvoiceItem]
    subtotal: float
    taxAmount: float
    totalAmount: float
    status: InvoiceStatus
    issuedDate: datetime
    dueDate: datetime
    paidAt: Optional[datetime]
    notes: Optional[str]
    createdAt: datetime
    updatedAt: datetime