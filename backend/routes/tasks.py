from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models.task import Task, TaskCreate, TaskUpdate, TaskResponse, TaskStatus
from models.user import UserRole
from utils.auth import get_current_user, require_role
from database import BaseRepository
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["Tasks"])
task_repo = BaseRepository("tasks")
client_repo = BaseRepository("clients")

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Create a new task for a client"""
    # Verify client exists and user has access
    client = await client_repo.find_by_id(task_data.clientId)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions for tax professional
    if current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this client"
        )
    
    task = Task(**task_data.dict())
    created_task = await task_repo.create(task.dict())
    
    return TaskResponse(**created_task)

@router.get("/{client_id}", response_model=List[TaskResponse])
async def get_client_tasks(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    status: Optional[TaskStatus] = Query(None),
    assigned_to: Optional[str] = Query(None)
):
    """Get all tasks for a client"""
    # Verify client exists and user has access
    client = await client_repo.find_by_id(client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if (current_user["role"] == UserRole.CLIENT and client["userId"] != current_user["user_id"]) or \
       (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view tasks for this client"
        )
    
    filter_dict = {"clientId": client_id}
    if status:
        filter_dict["status"] = status
    if assigned_to:
        filter_dict["assignedTo"] = assigned_to
    
    tasks = await task_repo.find_many(filter_dict)
    
    # Update overdue tasks
    for task in tasks:
        if (task["status"] == TaskStatus.PENDING and 
            task.get("dueDate") and 
            datetime.fromisoformat(task["dueDate"]) < datetime.utcnow()):
            task["status"] = TaskStatus.OVERDUE
            await task_repo.update_by_id(task["id"], {"status": TaskStatus.OVERDUE})
    
    return [TaskResponse(**task) for task in tasks]

@router.get("/task/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific task details"""
    task = await task_repo.find_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Verify client access
    client = await client_repo.find_by_id(task["clientId"])
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated client not found"
        )
    
    # Check permissions
    if (current_user["role"] == UserRole.CLIENT and client["userId"] != current_user["user_id"]) or \
       (current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this task"
        )
    
    return TaskResponse(**task)

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update task"""
    task = await task_repo.find_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Verify client access
    client = await client_repo.find_by_id(task["clientId"])
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated client not found"
        )
    
    # Check permissions
    can_update = False
    if current_user["role"] == UserRole.ADMIN:
        can_update = True
    elif current_user["role"] == UserRole.TAX_PROFESSIONAL and client["taxProfessionalId"] == current_user["user_id"]:
        can_update = True
    elif current_user["role"] == UserRole.CLIENT and client["userId"] == current_user["user_id"]:
        # Clients can only update status (mark as completed)
        if task_update.dict(exclude_unset=True).keys() <= {"status"}:
            can_update = True
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()
    
    # Set completion time if marking as completed
    if update_data.get("status") == TaskStatus.COMPLETED:
        update_data["completedAt"] = datetime.utcnow()
    
    updated_task = await task_repo.update_by_id(task_id, update_data)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update task"
        )
    
    return TaskResponse(**updated_task)

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(require_role(UserRole.TAX_PROFESSIONAL, UserRole.ADMIN))
):
    """Delete task"""
    task = await task_repo.find_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Verify client access for tax professional
    if current_user["role"] == UserRole.TAX_PROFESSIONAL:
        client = await client_repo.find_by_id(task["clientId"])
        if not client or client["taxProfessionalId"] != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this task"
            )
    
    success = await task_repo.delete_by_id(task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete task"
        )
    
    return {"message": "Task deleted successfully"}