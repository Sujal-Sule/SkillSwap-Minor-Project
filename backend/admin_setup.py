from .firebase_setup import get_firestore_db
from .firebase_setup import get_firestore_db
import os

import bcrypt

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def setup_admin():
    try:
        db = get_firestore_db()
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return
    
    admin_email = "admin@skillswap.com"
    admin_id = "admin_user_id" # Fixed ID for simplicity
    
    # Check if admin exists
    users_ref = db.collection('users')
    query = users_ref.where('email', '==', admin_email).limit(1).stream()
    
    existing_admin = None
    for doc in query:
        existing_admin = doc
        break
        
    if existing_admin:
        print(f"Admin user {admin_email} already exists.")
        # Optional: Update password if needed
        # user_ref = users_ref.document(existing_admin.id)
        # user_ref.update({"isAdmin": True})
    else:
        print(f"Creating admin user {admin_email}...")
        hashed_pw = get_password_hash("admin1234")
        
        new_admin = {
            "id": admin_id,
            "name": "System Admin",
            "email": admin_email,
            "avatarUrl": "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
            "bio": "System Administrator",
            "teaches": [],
            "learns": [],
            "tokens": 999999,
            "connections": [],
            "isOnline": True,
            "isAdmin": True,
            "password": hashed_pw
        }
        
        db.collection('users').document(admin_id).set(new_admin)
        print("Admin user created successfully.")

if __name__ == "__main__":
    setup_admin()
