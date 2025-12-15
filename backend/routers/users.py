from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Optional
from ..firebase_setup import get_firestore_db
from ..database import get_database
from ..models import UserInDB, UserBase, TokenTransaction, Rating
from ..dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserInDB)
async def get_my_profile(current_user: UserInDB = Depends(get_current_user)):
    return current_user

# get_my_profile already returns current_user, which is injected via dependencies.py (already updated)
# So no change needed for get_my_profile

@router.put("/me", response_model=UserInDB)
async def update_my_profile(update_data: UserBase = Body(...), current_user: UserInDB = Depends(get_current_user)):
    db = get_firestore_db()
    update_dict = update_data.model_dump(exclude={"id", "email", "tokens"}, exclude_unset=True) 
    
    user_ref = db.collection('users').document(current_user.id)
    user_ref.update(update_dict)
    
    # Fetch updated
    updated_snap = user_ref.get()
    updated_user = updated_snap.to_dict()
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
        
    return UserInDB(**user_snap.to_dict())

@router.get("/", response_model=List[UserInDB])
async def search_users(skill: Optional[str] = Query(None)):
    db = get_firestore_db()
    
    # Firestore doesn't support regex search natively or simple "OR" queries on different fields easily without composite indexes.
    # For now, we will do client-side filtering (fetch all users or a limit).
    # Since this is a small hackathon app, fetching a small number of recent users is okay, or implementing a basic "array-contains" if structure supported it.
    # But our skills are in objects inside arrays (teaches: [{name: "Yoga"}]). Firestore querying is limited here.
    # Fallback: Search is tricky. We'll return all users (capped) and filter in Python if needed or just return list.
    
    users_ref = db.collection('users').limit(50)
    docs = users_ref.stream()
    
    users = []
    # Convert generator to list to safely iterate and debug if needed, though stream is iterable
    doc_list = list(docs)
    print(f"DEBUG: Found {len(doc_list)} users in Firestore")
    
    for doc in doc_list:
        try:
            user_data = doc.to_dict()
            user_data['id'] = doc.id # Ensure ID is present if not in dict
            
            # Basic in-memory filtering for the requested skill
            if skill:
                skill_lower = skill.lower()
                teaches = user_data.get('teaches', [])
                learns = user_data.get('learns', [])
                
                # Check if skill matches any teaches/learns name
                matches = any(s.get('name', '').lower().find(skill_lower) != -1 for s in teaches) or \
                          any(s.get('name', '').lower().find(skill_lower) != -1 for s in learns)
                if matches:
                     users.append(UserInDB(**user_data))
            else:
                users.append(UserInDB(**user_data))
        except Exception as e:
            print(f"Skipping invalid user {doc.id}: {e}")
            continue
            
    return users


