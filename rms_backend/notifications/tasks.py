from rms_backend.celery_utils import custom_shared_task as shared_task
from django.contrib.auth import get_user_model
# pyrefly: ignore [missing-import]
from .models import Notification

@shared_task
def create_notification_task(recipient_id, notification_type, title, message):
    """
    Asynchronously creates a notification database record.
    Decoupled from request-response flow to optimize response times.
    """
    User = get_user_model()
    try:
        recipient = User.objects.get(id=recipient_id)
        notification = Notification.objects.create(
            recipient=recipient,
            type=notification_type,
            title=title,
            message=message
        )
        return f"Notification {notification.id} created for {recipient.email}"
    except User.DoesNotExist:
        return f"User with id {recipient_id} does not exist"


@shared_task
def send_interview_email_task(interview_id):
    """
    Sends notification emails to the candidate and all panelists assigned to the interview.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    subject = f"Interview Scheduled: {interview.role} - Round {interview.round}"

    # 1. Email to Candidate
    candidate = interview.application.candidate if interview.application else None
    if candidate:
        candidate_body = f"""Dear {candidate.get_full_name() or "Candidate"},

Your Round {interview.round} interview for the role of '{interview.role}' has been scheduled.

Details:
Date: {interview.date}
Time: {interview.time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Please be prepared.

Best regards,
South Point School Recruitment Team
"""
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=candidate_body,
            from_email="no-reply@southpoint.edu",
            recipient_list=[candidate.email],
            fail_silently=True,
        )

    # 2. Email to Panelists
    panelists = interview.panel.all()
    for panelist in panelists:
        panelist_body = f"""Dear {panelist.name},

You have been assigned as a panelist for the Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'.

Details:
Date: {interview.date}
Time: {interview.time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Best regards,
South Point School Recruitment Team
"""
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=panelist_body,
            from_email="no-reply@southpoint.edu",
            recipient_list=[panelist.email],
            fail_silently=True,
        )

    return f"Sent interview scheduling emails for {interview.interview_id}"
