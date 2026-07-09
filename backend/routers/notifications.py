from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Any
from datetime import datetime
from backend.models import Notification, PyObjectId
from backend.firebase_setup import get_firestore_db
from backend.dependencies import get_current_user

router = APIRouter()

@router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: Any = Depends(get_current_user)):
    """Fetch notifications for the logged-in user."""
    user_id = current_user.get('uid') if isinstance(current_user, dict) else current_user.id
    db = get_firestore_db()
    
    # In a real app with many notifications, we'd paginate.
    # For now, fetch all and sort by date desc.
    
    docs = db.collection('notifications').where('userId', '==', user_id).stream()
    notifications = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        notifications.append(Notification(**data))
    
    # Sort by createdAt desc
    notifications.sort(key=lambda x: x.createdAt, reverse=True)
    return notifications

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: Any = Depends(get_current_user)):
    """Mark a notification as read."""
    user_id = current_user.get('uid') if isinstance(current_user, dict) else current_user.id
    db = get_firestore_db()
    doc_ref = db.collection('notifications').document(notification_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    data = doc.to_dict()
    if data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    doc_ref.update({'isRead': True})
    return {"status": "success"}

@router.put("/notifications/read-all")
async def mark_all_read(current_user: Any = Depends(get_current_user)):
    """Mark all notifications for the user as read."""
    user_id = current_user.get('uid') if isinstance(current_user, dict) else current_user.id
    db = get_firestore_db()
    batch = db.batch()
    docs = db.collection('notifications').where('userId', '==', user_id).where('isRead', '==', False).stream()
    
    count = 0
    for doc in docs:
        batch.update(doc.reference, {'isRead': True})
        count += 1
        
    if count > 0:
        batch.commit()
        
    return {"status": "success", "count": count}

# Helper function to create notification (internal use)
def create_notification(user_id: str, type: str, message: str, reference_id: str = None):
    db = get_firestore_db()
    notification = Notification(
        userId=user_id,
        type=type,
        message=message,
        referenceId=reference_id,
        createdAt=datetime.utcnow(),
        isRead=False
    )
    # Convert to dict and handle datetime
    data = notification.dict(by_alias=True, exclude={'id'})
    
    db.collection('notifications').add(data)
