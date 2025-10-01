from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models.message import Message, MessageCreate, MessageResponse
from models.user import UserRole
from utils.auth import get_current_user
from database import BaseRepository
from datetime import datetime

router = APIRouter(prefix="/messages", tags=["Messages"])
message_repo = BaseRepository("messages")
client_repo = BaseRepository("clients")
user_repo = BaseRepository("users")

@router.post("/", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message"""
    # Verify client exists and user has access
    client = await client_repo.find_by_id(message_data.clientId)
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
            detail="Not authorized to send messages for this client"
        )
    
    # Verify receiver exists
    receiver = await user_repo.find_by_id(message_data.receiverId)
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    message = Message(
        clientId=message_data.clientId,
        senderId=current_user["user_id"],
        receiverId=message_data.receiverId,
        subject=message_data.subject,
        message=message_data.message,
        attachments=message_data.attachments
    )
    
    created_message = await message_repo.create(message.dict())
    
    return await _enrich_message_response(created_message)

@router.get("/{client_id}", response_model=List[MessageResponse])
async def get_client_messages(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False)
):
    """Get all messages for a client"""
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
            detail="Not authorized to view messages for this client"
        )
    
    filter_dict = {
        "clientId": client_id,
        "$or": [
            {"senderId": current_user["user_id"]},
            {"receiverId": current_user["user_id"]}
        ]
    }
    
    if unread_only:
        filter_dict["isRead"] = False
        filter_dict["receiverId"] = current_user["user_id"]
    
    messages = await message_repo.collection.find(filter_dict)\
        .sort("sentAt", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    # Convert ObjectId to string and add id field
    for msg in messages:
        msg["id"] = str(msg.get("_id", msg.get("id")))
        if "_id" in msg:
            del msg["_id"]
    
    # Enrich with user names
    enriched_messages = []
    for msg in messages:
        enriched_msg = await _enrich_message_response(msg)
        enriched_messages.append(enriched_msg)
    
    return enriched_messages

@router.put("/{message_id}/read", response_model=MessageResponse)
async def mark_message_read(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark message as read"""
    message = await message_repo.find_by_id(message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only receiver can mark message as read
    if message["receiverId"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this message as read"
        )
    
    update_data = {
        "isRead": True,
        "readAt": datetime.utcnow()
    }
    
    updated_message = await message_repo.update_by_id(message_id, update_data)
    if not updated_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update message"
        )
    
    return await _enrich_message_response(updated_message)

@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete message (sender only)"""
    message = await message_repo.find_by_id(message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only sender or admin can delete message
    if message["senderId"] != current_user["user_id"] and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )
    
    success = await message_repo.delete_by_id(message_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete message"
        )
    
    return {"message": "Message deleted successfully"}

async def _enrich_message_response(message: dict) -> MessageResponse:
    """Add sender and receiver names to message response"""
    # Get sender info
    sender = await user_repo.find_by_id(message["senderId"])
    sender_name = f"{sender['profile']['firstName']} {sender['profile']['lastName']}" if sender else "Unknown User"
    
    # Get receiver info  
    receiver = await user_repo.find_by_id(message["receiverId"])
    receiver_name = f"{receiver['profile']['firstName']} {receiver['profile']['lastName']}" if receiver else "Unknown User"
    
    message.update({
        "senderName": sender_name,
        "receiverName": receiver_name
    })
    
    return MessageResponse(**message)