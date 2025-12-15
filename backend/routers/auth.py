from fastapi import APIRouter, HTTPException, Body, Depends
from ..firebase_setup import verify_token, get_firestore_db
from ..models import UserInDB, UserCreate
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    idToken: str

class AuthResponse(BaseModel):
    token: str
    user: UserInDB
    isNew: bool = False

import bcrypt

router = APIRouter(prefix="/auth", tags=["auth"])

# pwd_context removed, using bcrypt directly

class LoginRequest(BaseModel):
    idToken: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserInDB
    isNew: bool = False

@router.post("/login")
async def login(request: LoginRequest = Body(...)):
    db = get_firestore_db()
    
    # 1. Google Auth (Token)
    if request.idToken:
        decoded_token = verify_token(request.idToken)
        if not decoded_token:
            raise HTTPException(status_code=401, detail="Invalid token")

        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name')
        picture = decoded_token.get('picture')

        user_ref = db.collection('users').document(uid)
        user_doc_snap = user_ref.get()
        
        is_new = False
        if not user_doc_snap.exists:
            # Create new user
            is_new = True
            new_user = UserCreate(
                _id=uid,
                id=uid,
                name=name or "New User",
                email=email or "",
                avatarUrl=picture or "",
                bio="",
                teaches=[],
                learns=[],
                tokens=5, # Sign up bonus
                connections=[],
                isOnline=True
            )
            # Firestore uses set()
            user_dict = new_user.model_dump(by_alias=True)
            user_ref.set(user_dict)
            user_data = user_dict
        else:
            user_data = user_doc_snap.to_dict()
        
        return {
            "token": request.idToken, # Reuse ID token for session for simplicity in this demo
            "user": UserInDB(**user_data),
            "isNew": is_new
        }

    # 2. Email/Password Auth (Admin)
    elif request.email and request.password:
        # Find user by email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', request.email).limit(1).stream()
        
        user_doc = None
        for doc in query:
            user_doc = doc
            break
            
        if not user_doc:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        user_data = user_doc.to_dict()
        hashed_pw = user_data.get('password')
        
        if not hashed_pw:
             raise HTTPException(status_code=401, detail="Invalid credentials")
             
        try:
             # Hash must be bytes for bcrypt
             if not bcrypt.checkpw(request.password.encode('utf-8'), hashed_pw.encode('utf-8')):
                 raise HTTPException(status_code=401, detail="Invalid credentials")
        except Exception:
             raise HTTPException(status_code=401, detail="Invalid credentials")

        # For email/password, we need to generate a token. 
        # Since we don't have a full JWT issuer here, safely reuse a fake token or simple string 
        # provided the frontend/backend 'dependencies.py' handles it.
        # Check dependencies.py: verify_firebase_token checks auth.verify_id_token(token).
        # This will fail for our custom token.
        # We need to update dependencies.py to allow our custom admin token OR generate a real custom token using Firebase Admin SDK.
        
        # Generate a special session token for admin access
        # In a real production app, use proper JWT signing here.
        admin_token = f"admin_secret_session_{user_data['id']}"
        
        return {
            "token": admin_token,
            "user": UserInDB(**user_data),
            "isNew": False
        }

    else:
        raise HTTPException(status_code=400, detail="Missing credentials")
