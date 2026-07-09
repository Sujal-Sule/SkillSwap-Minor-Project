from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated, Any
from datetime import datetime

# Helper for MongoDB _id
PyObjectId = Annotated[str, BeforeValidator(str)]

class Skill(BaseModel):
    id: str
    name: str
    categoryId: str

class UserBase(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    avatarUrl: str
    bio: str
    teaches: List[Skill] = []
    learns: List[Skill] = []
    tokens: int = 5
    connections: List[str] = []
    isOnline: bool = False
    isAdmin: bool = False
    isSuspended: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    password: Optional[str] = None # For email/password auth (hashed)
    reminderEmailsEnabled: Optional[bool] = True
    pushSubscriptions: List[dict] = []
    lastActive: Optional[str] = None

class UserCreate(UserBase):
    email: str

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: Optional[str] = None

class Session(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    studentId: str
    teacherId: str
    proposerId: Optional[str] = None
    skill: Skill
    scheduledTime: datetime
    status: str = "proposed" # proposed, scheduled, completed, cancelled, declined
    studentHasRated: bool = False
    teacherHasRated: bool = False
    duration: int = 60
    cost: int = 1
    startedAt: Optional[datetime] = None
    notified5Min: Optional[bool] = False
    notified30MinEmail: Optional[bool] = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Message(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    senderId: str
    receiverId: str
    text: str
    timestamp: datetime
    messageType: str = "text" # text, ai_suggestion, session_card
    session: Optional[Session] = None
    isRead: bool = False

class ConnectionRequest(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    senderId: str
    receiverId: str
    status: str = "pending" # pending, accepted, declined

class TokenTransaction(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userId: str
    type: str # earned, spent
    amount: int
    description: str
    timestamp: datetime
    sessionId: Optional[str] = None

class Rating(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    sessionId: str
    raterId: str
    ratedId: str
    stars: int
    feedback: str

class Notification(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userId: str # The recipient
    type: str # connection_request, connection_accepted, session_proposed, session_scheduled, session_cancelled, new_match, system
    message: str
    referenceId: Optional[str] = None # ID of the related object
    isRead: bool = False
    createdAt: datetime

