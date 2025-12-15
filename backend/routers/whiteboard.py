from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json

router = APIRouter(prefix="/whiteboard", tags=["whiteboard"])

class WhiteboardManager:
    def __init__(self):
        # Map session_id to List[WebSocket]
        self.active_sessions: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = []
        self.active_sessions[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_sessions:
            if websocket in self.active_sessions[session_id]:
                self.active_sessions[session_id].remove(websocket)
            if not self.active_sessions[session_id]:
                del self.active_sessions[session_id]

    async def broadcast(self, message: str, session_id: str, sender_socket: WebSocket):
        if session_id in self.active_sessions:
            for connection in self.active_sessions[session_id]:
                if connection != sender_socket:
                    await connection.send_text(message)

manager = WhiteboardManager()

@router.websocket("/ws/{session_id}")
async def whiteboard_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Just relay the drawing data to others in the session
            await manager.broadcast(data, session_id, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
