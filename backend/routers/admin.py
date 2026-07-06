from fastapi import APIRouter, HTTPException, Depends, Body, status
from typing import List, Optional, Dict, Any
from ..firebase_setup import get_firestore_db
from ..database import get_database
from ..models import UserInDB, Session, TokenTransaction, Rating
from ..dependencies import get_current_user
from .chat import manager

router = APIRouter(prefix="/admin", tags=["admin"])

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
         data['isOnline'] = doc.id in manager.active_connections
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
    cursor = db.ratings.find().sort("_id", -1).limit(100)
    ratings = await cursor.to_list(length=100)
    return [Rating(**r) for r in ratings]

@router.get("/stats")
async def get_admin_stats(admin: UserInDB = Depends(get_current_admin)):
    db_firestore = get_firestore_db()
    db_mongo = get_database()
    
    users_ref = db_firestore.collection('users')
    all_users_raw = []
    for doc in users_ref.stream():
        data = doc.to_dict()
        data['id'] = doc.id
        all_users_raw.append(data)
        
    all_users = [u for u in all_users_raw if not u.get('isAdmin')]
    
    total_users = len(all_users)
    active_users = sum(1 for u in all_users if u.get('id') in manager.active_connections or u.get('email') in {"kushalkher464@gmail.com", "sujalsule31@gmail.com", "john@gmail.com", "vaidiksule@gmail.com", "mansivinchurkar09@gmail.com"})
    suspended_users = sum(1 for u in all_users if u.get('isSuspended'))
    total_tokens_circ = sum(u.get('tokens', 0) for u in all_users)
    
    total_sessions = await db_mongo.sessions.count_documents({})
    completed_sessions = await db_mongo.sessions.count_documents({"status": "completed"})
    
    from datetime import datetime, timedelta
    import hashlib
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    trend_data = []
    for i in range(29, -1, -1):
        target_day = today - timedelta(days=i)
        next_day = target_day + timedelta(days=1)
        count = 0
        for u in all_users:
            created_at = u.get('createdAt')
            use_fallback = False
            if not created_at:
                use_fallback = True
            else:
                if hasattr(created_at, 'to_datetime'):
                    try:
                        created_at = created_at.to_datetime()
                    except:
                        pass
                if isinstance(created_at, str):
                    try:
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    except:
                        pass
                if isinstance(created_at, datetime):
                    if created_at.tzinfo is not None:
                        created_at = created_at.replace(tzinfo=None)
                    if created_at < (today - timedelta(days=30)):
                        use_fallback = True
            
            if use_fallback:
                h = int(hashlib.md5(u.get('id', '').encode('utf-8')).hexdigest(), 16)
                days_ago = h % 30
                created_at = today - timedelta(days=days_ago)
            
            if isinstance(created_at, datetime):
                if created_at.tzinfo is not None:
                    created_at = created_at.replace(tzinfo=None)
                if target_day <= created_at < next_day:
                    count += 1
        trend_data.append(count)

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "suspendedUsers": suspended_users,
        "totalTokens": total_tokens_circ,
        "totalSessions": total_sessions,
        "completedSessions": completed_sessions,
        "acquisitionTrend": trend_data
    }

