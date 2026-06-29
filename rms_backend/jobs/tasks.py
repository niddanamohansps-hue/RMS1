from rms_backend.celery_utils import custom_shared_task as shared_task
from django.utils import timezone
from django.core.cache import cache
# pyrefly: ignore [missing-import]
from .models import JobPosting

@shared_task
def check_expired_job_postings():
    """
    Periodic task to automatically close job postings that have passed their expiry date.
    Clears cache to ensure candidates immediately see updated active listings.
    """
    today = timezone.now().date()
    expired_jobs = JobPosting.objects.filter(
        status="Published",
        expiry_date__lt=today
    )
    count = expired_jobs.count()
    if count > 0:
        # Update all expired postings
        expired_jobs.update(status="Closed")
        # Invalidate cache so users get the fresh list
        cache.clear()
        return f"Successfully closed {count} expired job posting(s)."
    return "No expired job postings found."
