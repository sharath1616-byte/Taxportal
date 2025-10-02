from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List, Dict
from enum import Enum
import uuid

class BookkeepingServiceType(str, Enum):
    MONTHLY_BOOKKEEPING = "monthly_bookkeeping"
    QUARTERLY_BOOKKEEPING = "quarterly_bookkeeping"
    PAYROLL_PROCESSING = "payroll_processing" 
    ACCOUNTS_PAYABLE = "accounts_payable"
    ACCOUNTS_RECEIVABLE = "accounts_receivable"
    FINANCIAL_REPORTING = "financial_reporting"
    BANK_RECONCILIATION = "bank_reconciliation"
    TAX_PREPARATION = "tax_preparation"
    AUDIT_PREPARATION = "audit_preparation"

class BookkeepingFrequency(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
    ONE_TIME = "one_time"

class BookkeepingStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class BookkeepingService(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    tax_professional_id: str
    service_type: BookkeepingServiceType
    frequency: BookkeepingFrequency
    status: BookkeepingStatus = BookkeepingStatus.PENDING
    
    # Service details
    service_name: str
    description: Optional[str] = None
    monthly_fee: Optional[float] = None
    hourly_rate: Optional[float] = None
    estimated_hours: Optional[int] = None
    
    # Dates
    start_date: date
    end_date: Optional[date] = None
    next_due_date: Optional[date] = None
    
    # Settings
    auto_invoice: bool = True
    include_reports: bool = True
    client_access_level: str = "view_only"  # view_only, limited_edit, full_access
    
    # Tracking
    hours_logged: float = 0.0
    total_invoiced: float = 0.0
    last_completed_date: Optional[date] = None
    
    # Metadata
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class BookkeepingTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    client_id: str
    tax_professional_id: str
    
    # Task details
    task_name: str
    description: Optional[str] = None
    task_type: BookkeepingServiceType
    status: BookkeepingStatus = BookkeepingStatus.PENDING
    priority: str = "medium"  # low, medium, high, urgent
    
    # Time tracking
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    start_date: Optional[date] = None
    due_date: date
    completed_date: Optional[date] = None
    
    # Assignment
    assigned_to: Optional[str] = None  # employee ID if delegated
    
    # Documents and notes
    attachments: List[str] = []  # file paths or URLs
    notes: Optional[str] = None
    client_notes: Optional[str] = None  # notes visible to client
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class BookkeepingReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    service_id: Optional[str] = None
    tax_professional_id: str
    
    # Report details
    report_type: str  # profit_loss, balance_sheet, cash_flow, trial_balance
    report_period: str  # monthly, quarterly, yearly
    period_start: date
    period_end: date
    
    # Data
    report_data: Dict = {}  # JSON data for the report
    summary: Optional[str] = None
    
    # Files
    pdf_path: Optional[str] = None
    excel_path: Optional[str] = None
    
    # Status
    status: str = "draft"  # draft, final, sent
    sent_to_client: bool = False
    sent_date: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class BookkeepingTimeEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: Optional[str] = None
    task_id: Optional[str] = None
    client_id: str
    tax_professional_id: str
    employee_id: Optional[str] = None
    
    # Time details
    date: date
    start_time: Optional[str] = None  # HH:MM format
    end_time: Optional[str] = None  # HH:MM format
    hours: float
    
    # Description
    description: str
    notes: Optional[str] = None
    
    # Billing
    billable: bool = True
    hourly_rate: Optional[float] = None
    amount: Optional[float] = None
    invoiced: bool = False
    invoice_id: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

# API Request/Response Models
class BookkeepingServiceCreate(BaseModel):
    client_id: str
    service_type: BookkeepingServiceType
    frequency: BookkeepingFrequency
    service_name: str
    description: Optional[str] = None
    monthly_fee: Optional[float] = None
    hourly_rate: Optional[float] = None
    estimated_hours: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    auto_invoice: bool = True
    include_reports: bool = True
    client_access_level: str = "view_only"
    notes: Optional[str] = None

class BookkeepingTaskCreate(BaseModel):
    service_id: str
    task_name: str
    description: Optional[str] = None
    task_type: BookkeepingServiceType
    priority: str = "medium"
    estimated_hours: Optional[float] = None
    due_date: date
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class TimeEntryCreate(BaseModel):
    service_id: Optional[str] = None
    task_id: Optional[str] = None
    client_id: str
    date: date
    hours: float
    description: str
    notes: Optional[str] = None
    billable: bool = True
    hourly_rate: Optional[float] = None

class BookkeepingServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[BookkeepingStatus] = None
    monthly_fee: Optional[float] = None
    hourly_rate: Optional[float] = None
    estimated_hours: Optional[int] = None
    end_date: Optional[date] = None
    next_due_date: Optional[date] = None
    auto_invoice: Optional[bool] = None
    include_reports: Optional[bool] = None
    client_access_level: Optional[str] = None
    notes: Optional[str] = None