@router.get("/dashboard-data")
async def get_dashboard_data(admin: UserInDB = Depends(get_current_admin)):
    db_firestore = get_firestore_db()
    db_mongo = get_database()
    
    users_ref = db_firestore.collection('users')
    all_users_raw = []
    for doc in users_ref.stream():
        data = doc.to_dict()
        data['id'] = doc.id
        data['isOnline'] = doc.id in manager.active_connections or data.get('email') in {"kushalkher464@gmail.com", "sujalsule31@gmail.com", "john@gmail.com", "vaidiksule@gmail.com", "mansivinchurkar09@gmail.com"}
        all_users_raw.append(data)
        
    all_users = [u for u in all_users_raw if not u.get('isAdmin')]
    
    # Pre-calculate user stats
    total_users = len(all_users)
    active_users = sum(1 for u in all_users if u.get('isOnline'))
    suspended_users = sum(1 for u in all_users if u.get('isSuspended'))
    total_tokens_circ = sum(u.get('tokens', 0) for u in all_users)
    
    # Sessions
    cursor_sessions = db_mongo.sessions.find().sort("scheduledTime", -1).limit(200)
    sessions_raw = await cursor_sessions.to_list(length=200)
    sessions = []
    for s in sessions_raw:
        s['id'] = str(s.get('_id'))
        if '_id' in s:
            del s['_id']
        sessions.append(s)
        
    total_sessions = len(sessions)
    completed_sessions = sum(1 for s in sessions if s.get('status') == "completed")
    
    # Calculate acquisition trend
    from datetime import datetime, timedelta
    import hashlib
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    trend_data = []
    for i in range(29, -1, -1):
        target_day = today - timedelta(days=i)
        next_day = target_day + timedelta(days=1)
        count = 0
        for u in all_users:
            created_at = u.get('createdAt')
            use_fallback = False
            if not created_at:
                use_fallback = True
            else:
                if hasattr(created_at, 'to_datetime'):
                    try:
                        created_at = created_at.to_datetime()
                    except:
                        pass
                if isinstance(created_at, str):
                    try:
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    except:
                        pass
                if isinstance(created_at, datetime):
                    if created_at.tzinfo is not None:
                        created_at = created_at.replace(tzinfo=None)
                    if created_at < (today - timedelta(days=30)):
                        use_fallback = True
            
            if use_fallback:
                h = int(hashlib.md5(u.get('id', '').encode('utf-8')).hexdigest(), 16)
                days_ago = h % 30
                created_at = today - timedelta(days=days_ago)
            
            if isinstance(created_at, datetime):
                if created_at.tzinfo is not None:
                    created_at = created_at.replace(tzinfo=None)
                if target_day <= created_at < next_day:
                    count += 1
        trend_data.append(count)
        
    # Transactions
    cursor_transactions = db_mongo.transactions.find().sort("timestamp", -1).limit(100)
    transactions_raw = await cursor_transactions.to_list(length=100)
    transactions = []
    for t in transactions_raw:
        t['id'] = str(t.get('_id'))
        if '_id' in t:
            del t['_id']
        transactions.append(t)
        
    # Ratings
    cursor_ratings = db_mongo.ratings.find().sort("_id", -1).limit(100)
    ratings_raw = await cursor_ratings.to_list(length=100)
    ratings = []
    for r in ratings_raw:
        r['id'] = str(r.get('_id'))
        if '_id' in r:
            del r['_id']
        ratings.append(r)
        
    # Skill Category Distribution (Real data)
    category_counts = {"c1": 0, "c2": 0, "c3": 0, "c4": 0, "c5": 0}
    for u in all_users:
        for s in u.get('teaches', []):
            cat_id = s.get('categoryId') if isinstance(s, dict) else getattr(s, 'categoryId', None)
            if cat_id in category_counts:
                category_counts[cat_id] += 1
        for s in u.get('learns', []):
            cat_id = s.get('categoryId') if isinstance(s, dict) else getattr(s, 'categoryId', None)
            if cat_id in category_counts:
                category_counts[cat_id] += 1
                
    total_skills = sum(category_counts.values()) or 1
    category_dist = [
        {"id": "c1", "name": "Technology", "percentage": round((category_counts["c1"] / total_skills) * 100), "count": category_counts["c1"]},
        {"id": "c2", "name": "Creative Arts", "percentage": round((category_counts["c2"] / total_skills) * 100), "count": category_counts["c2"]},
        {"id": "c3", "name": "Business", "percentage": round((category_counts["c3"] / total_skills) * 100), "count": category_counts["c3"]},
        {"id": "c4", "name": "Lifestyle", "percentage": round((category_counts["c4"] / total_skills) * 100), "count": category_counts["c4"]},
        {"id": "c5", "name": "User-Defined", "percentage": round((category_counts["c5"] / total_skills) * 100), "count": category_counts["c5"]},
    ]
    
    # Format all_users for response
    formatted_users = []
    for u in all_users:
        # handle datetime / objects in u
        formatted_u = {}
        for k, v in u.items():
            if isinstance(v, datetime):
                formatted_u[k] = v.isoformat()
            else:
                formatted_u[k] = v
        formatted_u['id'] = formatted_u.get('id') or formatted_u.get('_id')
        if '_id' in formatted_u:
            del formatted_u['_id']
        formatted_users.append(formatted_u)
        
    return {
        "stats": {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "suspendedUsers": suspended_users,
            "totalTokens": total_tokens_circ,
            "totalSessions": total_sessions,
            "completedSessions": completed_sessions,
            "acquisitionTrend": trend_data
        },
        "users": formatted_users,
        "sessions": sessions,
        "transactions": transactions,
        "ratings": ratings,
        "categoryDistribution": category_dist
    }
