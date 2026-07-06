import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_to_mongo, close_mongo_connection

import asyncio
from .services.scheduler import start_scheduler_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    scheduler_task = asyncio.create_task(start_scheduler_loop())
    yield
    # Shutdown
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass
    await close_mongo_connection()

from .routers import auth, users, connections, sessions, chat, whiteboard, notifications, turn

app = FastAPI(lifespan=lifespan, title="SkillSwap API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(connections.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(whiteboard.router)
app.include_router(notifications.router)
app.include_router(turn.router)


from .routers import admin
app.include_router(admin.router)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
    origin_without_slash = frontend_url.rstrip("/")
    if origin_without_slash != frontend_url:
        origins.append(origin_without_slash)

# Dynamically add host's local IP for mobile testing
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    local_ip = s.getsockname()[0]
    s.close()
    if local_ip:
        origins.append(f"http://{local_ip}:3000")
        origins.append(f"http://{local_ip}:5173")
except Exception:
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.head("/")
async def read_root():
    return {"message": "Welcome to SkillSwap API"}

@app.get("/health")
@app.head("/health")
async def health_check():
    return {"status": "ok", "message": "Server is healthy"}
