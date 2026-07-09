import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

MOCK_EMAIL_LOG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mock_emails.log")

def wrap_in_template(title: str, body_content: str) -> str:
    brand_color = "#0ea5e9"
    text_color = "#1e293b"
    muted_color = "#64748b"
    bg_color = "#f8fafc"
    card_bg = "#ffffff"
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: {bg_color};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: {text_color};
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      background-color: {bg_color};
      padding: 40px 20px;
      box-sizing: border-box;
    }}
    .card {{
      max-width: 540px;
      margin: 0 auto;
      background-color: {card_bg};
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }}
    .logo-container {{
      text-align: center;
      margin-bottom: 24px;
    }}
    .logo-mark {{
      display: inline-block;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      border-radius: 14px;
      margin-bottom: 12px;
      color: #ffffff;
      line-height: 48px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
    }}
    .logo-text {{
      font-size: 22px;
      font-weight: 800;
      color: {brand_color};
      letter-spacing: 1.5px;
      margin: 0;
      text-transform: uppercase;
    }}
    .logo-tagline {{
      font-size: 11px;
      color: {muted_color};
      margin: 4px 0 0 0;
      font-weight: 600;
    }}
    .divider {{
      height: 1px;
      background-color: #f1f5f9;
      margin: 24px 0;
    }}
    .content-body {{
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }}
    .content-body p {{
      margin: 0 0 16px 0;
    }}
    .content-body p:last-child {{
      margin: 0;
    }}
    .content-body strong {{
      color: #0f172a;
    }}
    .footer {{
      text-align: center;
      font-size: 11px;
      color: {muted_color};
      line-height: 1.6;
    }}
    .footer strong {{
      color: #475569;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo-container">
        <div class="logo-mark">⇄</div>
        <h1 class="logo-text">SkillSwap</h1>
        <p class="logo-tagline">Learn together, grow together</p>
      </div>
      <div class="divider"></div>
      <div class="content-body">
        {body_content}
      </div>
      <div class="divider"></div>
      <div class="footer">
        <p>You are receiving this notification because you are a registered user of SkillSwap.</p>
        <p style="margin-top: 10px;">
          To stop receiving these reminders, go to your <strong>Profile</strong> page on SkillSwap and turn off the <strong>Reminder Emails</strong> preference.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
"""

def send_email(to_email: str, subject: str, body_html: str, body_text: str = None):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # If text version not provided, use a simple strip-down of html or default
    if not body_text:
        body_text = body_html.replace("<br/>", "\n").replace("<p>", "").replace("</p>", "\n").replace("<strong>", "").replace("</strong>", "")

    # Wrap the html in our premium template
    full_html = wrap_in_template(subject, body_html)

    sent_successfully = False
    error_msg = None

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"SkillSwap <{smtp_user}>"
            msg["To"] = to_email

            part1 = MIMEText(body_text, "plain")
            part2 = MIMEText(full_html, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, to_email, msg.as_string())
            sent_successfully = True
        except Exception as e:
            error_msg = str(e)

    # Log to mock log file & stdout as fallback or record
    log_entry = (
        f"========================================================================\n"
        f"DATE: {datetime.now().isoformat()}\n"
        f"TO: {to_email}\n"
        f"SUBJECT: {subject}\n"
        f"SMTP SENT: {sent_successfully} (Error: {error_msg})\n"
        f"------------------------------------------------------------------------\n"
        f"TEXT BODY:\n{body_text}\n"
        f"========================================================================\n\n"
    )

    try:
        with open(MOCK_EMAIL_LOG, "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception:
        pass

    # Print to console for visibility
    print(f"\n[EMAIL SENT] To: {to_email} | Subject: {subject} | SMTP: {sent_successfully}")
    if error_msg:
        print(f"[EMAIL ERROR] {error_msg}")
    
    return sent_successfully
