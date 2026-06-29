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
