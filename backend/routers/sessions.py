from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List
from ..database import get_database
from ..firebase_setup import get_firestore_db
from firebase_admin import firestore
from ..models import Session, UserInDB, TokenTransaction, Skill, Rating
from ..dependencies import get_current_user
from bson import ObjectId
from datetime import datetime
from .chat import manager

router = APIRouter(prefix="/sessions", tags=["sessions"])

async def notify_session_update(session_id: str, student_id: str, teacher_id: str, status: str):
    ws_message = {
        "id": f"system_session_update_{session_id}_{datetime.now().timestamp()}",
        "messageType": "session_card",
        "senderId": "system",
        "receiverId": student_id,
        "content": f"Session status updated to {status}",
        "timestamp": datetime.utcnow().isoformat(),
        "session": {
            "id": str(session_id),
            "studentId": student_id,
            "teacherId": teacher_id,
            "status": status
        }
    }
    try:
        await manager.send_personal_message(ws_message, student_id)
    except Exception:
        pass
    ws_message_teacher = dict(ws_message)
    ws_message_teacher["receiverId"] = teacher_id
    try:
        await manager.send_personal_message(ws_message_teacher, teacher_id)
    except Exception:
        pass

@router.get("/my", response_model=List[Session])
async def get_my_sessions(current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    cursor = db.sessions.find({
        "$or": [{"studentId": current_user.id}, {"teacherId": current_user.id}]
    })
    sessions = await cursor.to_list(length=100)
    return [Session(**s) for s in sessions]

@router.post("/", response_model=Session)
async def propose_session(session: Session = Body(...), current_user: UserInDB = Depends(get_current_user)):
    # Validate token balance
    if current_user.tokens < 1:
        raise HTTPException(status_code=400, detail="Insufficient tokens")
        
    db = get_database()
    
    # Overwrite ID and ensure proposer is current user
    session_dict = session.model_dump(by_alias=True, exclude={"id"})
    session_dict["proposerId"] = current_user.id
    # Default status proposed
    session_dict["status"] = "proposed" 
    
    res = await db.sessions.insert_one(session_dict)
    created = await db.sessions.find_one({"_id": res.inserted_id})
    return Session(**created)

@router.put("/{session_id}/accept", response_model=Session)
async def accept_session(session_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        sess_id = ObjectId(session_id)
    except:
        sess_id = session_id

    # verify teacher is current user (only teacher receives requests in this flow usually, or receiver)
    # logic depends on who proposed. If proposed by student, teacher accepts.
    session = await db.sessions.find_one({"_id": sess_id})
    if not session:
         session = await db.sessions.find_one({"_id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session['teacherId'] != current_user.id:
         raise HTTPException(status_code=403, detail="Only the teacher can accept the session")

    if session['status'] != 'proposed':
        return Session(**session) # Idempotency: If already accepted, just return it.
         
    # Deduct token from student
    fs_db = get_firestore_db()
    student_ref = fs_db.collection('users').document(session['studentId'])
    student_snap = student_ref.get()
    
    if not student_snap.exists:
         raise HTTPException(status_code=400, detail="Student user not found")
         
    student_data = student_snap.to_dict()
    if student_data.get('tokens', 0) < 1:
         raise HTTPException(status_code=400, detail="Student has insufficient tokens")
         
    # Update Session
    await db.sessions.update_one({"_id": sess_id}, {"$set": {"status": "scheduled"}})
    
    # Deduct Token usage in Firestore
    student_ref.update({"tokens": firestore.Increment(-1)})
    
    # Log Transaction
    transaction = TokenTransaction(
        userId=session['studentId'], # Assuming ID match
        type="spent",
        amount=1,
        description=f"Scheduled session",
        timestamp=datetime.now(),
        sessionId=str(sess_id)
    )
    await db.transactions.insert_one(transaction.model_dump(by_alias=True, exclude={"id"}))
    await notify_session_update(str(sess_id), session['studentId'], session['teacherId'], "scheduled")
    
    updated = await db.sessions.find_one({"_id": sess_id})
    return Session(**updated)

@router.put("/{session_id}/decline", response_model=Session)
async def decline_session(session_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        sess_id = ObjectId(session_id)
    except:
        sess_id = session_id

    session = await db.sessions.find_one({"_id": sess_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session['teacherId'] != current_user.id:
         raise HTTPException(status_code=403, detail="Only the teacher can decline the session")

    if session['status'] != 'proposed':
        raise HTTPException(status_code=400, detail="Cannot decline a session that is not pending")

    await db.sessions.update_one({"_id": sess_id}, {"$set": {"status": "declined"}})
    await notify_session_update(str(sess_id), session['studentId'], session['teacherId'], "declined")
    updated = await db.sessions.find_one({"_id": sess_id})
    return Session(**updated)

@router.put("/{session_id}/complete", response_model=Session)
async def complete_session(session_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        sess_id = ObjectId(session_id)
    except:
        sess_id = session_id

    session = await db.sessions.find_one({"_id": sess_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Either party can mark complete? Or just teacher? Let's say teacher or valid student check.
    # For now allow teacher primarily or system. 
    if session['teacherId'] != current_user.id and session['studentId'] != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized")

    if session['status'] == 'completed':
        return Session(**session)

    await db.sessions.update_one({"_id": sess_id}, {"$set": {"status": "completed"}})
    
    # Award token to teacher in Firestore
    print(f"DEBUG: Awarding token to teacher {session['teacherId']}")
    fs_db = get_firestore_db()
    fs_db.collection('users').document(session['teacherId']).update({"tokens": firestore.Increment(1)})

     # Log Transaction
    transaction = TokenTransaction(
        userId=session['teacherId'],
        type="earned",
        amount=1,
        description=f"Completed teaching session",
        timestamp=datetime.now(),
        sessionId=str(sess_id)
    )
    print(f"DEBUG: Logging transaction: {transaction.model_dump()}")
    await db.transactions.insert_one(transaction.model_dump(by_alias=True, exclude={"id"}))
    await notify_session_update(str(sess_id), session['studentId'], session['teacherId'], "completed")
    updated = await db.sessions.find_one({"_id": sess_id})
    return Session(**updated)

@router.put("/{session_id}/start", response_model=Session)
async def start_session(session_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        sess_id = ObjectId(session_id)
    except:
        sess_id = session_id

    session = await db.sessions.find_one({"_id": sess_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check authorization (Teacher or Student)
    if session['teacherId'] != current_user.id and session['studentId'] != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized")

    # If already started, just return current state
    if session.get('startedAt'):
        return Session(**session)

    # Set startedAt
    started_at = datetime.now()
    await db.sessions.update_one({"_id": sess_id}, {"$set": {"startedAt": started_at, "status": "active"}})
    await notify_session_update(str(sess_id), session['studentId'], session['teacherId'], "active")
    updated = await db.sessions.find_one({"_id": sess_id})
    return Session(**updated)

@router.post("/{session_id}/rate", response_model=Session)
async def rate_session(session_id: str, stars: int = Body(...), feedback: str = Body(...), current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    try:
        sess_id = ObjectId(session_id)
    except:
        sess_id = session_id

    session = await db.sessions.find_one({"_id": sess_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    is_student = session['studentId'] == current_user.id
    is_teacher = session['teacherId'] == current_user.id
    
    if not is_student and not is_teacher:
         raise HTTPException(status_code=403, detail="Not authorized to rate this session")

    # Check if already rated
    if (is_student and session.get('studentHasRated')) or (is_teacher and session.get('teacherHasRated')):
         raise HTTPException(status_code=400, detail="You have already rated this session")

    rating = Rating(
        sessionId=str(sess_id),
        raterId=current_user.id,
        ratedId=session['teacherId'] if is_student else session['studentId'],
        stars=stars,
        feedback=feedback
    )
    
    await db.ratings.insert_one(rating.model_dump(by_alias=True, exclude={"id"}))
    
    update_field = "studentHasRated" if is_student else "teacherHasRated"
    await db.sessions.update_one({"_id": sess_id}, {"$set": {update_field: True}})
    await notify_session_update(str(sess_id), session['studentId'], session['teacherId'], "completed")
    updated = await db.sessions.find_one({"_id": sess_id})
    return Session(**updated)
