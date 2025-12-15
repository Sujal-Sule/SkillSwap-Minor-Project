from fastapi import Header, HTTPException, Depends, status
from .firebase_setup import verify_token, get_firestore_db
from .models import UserInDB

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    token = authorization.split(" ")[1]
    decoded_token = verify_token(token)
    
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    uid = decoded_token['uid']
    db = get_firestore_db()
    
    # Firestore get
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        # User not found in DB but valid token
        return {"uid": uid, "email": decoded_token.get("email"), "name": decoded_token.get("name"), "picture": decoded_token.get("picture")}

    # Convert to dict
    user_data = user_doc.to_dict()
    return UserInDB(**user_data)
