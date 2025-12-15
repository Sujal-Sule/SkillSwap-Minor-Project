import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(override=True)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
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
