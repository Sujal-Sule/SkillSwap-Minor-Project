from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List
from ..firebase_setup import get_firestore_db
from ..database import get_database
from firebase_admin import firestore
from ..models import ConnectionRequest, UserInDB
from ..dependencies import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/connections", tags=["connections"])

@router.post("/request", response_model=ConnectionRequest)
async def send_connection_request(receiverId: str = Body(..., embed=True), current_user: UserInDB = Depends(get_current_user)):
    if receiverId == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
        
    db = get_database()
    
    # Check if existing request
    existing = await db.connections.find_one({
        "senderId": current_user.id,
        "receiverId": receiverId
    })
    if existing:
        return ConnectionRequest(**existing)
    
    # Check reverse request
    reverse = await db.connections.find_one({
        "senderId": receiverId,
        "receiverId": current_user.id
    })
    if reverse and reverse['status'] == 'pending':
         raise HTTPException(status_code=400, detail="They already sent you a request, accept that instead")

    new_request = ConnectionRequest(
        senderId=current_user.id,
        receiverId=receiverId,
        status="pending"
    )
    res = await db.connections.insert_one(new_request.model_dump(by_alias=True, exclude={"id"}))
    created = await db.connections.find_one({"_id": res.inserted_id})
    return ConnectionRequest(**created)

@router.get("/", response_model=List[ConnectionRequest])
async def get_my_connections(current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    # Get requests where I am sender or receiver
    cursor = db.connections.find({
        "$or": [{"senderId": current_user.id}, {"receiverId": current_user.id}]
    })
    requests = await cursor.to_list(length=100)
    return [ConnectionRequest(**r) for r in requests]

@router.put("/{request_id}/accept", response_model=ConnectionRequest)
async def accept_connection(request_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        req_oid = ObjectId(request_id)
    except:
        req_oid = request_id # Fallback if string ID

    req = await db.connections.find_one({"_id": req_oid})
    if not req:
         # Try finding by string id if stored as string
         req = await db.connections.find_one({"_id": request_id})
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req['receiverId'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your request to accept")
        
    await db.connections.update_one({"_id": req['_id']}, {"$set": {"status": "accepted"}})
    
    # Update users connections array
    # Update users connections array in Firestore
    fs_db = get_firestore_db()
    fs_db.collection('users').document(req['senderId']).update({"connections": firestore.ArrayUnion([req['receiverId']])})
    fs_db.collection('users').document(req['receiverId']).update({"connections": firestore.ArrayUnion([req['senderId']])})
    
    updated = await db.connections.find_one({"_id": req['_id']})
    return ConnectionRequest(**updated)

@router.delete("/{request_id}")
async def cancel_connection_request(request_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        req_oid = ObjectId(request_id)
    except:
        req_oid = request_id

    req = await db.connections.find_one({"_id": req_oid})
    if not req:
         req = await db.connections.find_one({"_id": request_id})
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req['senderId'] != current_user.id and req['receiverId'] != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
         
    await db.connections.delete_one({"_id": req['_id']})
    return {"message": "Request cancelled"}
