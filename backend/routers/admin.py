from fastapi import APIRouter, HTTPException, Depends, Body, status
from typing import List, Optional, Dict, Any
from ..firebase_setup import get_firestore_db
from ..database import get_database
from ..models import UserInDB, Session, TokenTransaction, Rating
from ..dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

# Dependency to check for admin status
def get_current_admin(current_user: UserInDB = Depends(get_current_user)):
    if not current_user.isAdmin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/users", response_model=List[UserInDB])
async def get_all_users(admin: UserInDB = Depends(get_current_admin)):
    db = get_firestore_db()
    users_ref = db.collection('users')
    docs = users_ref.stream()
    
    users = []
    for doc in docs:
         data = doc.to_dict()
         data['id'] = doc.id
         # Ensure email is included (it should be in data if saved properly)
         users.append(UserInDB(**data))
         
    return users

@router.put("/users/{user_id}/suspend")
async def suspend_user(user_id: str, admin: UserInDB = Depends(get_current_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")
        
    db = get_firestore_db()
    user_ref = db.collection('users').document(user_id)
    doc = user_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    current_status = doc.to_dict().get('isSuspended', False)
    new_status = not current_status
    
    user_ref.update({"isSuspended": new_status})
    return {"message": f"User {'suspended' if new_status else 'activated'}", "isSuspended": new_status}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: UserInDB = Depends(get_current_admin)):
    if user_id == admin.id:
         raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    db = get_firestore_db()
    db.collection('users').document(user_id).delete()
    return {"message": "User deleted"}

@router.put("/users/{user_id}/tokens")
async def update_user_tokens(user_id: str, tokens: int = Body(..., embed=True), admin: UserInDB = Depends(get_current_admin)):
    db = get_firestore_db()
    db.collection('users').document(user_id).update({"tokens": tokens})
    return {"message": "Tokens updated", "tokens": tokens}

@router.get("/sessions", response_model=List[Session])
async def get_all_sessions(admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    cursor = db.sessions.find().sort("scheduledTime", -1).limit(200)
    sessions = await cursor.to_list(length=200)
    return [Session(**s) for s in sessions]

@router.get("/transactions", response_model=List[TokenTransaction])
async def get_all_transactions(admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    cursor = db.transactions.find().sort("timestamp", -1).limit(100)
    transactions = await cursor.to_list(length=100)
    return [TokenTransaction(**t) for t in transactions]

@router.get("/ratings", response_model=List[Rating])
async def get_all_ratings(admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    cursor = db.ratings.find().sort("_id", -1).limit(100) # Mongo ObjectId contains timestamp
    ratings = await cursor.to_list(length=100)
    return [Rating(**r) for r in ratings]

@router.get("/stats")
async def get_admin_stats(admin: UserInDB = Depends(get_current_admin)):
    db_firestore = get_firestore_db()
    db_mongo = get_database()
    
    # User Stats
    users_ref = db_firestore.collection('users')
    # Count efficiently? Firestore requires reading. For small scale this is fine.
    # For larger scale, backend should maintain counters.
    all_users_raw = [doc.to_dict() for doc in users_ref.stream()]
    # Filter out admins from stats
    all_users = [u for u in all_users_raw if not u.get('isAdmin')]
    
    total_users = len(all_users)
    active_users = sum(1 for u in all_users if u.get('isOnline'))
    suspended_users = sum(1 for u in all_users if u.get('isSuspended'))
    total_tokens_circ = sum(u.get('tokens', 0) for u in all_users)
    
    # Session Stats
    total_sessions = await db_mongo.sessions.count_documents({})
    completed_sessions = await db_mongo.sessions.count_documents({"status": "completed"})
    
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "suspendedUsers": suspended_users,
        "totalTokens": total_tokens_circ,
        "totalSessions": total_sessions,
        "completedSessions": completed_sessions
    }
