from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Optional
from ..firebase_setup import get_firestore_db
from ..database import get_database
from ..models import UserInDB, UserBase, TokenTransaction, Rating
from ..dependencies import get_current_user
from .chat import manager

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserInDB)
async def get_my_profile(current_user: UserInDB = Depends(get_current_user)):
    current_user.isOnline = True
    return current_user

@router.put("/me", response_model=UserInDB)
async def update_my_profile(update_data: UserBase = Body(...), current_user: UserInDB = Depends(get_current_user)):
    db = get_firestore_db()
    update_dict = update_data.model_dump(exclude={"id", "email", "tokens"}, exclude_unset=True) 
    
    user_ref = db.collection('users').document(current_user.id)
    user_ref.update(update_dict)
    
    updated_snap = user_ref.get()
    updated_user = updated_snap.to_dict()
    updated_user['id'] = updated_snap.id
    updated_user['isOnline'] = current_user.id in manager.active_connections
    return UserInDB(**updated_user)

@router.get("/transactions", response_model=List[TokenTransaction])
async def get_my_transactions(current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    cursor = db.transactions.find({"userId": current_user.id})
    transactions = await cursor.to_list(length=100)
    return [TokenTransaction(**t) for t in transactions]

@router.get("/{user_id}/ratings", response_model=List[Rating])
async def get_user_ratings(user_id: str):
    db = get_database()
    cursor = db.ratings.find({"ratedId": user_id})
    ratings = await cursor.to_list(length=100)
    return [Rating(**r) for r in ratings]

@router.get("/{user_id}", response_model=UserInDB)
async def get_user_profile(user_id: str):
    db = get_firestore_db()
    user_ref = db.collection('users').document(user_id)
    user_snap = user_ref.get()
    
    if not user_snap.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = user_snap.to_dict()
    user_data['id'] = user_snap.id
    user_data['isOnline'] = user_id in manager.active_connections or user_data.get('email') in {"kushalkher464@gmail.com", "sujalsule31@gmail.com", "john@gmail.com", "vaidiksule@gmail.com", "mansivinchurkar09@gmail.com"}
    return UserInDB(**user_data)

@router.get("/", response_model=List[UserInDB])
async def search_users(skill: Optional[str] = Query(None)):
    db = get_firestore_db()
    
    users_ref = db.collection('users').limit(50)
    docs = users_ref.stream()
    
    users = []
    doc_list = list(docs)
    
    for doc in doc_list:
        try:
            user_data = doc.to_dict()
            user_data['id'] = doc.id
            user_data['isOnline'] = doc.id in manager.active_connections or user_data.get('email') in {"kushalkher464@gmail.com", "sujalsule31@gmail.com", "john@gmail.com", "vaidiksule@gmail.com", "mansivinchurkar09@gmail.com"}
            
            if skill:
                skill_lower = skill.lower()
                teaches = user_data.get('teaches', [])
                learns = user_data.get('learns', [])
                
                matches = any(s.get('name', '').lower().find(skill_lower) != -1 for s in teaches) or \
                          any(s.get('name', '').lower().find(skill_lower) != -1 for s in learns)
                if matches:
                     users.append(UserInDB(**user_data))
            else:
                users.append(UserInDB(**user_data))
        except Exception as e:
            continue
            
    return users

@router.post("/subscribe-push")
async def subscribe_push(subscription: dict = Body(...), current_user: UserInDB = Depends(get_current_user)):
    db = get_firestore_db()
    user_ref = db.collection('users').document(current_user.id)
    user_snap = user_ref.get()
    if not user_snap.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_snap.to_dict()
    subs = user_data.get("pushSubscriptions", [])
    
    # Avoid duplicate subscriptions by checking the endpoint
    if not any(s.get("endpoint") == subscription.get("endpoint") for s in subs):
        subs.append(subscription)
        user_ref.update({"pushSubscriptions": subs})
        
    return {"status": "success"}

@router.post("/unsubscribe-push")
async def unsubscribe_push(subscription: dict = Body(...), current_user: UserInDB = Depends(get_current_user)):
    db = get_firestore_db()
    user_ref = db.collection('users').document(current_user.id)
    user_snap = user_ref.get()
    if not user_snap.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = user_snap.to_dict()
    subs = user_data.get("pushSubscriptions", [])
    
    # Filter out subscription with matching endpoint
    new_subs = [s for s in subs if s.get("endpoint") != subscription.get("endpoint")]
    if len(new_subs) < len(subs):
        user_ref.update({"pushSubscriptions": new_subs})
        
    return {"status": "success"}
