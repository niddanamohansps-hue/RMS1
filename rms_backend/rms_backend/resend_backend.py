import urllib.request
import urllib.error
import json
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings

class ResendEmailBackend(BaseEmailBackend):
    """
    A custom, zero-dependency Django email backend that sends emails 
    using Resend's HTTPS API rather than SMTP.
    
    Bypasses port blocks (25, 465, 587) on cloud platforms like Render's Free tier.
    """
    def send_messages(self, email_messages):
        if not email_messages:
            return 0
            
        api_key = getattr(settings, "RESEND_API_KEY", None)
        if not api_key:
            return 0

        sent_count = 0
        for message in email_messages:
            try:
                # Prepare payload for Resend API
                payload = {
                    "from": message.from_email,
                    "to": list(message.to),
                    "subject": message.subject,
                }
                
                # Check for HTML content
                html_content = None
                if hasattr(message, "alternatives") and message.alternatives:
                    for alternative in message.alternatives:
                        if alternative[1] == "text/html":
                            html_content = alternative[0]
                            break
                            
                if html_content:
                    payload["html"] = html_content
                else:
                    payload["text"] = message.body
                    
                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    },
                    method="POST"
                )
                
                with urllib.request.urlopen(req) as response:
                    if response.getcode() in (200, 201):
                        sent_count += 1
            except Exception as e:
                if not self.fail_silently:
                    raise e
        return sent_count
