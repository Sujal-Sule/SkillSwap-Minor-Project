import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

from .routers import auth, users, connections, sessions, chat, whiteboard

app = FastAPI(lifespan=lifespan, title="SkillSwap API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(connections.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(whiteboard.router)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to SkillSwap API"}
