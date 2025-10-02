from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, date
import uuid

from models.bookkeeping import (
    BookkeepingService, BookkeepingTask, BookkeepingTimeEntry, BookkeepingReport,
    BookkeepingServiceCreate, BookkeepingTaskCreate, TimeEntryCreate, BookkeepingServiceUpdate,
    BookkeepingServiceType, BookkeepingStatus, BookkeepingFrequency
)
from utils.auth import get_current_user, require_roles
from database import get_database

router = APIRouter(prefix="/api/bookkeeping", tags=["bookkeeping"])

@router.post("/services", response_model=BookkeepingService)
async def create_bookkeeping_service(
    service_data: BookkeepingServiceCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new bookkeeping service for a client"""
    # Verify user is tax professional or admin
    if current_user["role"] not in ["tax_professional", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tax professionals can create bookkeeping services"
        )
    
    # Create the service
    service = BookkeepingService(
        **service_data.dict(),
        tax_professional_id=current_user["user_id"]
    )
    
    # Store in database
    service_dict = service.dict()
    service_dict['start_date'] = service_dict['start_date'].isoformat()
    if service_dict.get('end_date'):
        service_dict['end_date'] = service_dict['end_date'].isoformat()
    
    await db.bookkeeping_services.insert_one(service_dict)
    
    return service

@router.get("/services", response_model=List[BookkeepingService])
async def get_bookkeeping_services(
    client_id: Optional[str] = None,
    service_type: Optional[BookkeepingServiceType] = None,
    status: Optional[BookkeepingStatus] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get bookkeeping services based on filters"""
    query = {}
    
    # Filter based on user role
    if current_user["role"] == "client":
        # Clients can only see their own services
        query["client_id"] = current_user["user_id"]
    elif current_user["role"] == "tax_professional":
        # Tax professionals can see their assigned services
        query["tax_professional_id"] = current_user["user_id"]
        if client_id:
            query["client_id"] = client_id
    elif current_user["role"] == "admin":
        # Admins can see all services
        if client_id:
            query["client_id"] = client_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Apply additional filters
    if service_type:
        query["service_type"] = service_type
    if status:
        query["status"] = status
    
    # Query database
    services_cursor = db.bookkeeping_services.find(query)
    services = await services_cursor.to_list(length=None)
    
    # Convert dates back from ISO strings
    for service in services:
        if service.get('start_date'):
            service['start_date'] = datetime.fromisoformat(service['start_date']).date()
        if service.get('end_date'):
            service['end_date'] = datetime.fromisoformat(service['end_date']).date()
        if service.get('next_due_date'):
            service['next_due_date'] = datetime.fromisoformat(service['next_due_date']).date()
    
    return [BookkeepingService(**service) for service in services]

@router.get("/services/{service_id}", response_model=BookkeepingService)
async def get_bookkeeping_service(
    service_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get a specific bookkeeping service by ID"""
    service = await db.bookkeeping_services.find_one({"id": service_id})
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check permissions
    if (current_user["role"] == "client" and service["client_id"] != current_user["user_id"]) or \
       (current_user["role"] == "tax_professional" and service["tax_professional_id"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Convert dates back from ISO strings
    if service.get('start_date'):
        service['start_date'] = datetime.fromisoformat(service['start_date']).date()
    if service.get('end_date'):
        service['end_date'] = datetime.fromisoformat(service['end_date']).date()
    if service.get('next_due_date'):
        service['next_due_date'] = datetime.fromisoformat(service['next_due_date']).date()
    
    return BookkeepingService(**service)

@router.put("/services/{service_id}", response_model=BookkeepingService)
async def update_bookkeeping_service(
    service_id: str,
    service_update: BookkeepingServiceUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a bookkeeping service"""
    service = await db.bookkeeping_services.find_one({"id": service_id})
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check permissions
    if current_user["role"] not in ["tax_professional", "admin"] or \
       (current_user["role"] == "tax_professional" and service["tax_professional_id"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in service_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    
    # Convert dates to ISO strings
    if update_data.get('end_date'):
        update_data['end_date'] = update_data['end_date'].isoformat()
    if update_data.get('next_due_date'):
        update_data['next_due_date'] = update_data['next_due_date'].isoformat()
    
    # Update database
    await db.bookkeeping_services.update_one(
        {"id": service_id},
        {"$set": update_data}
    )
    
    # Return updated service
    updated_service = await db.bookkeeping_services.find_one({"id": service_id})
    
    # Convert dates back
    if updated_service.get('start_date'):
        updated_service['start_date'] = datetime.fromisoformat(updated_service['start_date']).date()
    if updated_service.get('end_date'):
        updated_service['end_date'] = datetime.fromisoformat(updated_service['end_date']).date()
    if updated_service.get('next_due_date'):
        updated_service['next_due_date'] = datetime.fromisoformat(updated_service['next_due_date']).date()
    
    return BookkeepingService(**updated_service)

@router.delete("/services/{service_id}")
async def delete_bookkeeping_service(
    service_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a bookkeeping service"""
    service = await db.bookkeeping_services.find_one({"id": service_id})
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check permissions
    if current_user["role"] not in ["tax_professional", "admin"] or \
       (current_user["role"] == "tax_professional" and service["tax_professional_id"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Delete the service
    await db.bookkeeping_services.delete_one({"id": service_id})
    
    return {"message": "Service deleted successfully"}

# Tasks endpoints
@router.post("/tasks", response_model=BookkeepingTask)
async def create_bookkeeping_task(
    task_data: BookkeepingTaskCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new bookkeeping task"""
    if current_user["role"] not in ["tax_professional", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tax professionals can create tasks"
        )
    
    # Get the service to verify ownership and get client_id
    service = await db.bookkeeping_services.find_one({"id": task_data.service_id})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if service["tax_professional_id"] != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create the task
    task = BookkeepingTask(
        **task_data.dict(),
        client_id=service["client_id"],
        tax_professional_id=current_user["user_id"]
    )
    
    # Store in database
    task_dict = task.dict()
    task_dict['due_date'] = task_dict['due_date'].isoformat()
    if task_dict.get('start_date'):
        task_dict['start_date'] = task_dict['start_date'].isoformat()
    if task_dict.get('completed_date'):
        task_dict['completed_date'] = task_dict['completed_date'].isoformat()
    
    await db.bookkeeping_tasks.insert_one(task_dict)
    
    return task

@router.get("/tasks", response_model=List[BookkeepingTask])
async def get_bookkeeping_tasks(
    service_id: Optional[str] = None,
    client_id: Optional[str] = None,
    status: Optional[BookkeepingStatus] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get bookkeeping tasks based on filters"""
    query = {}
    
    # Filter based on user role
    if current_user["role"] == "client":
        query["client_id"] = current_user["user_id"]
    elif current_user["role"] == "tax_professional":
        query["tax_professional_id"] = current_user["user_id"]
        if client_id:
            query["client_id"] = client_id
    elif current_user["role"] == "admin":
        if client_id:
            query["client_id"] = client_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Apply additional filters
    if service_id:
        query["service_id"] = service_id
    if status:
        query["status"] = status
    
    # Query database
    tasks_cursor = db.bookkeeping_tasks.find(query)
    tasks = await tasks_cursor.to_list(length=None)
    
    # Convert dates back from ISO strings
    for task in tasks:
        if task.get('due_date'):
            task['due_date'] = datetime.fromisoformat(task['due_date']).date()
        if task.get('start_date'):
            task['start_date'] = datetime.fromisoformat(task['start_date']).date()
        if task.get('completed_date'):
            task['completed_date'] = datetime.fromisoformat(task['completed_date']).date()
    
    return [BookkeepingTask(**task) for task in tasks]

# Time tracking endpoints
@router.post("/time-entries", response_model=BookkeepingTimeEntry)
async def create_time_entry(
    time_entry: TimeEntryCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new time entry for bookkeeping work"""
    if current_user["role"] not in ["tax_professional", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tax professionals can log time"
        )
    
    # Calculate amount if hourly rate is provided
    amount = None
    if time_entry.hourly_rate:
        amount = time_entry.hours * time_entry.hourly_rate
    
    entry = BookkeepingTimeEntry(
        **time_entry.dict(),
        tax_professional_id=current_user["user_id"],
        amount=amount
    )
    
    # Store in database
    entry_dict = entry.dict()
    entry_dict['date'] = entry_dict['date'].isoformat()
    
    await db.bookkeeping_time_entries.insert_one(entry_dict)
    
    return entry

@router.get("/time-entries", response_model=List[BookkeepingTimeEntry])
async def get_time_entries(
    client_id: Optional[str] = None,
    service_id: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get time entries with optional filters"""
    query = {}
    
    # Filter based on user role
    if current_user["role"] == "client":
        query["client_id"] = current_user["user_id"]
    elif current_user["role"] == "tax_professional":
        query["tax_professional_id"] = current_user["user_id"]
        if client_id:
            query["client_id"] = client_id
    elif current_user["role"] == "admin":
        if client_id:
            query["client_id"] = client_id
    
    # Apply additional filters
    if service_id:
        query["service_id"] = service_id
    
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from.isoformat()
        if date_to:
            date_query["$lte"] = date_to.isoformat()
        query["date"] = date_query
    
    # Query database
    entries_cursor = db.bookkeeping_time_entries.find(query)
    entries = await entries_cursor.to_list(length=None)
    
    # Convert dates back from ISO strings
    for entry in entries:
        if entry.get('date'):
            entry['date'] = datetime.fromisoformat(entry['date']).date()
    
    return [BookkeepingTimeEntry(**entry) for entry in entries]

@router.get("/dashboard")
async def get_bookkeeping_dashboard(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get bookkeeping dashboard data"""
    if current_user["role"] not in ["tax_professional", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    query = {"tax_professional_id": current_user["user_id"]}
    
    # Get service counts by status
    services_cursor = db.bookkeeping_services.find(query)
    services = await services_cursor.to_list(length=None)
    
    service_stats = {
        "total_services": len(services),
        "active_services": len([s for s in services if s.get("status") == "pending" or s.get("status") == "in_progress"]),
        "monthly_services": len([s for s in services if s.get("frequency") == "monthly"]),
        "quarterly_services": len([s for s in services if s.get("frequency") == "quarterly"])
    }
    
    # Get task counts
    tasks_cursor = db.bookkeeping_tasks.find({"tax_professional_id": current_user["user_id"]})
    tasks = await tasks_cursor.to_list(length=None)
    
    task_stats = {
        "total_tasks": len(tasks),
        "pending_tasks": len([t for t in tasks if t.get("status") == "pending"]),
        "in_progress_tasks": len([t for t in tasks if t.get("status") == "in_progress"]),
        "overdue_tasks": len([t for t in tasks if t.get("due_date") and 
                             datetime.fromisoformat(t["due_date"]).date() < date.today() and
                             t.get("status") != "completed"])
    }
    
    # Get recent time entries
    recent_entries_cursor = db.bookkeeping_time_entries.find(
        {"tax_professional_id": current_user["user_id"]}
    ).sort("created_at", -1).limit(10)
    recent_entries = await recent_entries_cursor.to_list(length=None)
    
    return {
        "service_stats": service_stats,
        "task_stats": task_stats,
        "recent_time_entries": len(recent_entries),
        "total_hours_this_month": sum(entry.get("hours", 0) for entry in recent_entries)
    }