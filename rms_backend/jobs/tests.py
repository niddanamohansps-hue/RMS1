from django.test import TestCase
from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth import get_user_model
from jobs.models import JobPosting, JobCategory, ApprovalRequest, JobRequest, RoleRequest
from jobs.tasks import check_expired_job_postings
from notifications.tasks import create_notification_task
from notifications.models import Notification
from rest_framework.test import APIClient

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

    def test_approval_accept_and_reject_actions(self):
        """
        Verify that accepting and rejecting approvals behaves correctly on the backend.
        """
        # Create a JobRequest and corresponding ApprovalRequest
        job_request = JobRequest.objects.create(
            request_id="JR-TEST-02",
            role="Science Teacher",
            status="Pending",
            created_by=self.admin_user
        )
        approval = ApprovalRequest.objects.create(
            request_id="JR-TEST-02",
            type="Job Request",
            title="Science Teacher",
            status="Pending",
            job_request=job_request
        )

        client = APIClient()
        client.force_authenticate(user=self.admin_user)

        # 1. Accept Action
        response = client.post(f"/api/approvals/{approval.id}/action/", {"action": "Approve", "note": "Approved note"})
        self.assertEqual(response.status_code, 200)
        
        # Verify status updates
        approval.refresh_from_db()
        job_request.refresh_from_db()
        self.assertEqual(approval.status, "Approved")
        self.assertEqual(job_request.status, "Approved")

        # 2. Reject Action
        # Reset to Pending first
        approval.status = "Pending"
        approval.save()
        job_request.status = "Pending"
        job_request.save()

        response = client.post(f"/api/approvals/{approval.id}/action/", {"action": "Reject", "note": "Rejected note"})
        self.assertEqual(response.status_code, 200)

        approval.refresh_from_db()
        job_request.refresh_from_db()
        self.assertEqual(approval.status, "Rejected")
        self.assertEqual(job_request.status, "Rejected")

    def test_approval_action_modifies_role_request(self):
        """
        Verify that fields updated during approval action are synchronized
        to the underlying RoleRequest and ApprovalRequest title/department.
        """
        # Create a RoleRequest and corresponding ApprovalRequest
        role_request = RoleRequest.objects.create(
            request_id="RR-TEST-03",
            role="Maths Teacher",
            department="Science",
            salary_range="30000-40000",
            experience="1-3",
            status="Pending",
            created_by=self.admin_user
        )
        approval = ApprovalRequest.objects.create(
            request_id="RR-TEST-03",
            type="Role Request",
            title="Maths Teacher",
            department="Science",
            status="Pending",
            role_request=role_request
        )

        client = APIClient()
        client.force_authenticate(user=self.admin_user)

        # Action: Send Back with modified fields
        payload = {
            "action": "Send Back",
            "note": "Please modify role details",
            "department": "Arts",
            "role": "Art Teacher",
            "salary_range": "35000-45000",
            "experience": "2-4"
        }
        response = client.post(f"/api/approvals/{approval.id}/action/", payload)
        self.assertEqual(response.status_code, 200)

        # Refresh objects
        approval.refresh_from_db()
        role_request.refresh_from_db()

        # Check status and comments
        self.assertEqual(approval.status, "Sent Back")
        self.assertEqual(role_request.status, "Sent Back")

        # Check updated fields
        self.assertEqual(role_request.role, "Art Teacher")
        self.assertEqual(role_request.department, "Arts")
        self.assertEqual(role_request.salary_range, "35000-45000")
        self.assertEqual(role_request.experience, "2-4")

        # Check ApprovalRequest updated title & department
        self.assertEqual(approval.title, "Art Teacher")
        self.assertEqual(approval.department, "Arts")

