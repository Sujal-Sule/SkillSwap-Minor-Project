from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
from ..database import get_database
from ..models import Message
import json
from datetime import datetime
from ..dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

class ConnectionManager:
    def __init__(self):
        # Map user_id to WebSocket list (user might have multiple tabs)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            txt = json.dumps(message, default=str)
            for connection in self.active_connections[user_id]:
                await connection.send_text(txt)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    # In a real app, validate token in query param or headers (headers tricky in JS WebSocket)
    await manager.connect(websocket, user_id)
    db = get_database()
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Message structure: {receiverId: str, text: str, ...}
            receiver_id = message_data.get('receiverId')
            text = message_data.get('text')
            
            if receiver_id and text:
                print(f"DEBUG: Processing message from {user_id} to {receiver_id}") # DEBUG
                
                msg_type = message_data.get('messageType', 'text')
                
                # Ephemeral messages (WebRTC signals) - Do not save to DB
                if msg_type == 'signal':
                    ephemeral_msg = {
                        "senderId": user_id,
                        "receiverId": receiver_id,
                        "text": text,
                        "timestamp": datetime.now().isoformat(),
                        "messageType": 'signal',
                        # We might need to pass the raw signal data if it was in text
                        # But since we use 'text' field to carry the payload, we just pass it through.
                    }
                    await manager.send_personal_message(ephemeral_msg, receiver_id)
                    continue

                # Save to DB
                new_message = {
                    "senderId": user_id,
                    "receiverId": receiver_id,
                    "text": text,
                    "timestamp": datetime.now(),
                    "messageType": msg_type,
                    "session": message_data.get('session'),
                    "isRead": False
                }
                res = await db.messages.insert_one(new_message)
                new_message['id'] = str(res.inserted_id)
                new_message['_id'] = str(res.inserted_id) # Simplify for frontend

                # Send to receiver
                print(f"DEBUG: Sending to receiver {receiver_id}") # DEBUG
                await manager.send_personal_message(new_message, receiver_id)
                # Send back to sender (confirmation/update UI)
                await manager.send_personal_message(new_message, user_id)
                
    except WebSocketDisconnect:
        print(f"DEBUG: WebSocket disconnect {user_id}") # DEBUG
        manager.disconnect(websocket, user_id)

@router.get("/", response_model=List[Message])
async def get_messages(current_user: dict = Depends(get_current_user)):
    # Note: Using dict for current_user because get_current_user returns UserInDB which matches dict structure
    db = get_database()
    cursor = db.messages.find({
        "$or": [{"senderId": current_user.id}, {"receiverId": current_user.id}]
    }).sort("timestamp", 1) # Oldest first
    messages = await cursor.to_list(length=1000)
    return [Message(**m) for m in messages]

@router.delete("/{partner_id}")
async def delete_conversation(partner_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    # Delete messages where (sender=me AND receiver=partner) OR (sender=partner AND receiver=me)
    await db.messages.delete_many({
        "$or": [
            {"senderId": current_user.id, "receiverId": partner_id},
            {"senderId": partner_id, "receiverId": current_user.id}
        ]
    })
    return {"status": "success"}

@router.put("/{partner_id}/read")
async def mark_conversation_read(partner_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    # Update messages where sender=partner AND receiver=me AND isRead=False
    await db.messages.update_many(
        {"senderId": partner_id, "receiverId": current_user.id, "isRead": False},
        {"$set": {"isRead": True}}
    )
    return {"status": "success"}
