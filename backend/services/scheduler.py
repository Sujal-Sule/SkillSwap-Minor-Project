import asyncio
import os
import json
from datetime import datetime, timedelta
from pywebpush import webpush, WebPushException
from backend.database import get_database
from backend.firebase_setup import get_firestore_db
from backend.routers.notifications import create_notification
from backend.routers.chat import manager
from backend.services.email_service import send_email

def send_web_push(user_id: str, title: str, body: str, url: str = "/dashboard"):
    firestore_db = get_firestore_db()
    user_doc = firestore_db.collection("users").document(user_id).get()
    if not user_doc.exists:
        return
    user_data = user_doc.to_dict()
    subs = user_data.get("pushSubscriptions", [])
    if not subs:
        return

    private_key_pem = """-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgbfj9DfthONl75PLL
CGViFN5B4cYyxFl8mZbKa5aa2KuhRANCAATcrgGcn/NadLFkIqvzXiQdt57OYbfe
YzjTi7v3STAYaNq4b17hRVCLmFW6LP3BtsJYd07zd5ir0FdVSFx2E0l3
-----END PRIVATE KEY-----"""

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url
    })

    # Try to send push notification to all registered subscriptions for this user
    for sub in list(subs):
        try:
            webpush(
                subscription_info=sub,
                data=payload,
                vapid_private_key=private_key_pem,
                vapid_claims={"sub": "mailto:admin@skillswap.sujalsule.in"}
            )
        except WebPushException as ex:
            if ex.response and ex.response.status_code in (410, 404):
                print(f"[PUSH] Subscription expired/invalid, removing: {sub.get('endpoint')}")
                try:
                    subs = [s for s in subs if s.get("endpoint") != sub.get("endpoint")]
                    firestore_db.collection("users").document(user_id).update({"pushSubscriptions": subs})
                except Exception:
                    pass
        except Exception as e:
            print(f"[PUSH ERROR] Failed to send push to {sub.get('endpoint')}: {e}")

async def check_upcoming_sessions():
    db = get_database()
    firestore_db = get_firestore_db()
    now = datetime.utcnow()

    # Query sessions that are scheduled
    cursor = db.sessions.find({"status": "scheduled"})
    sessions_list = await cursor.to_list(length=100)

    for s in sessions_list:
        session_id = str(s["_id"])
        scheduled_time = s.get("scheduledTime")
        if not scheduled_time:
            continue

        student_id = s.get("studentId")
        teacher_id = s.get("teacherId")
        skill_name = s.get("skill", {}).get("name", "Skill Session")

        # Time remaining until session starts (in seconds)
        time_until_session = (scheduled_time - now).total_seconds()

        # 1. 5 Minutes In-App & WebSocket notification
        # Check if session is starting in <= 5 minutes (300 seconds) and >= 0 seconds
        if 0 <= time_until_session <= 300 and not s.get("notified5Min"):
            print(f"[SCHEDULER] Sending 5-min notification for session {session_id}")
            
            # Create in-app notifications
            create_notification(
                user_id=student_id,
                type="session_reminder",
                message=f"Reminder: Your session for {skill_name} starts in less than 5 minutes!",
                reference_id=session_id
            )
            create_notification(
                user_id=teacher_id,
                type="session_reminder",
                message=f"Reminder: Your session for {skill_name} starts in less than 5 minutes!",
                reference_id=session_id
            )

            # Send Web Push Notifications
            try:
                send_web_push(
                    user_id=student_id,
                    title="Upcoming Session!",
                    body=f"Your session for {skill_name} starts in less than 5 minutes!",
                    url="/dashboard"
                )
            except Exception:
                pass
            try:
                send_web_push(
                    user_id=teacher_id,
                    title="Upcoming Session!",
                    body=f"Your session for {skill_name} starts in less than 5 minutes!",
                    url="/dashboard"
                )
            except Exception:
                pass

            # Send real-time WebSocket notifications
            ws_msg = {
                "id": f"system_session_reminder_5m_{session_id}_{datetime.now().timestamp()}",
                "messageType": "text",
                "senderId": "system",
                "content": f"Reminder: Your session for {skill_name} starts in less than 5 minutes!",
                "timestamp": datetime.utcnow().isoformat(),
            }
            try:
                ws_msg_student = dict(ws_msg)
                ws_msg_student["receiverId"] = student_id
                await manager.send_personal_message(ws_msg_student, student_id)
            except Exception:
                pass
            try:
                ws_msg_teacher = dict(ws_msg)
                ws_msg_teacher["receiverId"] = teacher_id
                await manager.send_personal_message(ws_msg_teacher, teacher_id)
            except Exception:
                pass

            # Update database flag
            await db.sessions.update_one(
                {"_id": s["_id"]},
                {"$set": {"notified5Min": True}}
            )

        # 2. 30 Minutes Email notification (only if scheduled > 5 hours in advance)
        # Check if session is starting in <= 30 minutes (1800 seconds) and >= 0 seconds
        if 0 <= time_until_session <= 1800 and not s.get("notified30MinEmail"):
            created_at = s.get("createdAt")
            is_long_hours_later = True
            if created_at:
                is_long_hours_later = (scheduled_time - created_at) > timedelta(hours=5)

            if is_long_hours_later:
                print(f"[SCHEDULER] Sending 30-min email reminder for session {session_id}")
                
                # Fetch user profiles from Firestore
                student_doc = firestore_db.collection("users").document(student_id).get()
                teacher_doc = firestore_db.collection("users").document(teacher_id).get()

                student_data = student_doc.to_dict() if student_doc.exists else None
                teacher_data = teacher_doc.to_dict() if teacher_doc.exists else None

                student_name = student_data.get("name", "Student") if student_data else "Student"
                teacher_name = teacher_data.get("name", "Teacher") if teacher_data else "Teacher"

                student_email = student_data.get("email") if student_data else None
                teacher_email = teacher_data.get("email") if teacher_data else None

                # Send if reminder emails are enabled (default True)
                student_enabled = student_data.get("reminderEmailsEnabled", True) if student_data else True
                teacher_enabled = teacher_data.get("reminderEmailsEnabled", True) if teacher_data else True

                if student_email and student_enabled:
                    subject = f"Upcoming Session: {skill_name} in 30 minutes"
                    html = (
                        f"<p>Hi {student_name},</p>"
                        f"<p>This is a reminder that your SkillSwap session for <strong>{skill_name}</strong> (with {teacher_name}) is starting in 30 minutes!</p>"
                        f"<p>Please ensure you are online and ready to connect.</p>"
                        f"<p style='color:#777; font-size:11px; margin-top:20px; border-top:1px solid #ddd; padding-top:10px;'>"
                        f"To stop receiving these reminders, go to your Profile page on SkillSwap and turn off 'Reminder Emails'."
                        f"</p>"
                    )
                    send_email(to_email=student_email, subject=subject, body_html=html)

                if teacher_email and teacher_enabled:
                    subject = f"Upcoming Session: {skill_name} in 30 minutes"
                    html = (
                        f"<p>Hi {teacher_name},</p>"
                        f"<p>This is a reminder that your SkillSwap session for <strong>{skill_name}</strong> (with {student_name}) is starting in 30 minutes!</p>"
                        f"<p>Please ensure you are online and ready to connect.</p>"
                        f"<p style='color:#777; font-size:11px; margin-top:20px; border-top:1px solid #ddd; padding-top:10px;'>"
                        f"To stop receiving these reminders, go to your Profile page on SkillSwap and turn off 'Reminder Emails'."
                        f"</p>"
                    )
                    send_email(to_email=teacher_email, subject=subject, body_html=html)

            # Update flag in MongoDB
            await db.sessions.update_one(
                {"_id": s["_id"]},
                {"$set": {"notified30MinEmail": True}}
            )

