from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from applications.models import JobApplication, GeneralApplication
from jobs.models import JobPosting, JobCategory

User = get_user_model()

class GeneralApplicationAPITestCase(APITestCase):
    def setUp(self):
        # Create users
        self.candidate = User.objects.create_user(
            email="candidate@school.com",
            password="testpassword",
            first_name="Candidate",
            last_name="User",
            role="candidate"
        )
        self.hr_admin = User.objects.create_user(
            email="admin@school.com",
            password="testpassword",
            first_name="Admin",
            last_name="User",
            role="admin"
        )
        self.other_candidate = User.objects.create_user(
            email="other@school.com",
            password="testpassword",
            first_name="Other",
            last_name="Candidate",
            role="candidate"
        )

        # Create general application
        self.app = GeneralApplication.objects.create(
            app_id="GAPP-2026-0001",
            candidate=self.candidate,
            preferred_role="Science Teacher",
            preferred_dept="Science",
            experience="3 years",
            qualification="B.Sc, B.Ed",
            status="Applied"
        )

    def test_candidate_can_submit_general_application(self):
        """Candidates can successfully submit a general application."""
        self.client.force_authenticate(user=self.candidate)
        url = reverse("general-applications-list")
        data = {
            "preferred_role": "Math Teacher",
            "preferred_dept": "Mathematics",
            "experience": "5 years",
            "qualification": "M.Sc, B.Ed",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["preferred_role"], "Math Teacher")
        self.assertEqual(response.data["status"], "Applied")

        # Verify auto-assigned candidate
        app = GeneralApplication.objects.get(app_id=response.data["app_id"])
        self.assertEqual(app.candidate, self.candidate)

    def test_candidate_cannot_set_status_or_admin_note_on_creation(self):
        """Candidates should not be allowed to define status or admin_note upon submission."""
        self.client.force_authenticate(user=self.candidate)
        url = reverse("general-applications-list")
        data = {
            "preferred_role": "Math Teacher",
            "status": "Shortlisted",
            "admin_note": "Do not hire",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify that status defaults to Applied, not Shortlisted, and admin_note is empty
        app = GeneralApplication.objects.get(app_id=response.data["app_id"])
        self.assertEqual(app.status, "Applied")
        self.assertEqual(app.admin_note, "")

    def test_hr_admin_can_update_status_and_admin_note(self):
        """HR Admins can update application status and notes."""
        self.client.force_authenticate(user=self.hr_admin)
        url = reverse("general-applications-detail", kwargs={"pk": self.app.id})
        data = {
            "status": "Shortlisted",
            "admin_note": "Looks promising.",
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, "Shortlisted")
        self.assertEqual(self.app.admin_note, "Looks promising.")

    def test_candidate_cannot_update_general_application(self):
        """Candidates cannot update general applications (PUT/PATCH)."""
        self.client.force_authenticate(user=self.candidate)
        url = reverse("general-applications-detail", kwargs={"pk": self.app.id})
        data = {
            "preferred_role": "History Teacher",
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_can_view_own_general_applications(self):
        """Candidates can retrieve their own list of general applications."""
        self.client.force_authenticate(user=self.candidate)
        url = reverse("general-applications-mine")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["app_id"], self.app.app_id)

    def test_candidate_cannot_view_others_general_applications(self):
        """Candidates should not be able to retrieve other candidates' applications."""
        self.client.force_authenticate(user=self.other_candidate)
        url = reverse("general-applications-detail", kwargs={"pk": self.app.id})
        response = self.client.get(url)
        # Should return 404 since it's filtered out of the queryset
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_hr_admin_can_view_all_general_applications(self):
        """HR Admins can view all applications in the talent pool."""
        self.client.force_authenticate(user=self.hr_admin)
        url = reverse("general-applications-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)


class JobApplicationAPITestCase(APITestCase):
    def setUp(self):
        # Create users
        self.candidate = User.objects.create_user(
            email="candidate2@school.com",
            password="testpassword",
            first_name="Candidate",
            last_name="User",
            role="candidate"
        )
        self.hr_admin = User.objects.create_user(
            email="admin2@school.com",
            password="testpassword",
            first_name="Admin",
            last_name="User",
            role="admin"
        )
        
        # Create job category and job posting
        self.category = JobCategory.objects.create(name="Math", description="Math postings")
        self.posting = JobPosting.objects.create(
            posting_id="JP-MATH-01",
            role="Math Teacher",
            category=self.category,
            status="Published"
        )

    def test_candidate_cannot_set_status_or_admin_note_on_job_creation(self):
        """Candidates should not be allowed to define status or admin_note upon submitting a job application."""
        self.client.force_authenticate(user=self.candidate)
        url = reverse("applications-list")
        data = {
            "posting": self.posting.id,
            "cover_letter": "I love math.",
            "status": "Selected",
            "admin_note": "Hire this person.",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify status defaults to Applied and admin_note is empty
        app = JobApplication.objects.get(app_id=response.data["app_id"])
        self.assertEqual(app.status, "Applied")
        self.assertEqual(app.admin_note, "")

    def test_job_application_saves_experience_and_qualification(self):
        """Verify that experience and qualification fields are saved correctly in the JobApplication model."""
        self.client.force_authenticate(user=self.candidate)
        url = reverse("applications-list")
        data = {
            "posting": self.posting.id,
            "cover_letter": "I love math.",
            "experience": "5 years",
            "qualification": "M.Sc (Mathematics)",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        app = JobApplication.objects.get(app_id=response.data["app_id"])
        self.assertEqual(app.experience, "5 years")
        self.assertEqual(app.qualification, "M.Sc (Mathematics)")

