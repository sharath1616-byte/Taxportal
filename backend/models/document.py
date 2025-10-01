from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class DocumentCategory(str, Enum):
    W2 = "w2"
    FORM_1099 = "1099"
    RECEIPT = "receipt"
    BANK_STATEMENT = "bank_statement"
    INVESTMENT = "investment"
    PREVIOUS_RETURN = "previous_return"
    OTHER = "other"

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    clientId: str
    fileName: str
    originalFileName: str
    fileType: str  # MIME type
    fileSize: int  # Size in bytes
    filePath: str  # Path where file is stored
    category: DocumentCategory
    description: Optional[str] = None
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
    uploadedBy: str  # User ID who uploaded

class DocumentCreate(BaseModel):
    clientId: str
    fileName: str
    originalFileName: str
    fileType: str
    fileSize: int
    filePath: str
    category: DocumentCategory
    description: Optional[str] = None
    uploadedBy: str

class DocumentResponse(BaseModel):
    id: str
    clientId: str
    fileName: str
    originalFileName: str
    fileType: str
    fileSize: int
    category: DocumentCategory
    description: Optional[str]
    uploadedAt: datetime
    uploadedBy: str
    downloadUrl: Optional[str] = None  # Will be generated dynamically