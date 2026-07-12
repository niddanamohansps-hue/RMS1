from rms_backend.celery_utils import custom_shared_task as shared_task
from django.contrib.auth import get_user_model
from django.conf import settings
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
def send_interview_email_task(interview_id, is_reschedule=False):
    """
    Sends notification emails to the candidate and all panelists assigned to the interview.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    if is_reschedule:
        subject = f"Interview Rescheduled: {interview.role} - Round {interview.round}"
    else:
        subject = f"Interview Scheduled: {interview.role} - Round {interview.round}"

    # 1. Email to Candidate
    candidate = interview.application.candidate if interview.application else None
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import JobApplication
        app = JobApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import GeneralApplication
        app = GeneralApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, preferred_role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=interview.candidate_name).first()

    if candidate:
        if is_reschedule:
            candidate_body = f"""Dear {candidate.get_full_name() or "Candidate"},

Your Round {interview.round} interview for the role of '{interview.role}' has been rescheduled.

Updated Details:
Date: {interview.date}
Time: {interview.time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Please be prepared.

Best regards,
South Point School Recruitment Team
"""
        else:
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
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=True,
        )

    # 2. Email to Panelists
    panelists = interview.panel.all()
    for panelist in panelists:
        if is_reschedule:
            panelist_body = f"""Dear {panelist.name},

The Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}', where you are assigned as a panelist, has been rescheduled.

Updated Details:
Date: {interview.date}
Time: {interview.time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Best regards,
South Point School Recruitment Team
"""
        else:
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
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[panelist.email],
            fail_silently=True,
        )

    return f"Sent interview scheduling/rescheduling emails for {interview.interview_id}"


@shared_task
def send_new_panelists_email_task(interview_id, new_panelist_ids):
    """
    Sends notification emails only to the newly assigned/added panelists.
    """
    from interviews.models import Interview, Panelist
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    subject = f"Assigned as Panelist: {interview.role} - Round {interview.round}"
    
    panelists = Panelist.objects.filter(id__in=new_panelist_ids)
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
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[panelist.email],
            fail_silently=True,
        )

    return f"Sent assignment email to newly added panelists for interview {interview.interview_id}"



@shared_task
def send_interview_reminder_task(interview_id):
    """
    Sends reminder emails to the candidate and all panelists assigned to the interview.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    subject = f"Reminder: Upcoming Interview for {interview.role} - Round {interview.round}"

    # 1. Email to Candidate
    candidate = interview.application.candidate if interview.application else None
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import JobApplication
        app = JobApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import GeneralApplication
        app = GeneralApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, preferred_role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=interview.candidate_name).first()

    if candidate:
        candidate_body = f"""Dear {candidate.get_full_name() or "Candidate"},

This is a reminder that your Round {interview.round} interview for the role of '{interview.role}' is scheduled.

Details:
Date: {interview.date}
Time: {interview.time}
Mode: {interview.mode}
{"Meeting Link: " + interview.meeting_link if interview.meeting_link else ""}

Please ensure you join on time.

Best regards,
South Point School Recruitment Team
"""
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=candidate_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=True,
        )

    # 2. Email to Panelists
    panelists = interview.panel.all()
    for panelist in panelists:
        panelist_body = f"""Dear {panelist.name},

This is a reminder that you are assigned as a panelist for the upcoming Round {interview.round} interview of {interview.candidate_name} for the role of '{interview.role}'.

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
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[panelist.email],
            fail_silently=True,
        )

    return f"Sent interview reminder emails for {interview.interview_id}"


@shared_task
def send_offer_email_task(offer_id):
    """
    Sends an offer letter notification email to the candidate.
    """
    from onboarding.models import Offer
    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return f"Offer with id {offer_id} does not exist"

    candidate = offer.candidate
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=offer.candidate_name).first()

    if not candidate:
        from applications.models import JobApplication, GeneralApplication
        app = JobApplication.objects.filter(candidate__first_name__iexact=offer.candidate_name.split()[0]).first()
        email = app.candidate.email if app else None
        if not email:
            app2 = GeneralApplication.objects.filter(candidate__first_name__iexact=offer.candidate_name.split()[0]).first()
            email = app2.candidate.email if app2 else None
        if not email:
            return f"No candidate email found for {offer.candidate_name}"
    else:
        email = candidate.email

    subject = f"Offer Letter Issued: {offer.role} - South Point School"
    body = f"""Dear {offer.candidate_name},

We are pleased to inform you that an offer letter has been issued to you for the position of '{offer.role}' at South Point School.

Offer Details:
Offer ID: {offer.offer_id}
Position: {offer.role}
CTC: {offer.ctc}
Expected Joining Date: {offer.joining_date}
Offer Expiry Date: {offer.expiry_date}

Please log in to your candidate dashboard to view the full offer letter details and submit your response (Accept / Decline).

Candidate Dashboard: http://localhost:5173/dashboard

Best regards,
South Point School Recruitment Team
"""

    from django.core.mail import send_mail
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )
    return f"Sent offer letter email to {email} for offer {offer.offer_id}"


@shared_task
def send_interview_completed_email_task(interview_id):
    """
    Sends email notification to the candidate with their overall average scores for completed rounds.
    """
    from interviews.models import Interview
    try:
        interview = Interview.objects.get(id=interview_id)
    except Interview.DoesNotExist:
        return f"Interview with id {interview_id} does not exist"

    # Find candidate
    candidate = interview.application.candidate if interview.application else None
    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import JobApplication
        app = JobApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        from applications.models import GeneralApplication
        app = GeneralApplication.objects.annotate(
            full_name=Concat('candidate__first_name', Value(' '), 'candidate__last_name')
        ).filter(full_name__iexact=interview.candidate_name, preferred_role=interview.role).first()
        if app:
            candidate = app.candidate

    if not candidate:
        from django.db.models import Value
        from django.db.models.functions import Concat
        candidate = get_user_model().objects.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        ).filter(full_name__iexact=interview.candidate_name).first()

    if not candidate:
        return f"Could not find candidate profile for email lookup: {interview.candidate_name}"

    # Get all completed rounds for this candidate and role
    completed_interviews = Interview.objects.filter(
        candidate_name=interview.candidate_name,
        role=interview.role,
        status="Completed"
    ).order_by("round")

    round_summaries = []
    for r_inv in completed_interviews:
        round_summaries.append(f"- Round {r_inv.round}: {r_inv.score}/100")
    rounds_text = "\n".join(round_summaries)

    subject = f"Interview Round Completed: {interview.role}"
    body = f"""Dear {candidate.get_full_name() or "Candidate"},

Thank you for participating in the interview process for the position of '{interview.role}'.

We have completed the evaluations for your Round {interview.round} interview. Here is a summary of your average scores:

{rounds_text}

We will get back to you soon with the next steps.

Best regards,
South Point School Recruitment Team
"""

    from django.core.mail import send_mail
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[candidate.email],
        fail_silently=True,
    )
    return f"Sent interview round completed email to candidate {candidate.email} for round {interview.round}"
