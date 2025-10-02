from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    CLIENT = "client"
    TAX_PROFESSIONAL = "tax_professional" 
    ADMIN = "admin"

class UserProfile(BaseModel):
    firstName: str
    lastName: str
    phone: Optional[str] = None
    company: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password: str  # This will be hashed
    role: UserRole
    profile: UserProfile
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    profile: UserProfile

class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    profile: UserProfile
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse