import firebase_admin
from firebase_admin import credentials, auth
import os
import json
from dotenv import load_dotenv

load_dotenv()

base_dir = os.path.dirname(os.path.abspath(__file__))
# Priority 1: JSON content from env var (for Production/Render)
firebase_json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

if firebase_json_str:
    try:
        cred_dict = json.loads(firebase_json_str)
        cred = credentials.Certificate(cred_dict)
    except json.JSONDecodeError as e:
        print(f"Error parsing FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
        cred = None
else:
    # Priority 2: File path (Local dev)
    cred_path = os.getenv("FIREBASE_CREDENTIALS", os.path.join(base_dir, "serviceAccountKey.json"))
    if not os.path.exists(cred_path):
        print(f"Warning: Firebase credentials file not found at {cred_path}")
        cred = None
    else:
        cred = credentials.Certificate(cred_path)

if cred:
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)

from firebase_admin import firestore

def get_firestore_db():
    if not cred:
         raise Exception("Firebase credentials not configured")
    return firestore.client()

def verify_token(id_token: str):
    if not cred:
        raise Exception("Firebase credentials not configured")
    try:
        if id_token.startswith("admin_secret_session_"):
             # Hack for Admin Auth
             uid = id_token.replace("admin_secret_session_", "")
             return {
                 "uid": uid,
                 "email": "admin@skillswap.com" if uid == "admin_user_id" else None,
                 "name": "Admin"
             }
        
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None
