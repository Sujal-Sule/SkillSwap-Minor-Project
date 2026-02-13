import os
import certifi
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load .env explicitly from backend directory
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, ".env"), override=True)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

if "localhost" in MONGODB_URL:
    logger.warning(f"Using default or localhost MongoDB URL. Ensure .env is loaded correctly.")
else:
    logger.info("Loaded MongoDB URL from .env")

DB_NAME = os.getenv("DB_NAME", "skillswap")

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
        print("Connected to MongoDB")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")

def get_database():
    return db.client[DB_NAME]
