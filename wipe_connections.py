import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

# Load env from backend/.env
load_dotenv("backend/.env", override=True)

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "skillswap")

async def wipe_connections():
    if not MONGODB_URL:
        print("Error: MONGODB_URL not found")
        return

    print("Connecting to DB...")
    client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    db = client[DB_NAME]
    
    print("Wiping ALL connections...")
    result = await db.connections.delete_many({})
    
    print(f"Deleted {result.deleted_count} connections.")
    client.close()

if __name__ == "__main__":
    asyncio.run(wipe_connections())
