from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    clientId: str
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    dueDate: Optional[datetime] = None
    assignedTo: Optional[str] = None  # User ID
    createdBy: str  # User ID
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    completedAt: Optional[datetime] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(BaseModel):
    clientId: str
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    dueDate: Optional[datetime] = None
    assignedTo: Optional[str] = None
    createdBy: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    dueDate: Optional[datetime] = None
    assignedTo: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    clientId: str
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    dueDate: Optional[datetime]
    assignedTo: Optional[str]
    createdBy: str
    createdAt: datetime
    completedAt: Optional[datetime]
    updatedAt: datetime