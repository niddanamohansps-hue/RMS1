from django.test import TestCase
from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth import get_user_model
from jobs.models import JobPosting, JobCategory
from jobs.tasks import check_expired_job_postings
from notifications.tasks import create_notification_task
from notifications.models import Notification

class CacheAndTaskTestCase(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.admin_user = self.User.objects.create_user(
            email="admin@school.com",
            password="testpassword",
            first_name="Admin",
            last_name="User",
            role="admin"
        )
        self.category = JobCategory.objects.create(name="Teacher", description="Teaching roles")
        cache.clear()

    def test_cache_set_and_clear_on_model_signal(self):
        """
        Verify that Django cache registers values and gets cleared
        automatically by signals when key models change.
        """
        cache.set("dashboard_stats", {"test": "data"}, timeout=300)
        self.assertEqual(cache.get("dashboard_stats"), {"test": "data"})
        
        # Saving a JobPosting should trigger post_save signal and clear the cache
        JobPosting.objects.create(
            posting_id="JP-TEST-01",
            role="Music Teacher",
            category=self.category,
            status="Published"
        )
        self.assertIsNone(cache.get("dashboard_stats"), "Cache was not cleared by signals on save!")

    def test_celery_check_expired_job_postings_task(self):
        """
        Verify the expired job postings celery task updates statuses correctly.
        """
        # Create an expired posting and a fresh posting
        expired_job = JobPosting.objects.create(
            posting_id="JP-EXPIRED",
            role="Math Teacher",
            status="Published",
            expiry_date=timezone.now().date() - timezone.timedelta(days=2)
        )
        active_job = JobPosting.objects.create(
            posting_id="JP-ACTIVE",
            role="English Teacher",
            status="Published",
            expiry_date=timezone.now().date() + timezone.timedelta(days=5)
        )

        # Run the celery task synchronously (calling it directly instead of using .delay)
        res = check_expired_job_postings()
        
        expired_job.refresh_from_db()
        active_job.refresh_from_db()
        
        self.assertEqual(expired_job.status, "Closed")
        self.assertEqual(active_job.status, "Published")
        self.assertIn("Successfully closed 1 expired job posting(s)", res)

    def test_celery_create_notification_task(self):
        """
        Verify the asynchronous notification task creates records in DB correctly.
        """
        # Call celery task directly
        res = create_notification_task(
            recipient_id=self.admin_user.id,
            notification_type="general",
            title="System Alert",
            message="Database maintenance completed."
        )
        
        # Verify db record creation
        notif = Notification.objects.filter(recipient=self.admin_user).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.title, "System Alert")
        self.assertEqual(notif.message, "Database maintenance completed.")
        self.assertIn("created for admin@school.com", res)
