import firebase_admin
from firebase_admin import credentials, auth
import os
import json
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.abspath(__file__))

# Configure logging
import logging
logger = logging.getLogger("uvicorn.error")

# Load .env explicitly from backend directory to ensure we get the right config
load_dotenv(os.path.join(base_dir, ".env"))
# Priority 1: JSON content from env var (for Production/Render)
firebase_json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

if firebase_json_str:
    try:
        cred_dict = json.loads(firebase_json_str)
        cred = credentials.Certificate(cred_dict)
        logger.info("Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON env var")
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
        cred = None
else:
    # Priority 2: File path (Local dev)
    # Get path from env or default to serviceAccountKey.json in backend dir
    env_cred_path = os.getenv("FIREBASE_CREDENTIALS")
    
    if env_cred_path:
        # Check if it's an absolute path
        if os.path.isabs(env_cred_path):
            cred_path = env_cred_path
        else:
            # Try relative to backend dir first
            check_path = os.path.join(base_dir, env_cred_path)
            if os.path.exists(check_path):
                cred_path = check_path
            else:
                # Fallback to CWD-relative (default behavior)
                cred_path = os.path.abspath(env_cred_path)
    else:
        # Default to backend/serviceAccountKey.json
        cred_path = os.path.join(base_dir, "serviceAccountKey.json")

    if not os.path.exists(cred_path):
        logger.warning(f"Firebase credentials file not found at {cred_path}")
        cred = None
    else:
        logger.info(f"Loading Firebase credentials from {cred_path}")
        try:
            cred = credentials.Certificate(cred_path)
        except Exception as e:
            logger.error(f"Failed to load Firebase credentials: {e}")
            cred = None

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