async def send_user_reengagement_emails():
    firestore_db = get_firestore_db()
    users_ref = firestore_db.collection("users")
    docs = users_ref.stream()
    now = datetime.utcnow()

    for doc in docs:
        user_data = doc.to_dict()
        user_id = doc.id

        # Skip if they turned reminders off (default True)
        enabled = user_data.get("reminderEmailsEnabled", True)
        if not enabled:
            continue

        email = user_data.get("email")
        if not email:
            continue

        # 1. Inactivity Check (only users inactive on the app for > 30 days)
        last_active_str = user_data.get("lastActive")
        last_active = None
        if last_active_str:
            try:
                last_active = datetime.fromisoformat(last_active_str)
            except Exception:
                pass
        
        if not last_active:
            created_at = user_data.get("createdAt")
            if isinstance(created_at, datetime):
                last_active = created_at
            elif isinstance(created_at, str):
                try:
                    last_active = datetime.fromisoformat(created_at)
                except Exception:
                    pass

        if not last_active:
            last_active = now

        inactive_seconds = (now - last_active).total_seconds()
        if inactive_seconds <= 30 * 86400:
            continue

        # 2. Check last sent time (send re-engagement emails at most every 2 months / 60 days)
        last_sent_str = user_data.get("lastReminderEmailSent")
        should_send = False
        if not last_sent_str:
            should_send = True
        else:
            try:
                if isinstance(last_sent_str, datetime):
                    last_sent = last_sent_str
                else:
                    last_sent = datetime.fromisoformat(last_sent_str)
                
                # Check if 60 days have passed
                if (now - last_sent).total_seconds() > 60 * 86400:
                    should_send = True
            except Exception:
                should_send = True

        if should_send:
            name = user_data.get("name", "SkillSwapper")
            subject = "Stay connected and grow your skills with SkillSwap!"
            html = (
                f"<p>Hi {name},</p>"
                f"<p>We miss you on SkillSwap! Connect with other mentors and learners to swap skills and earn tokens.</p>"
                f"<p>Log in today to check out new users, propose sessions, or chat with your connections.</p>"
                f"<p><strong>Unsubscribe / Settings Instructions:</strong></p>"
                f"<p>If you want to turn off these reminder emails, you can easily do so by following these steps:</p>"
                f"<ol>"
                f"<li>Log into your SkillSwap account.</li>"
                f"<li>Navigate to your <strong>Profile</strong> page.</li>"
                f"<li>Toggle off the <strong>Reminder Emails</strong> option.</li>"
                f"</ol>"
                f"<p style='color:#777; font-size:11px; margin-top:20px; border-top:1px solid #ddd; padding-top:10px;'>"
                f"You are receiving this because you signed up for SkillSwap."
                f"</p>"
            )
            send_email(to_email=email, subject=subject, body_html=html)

            # Update sent time
            users_ref.document(user_id).update({
                "lastReminderEmailSent": now.isoformat()
            })

async def start_scheduler_loop():
    # Wait for MongoDB initialization
    await asyncio.sleep(5)
    print("[SCHEDULER] Background loop started.")
    while True:
        try:
            await check_upcoming_sessions()
            await send_user_reengagement_emails()
        except Exception as e:
            print(f"[SCHEDULER ERROR] {e}")
        # Run check every 60 seconds
        await asyncio.sleep(60)
