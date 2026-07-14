from django.test import TestCase
from django.contrib.auth import get_user_model
from interviews.models import Panelist

class PanelistUserSyncTestCase(TestCase):
    def setUp(self):
        self.User = get_user_model()

    def test_create_panelist_creates_user(self):
        # 1. Create a Panelist
        panelist = Panelist.objects.create(
            name="Test Panelist",
            email="test_panelist@school.edu",
            phone="1234567890",
            department="Science"
        )
        
        # 2. Check if a User account was automatically created
        user_exists = self.User.objects.filter(email="test_panelist@school.edu").exists()
        self.assertTrue(user_exists)
        
        user = self.User.objects.get(email="test_panelist@school.edu")
        self.assertEqual(user.first_name, "Test Panelist")
        self.assertEqual(user.role, "admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_active)
        self.assertTrue(user.check_password("Panel@123"))

    def test_update_panelist_syncs_user(self):
        # 1. Create a Panelist
        panelist = Panelist.objects.create(
            name="Test Panelist",
            email="test_panelist@school.edu",
            phone="1234567890",
            department="Science"
        )
        
        # 2. Update panelist name and status
        panelist.name = "Updated Name"
        panelist.is_active = False
        panelist.save()
        
        # 3. Check if user is updated
        user = self.User.objects.get(email="test_panelist@school.edu")
        self.assertEqual(user.first_name, "Updated Name")
        self.assertFalse(user.is_active)


from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APITransactionTestCase
from rest_framework import status
from interviews.models import Interview

class InterviewNotificationTestCase(APITransactionTestCase):
    def setUp(self):
        self.User = get_user_model()
        self.admin_user = self.User.objects.create_user(
            username="admin@school.edu",
            email="admin@school.edu",
            password="adminpassword",
            role="admin",
            is_staff=True
        )
        self.client.force_authenticate(user=self.admin_user)
        
        # Create panelists
        self.panelist1 = Panelist.objects.create(name="Panelist One", email="p1@school.edu")
        self.panelist2 = Panelist.objects.create(name="Panelist Two", email="p2@school.edu")

    @patch("notifications.tasks.send_interview_email_task.delay")
    def test_schedule_interview_sends_email(self, mock_send_email):
        url = reverse("interviews-list")
        data = {
            "candidate_name": "John Doe",
            "role": "Teacher",
            "date": "2026-07-20",
            "time": "10:00:00",
            "mode": "Online",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "round": 1,
            "panel": []
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify it triggers scheduling email (not rescheduling)
        mock_send_email.assert_called_once()
        self.assertEqual(mock_send_email.call_args[0][0], response.data["id"])
        self.assertEqual(mock_send_email.call_args[1].get("is_reschedule"), False)

    @patch("notifications.tasks.send_interview_email_task.delay")
    @patch("notifications.tasks.send_new_panelists_email_task.delay")
    def test_reschedule_sends_reschedule_email_to_all(self, mock_new_panelists_email, mock_send_email):
        # Create an interview
        interview = Interview.objects.create(
            interview_id="INT-001",
            candidate_name="John Doe",
            role="Teacher",
            date="2026-07-20",
            time="10:00:00",
            mode="Online",
            meeting_link="https://meet.google.com/abc-defg-hij",
            round=1,
        )
        interview.panel.set([self.panelist1])

        url = reverse("interviews-detail", args=[interview.id])
        # Reschedule: change date and time
        data = {
            "date": "2026-07-21",
            "time": "11:00:00",
            "panel": [self.panelist1.id]
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify send_interview_email_task is called with is_reschedule=True
        mock_send_email.assert_called_once_with(interview.id, is_reschedule=True)
        # Verify send_new_panelists_email_task is NOT called
        mock_new_panelists_email.assert_not_called()

    @patch("notifications.tasks.send_interview_email_task.delay")
    @patch("notifications.tasks.send_new_panelists_email_task.delay")
    def test_assign_panelist_sends_email_only_to_new(self, mock_new_panelists_email, mock_send_email):
        # Create an interview
        interview = Interview.objects.create(
            interview_id="INT-001",
            candidate_name="John Doe",
            role="Teacher",
            date="2026-07-20",
            time="10:00:00",
            mode="Online",
            meeting_link="https://meet.google.com/abc-defg-hij",
            round=1,
        )
        interview.panel.set([self.panelist1])

        url = reverse("interviews-detail", args=[interview.id])
        # Assign panelist: add panelist2, keep panelist1, date/time unchanged
        data = {
            "panel": [self.panelist1.id, self.panelist2.id]
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify send_interview_email_task is NOT called
        mock_send_email.assert_not_called()
        # Verify send_new_panelists_email_task is called ONLY with panelist2 ID
        mock_new_panelists_email.assert_called_once_with(interview.id, [self.panelist2.id])

    @patch("notifications.tasks.send_interview_email_task.delay")
    def test_create_unscheduled_interview_succeeds_without_date_time_panel(self, mock_send_email):
        url = reverse("interviews-list")
        data = {
            "candidate_name": "Souradip Roy",
            "role": "Computer Science Teacher",
            "round": 2,
            "mode": "Offline"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data["date"])
        self.assertIsNone(response.data["time"])
        self.assertEqual(response.data["panel_details"], [])
        
        # Verify no email task is triggered
        mock_send_email.assert_not_called()

    @patch("notifications.tasks.send_interview_email_task.delay")
    def test_schedule_unscheduled_interview_later(self, mock_send_email):
        # Create an unscheduled interview
        interview = Interview.objects.create(
            interview_id="INT-002",
            candidate_name="Souradip Roy",
            role="Computer Science Teacher",
            round=2,
            mode="Offline",
            date=None,
            time=None
        )
        
        url = reverse("interviews-detail", args=[interview.id])
        data = {
            "date": "2026-08-01",
            "time": "10:00:00",
            "status": "Scheduled",
            "panel": [self.panelist1.id, self.panelist2.id]
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify date/time are set
        self.assertEqual(response.data["date"], "2026-08-01")
        self.assertEqual(response.data["time"], "10:00:00")
        
        # Verify send_interview_email_task is called with is_reschedule=False (first-time schedule)
        mock_send_email.assert_called_once_with(interview.id, is_reschedule=False)

    @patch("notifications.tasks.send_interview_completed_email_task.delay")
    def test_complete_interview_triggers_completed_email(self, mock_completed_email):
        # Create a scheduled interview
        interview = Interview.objects.create(
            interview_id="INT-003",
            candidate_name="Souradip Roy",
            role="Computer Science Teacher",
            round=1,
            mode="Offline",
            date="2026-08-01",
            time="10:00:00",
            status="Scheduled"
        )

        url = reverse("interviews-detail", args=[interview.id])
        data = {
            "status": "Completed",
            "score": 92,
            "recommendation": "Hire",
            "feedback": "Great candidate."
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify completed email is triggered
        mock_completed_email.assert_called_once_with(interview.id)


class PerPanelistEvaluationTestCase(APITransactionTestCase):
    def setUp(self):
        self.User = get_user_model()
        self.admin_user = self.User.objects.create_user(
            username="admin@school.edu",
            email="admin@school.edu",
            password="adminpassword",
            role="admin",
            is_staff=True
        )
        self.client.force_authenticate(user=self.admin_user)
        
        self.panelist1 = Panelist.objects.create(name="Panelist One", email="p1@school.edu")
        self.panelist2 = Panelist.objects.create(name="Panelist Two", email="p2@school.edu")
        
        self.interview = Interview.objects.create(
            interview_id="INT-EVAL-01",
            candidate_name="Jane Doe",
            role="Math Teacher",
            date="2026-07-20",
            time="10:00:00",
            mode="Online",
            round=1
        )
        self.interview.panel.set([self.panelist1, self.panelist2])

    def test_submit_valid_scorecard_calculates_overall_score(self):
        url = reverse("interviews-detail", args=[self.interview.id])
        data = {
            "panelist_evaluation": {
                "panelist": self.panelist1.id,
                "criteria": {
                    "Communication Skills": 4,
                    "Subject Knowledge": 5,
                    "Confidence": 3,
                    "Problem Solving": 4,
                    "Cultural Fit": 5
                },
                "custom_criteria": {
                    "Coding": 4
                },
                "recommendation": "Hire",
                "notes": "Good candidates"
            }
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check overall score logic ((4+5+3+4+5+4) = 25, 25/30 * 100 = 83)
        from interviews.models import InterviewEvaluation
        eval_obj = InterviewEvaluation.objects.get(interview=self.interview, panelist=self.panelist1)
        self.assertEqual(eval_obj.overall_score, 83)
        self.assertEqual(eval_obj.notes, "Good candidates")
        
        # Verify JSON response contains evaluations and evaluation_summary
        self.assertEqual(len(response.data["evaluations"]), 1)
        self.assertEqual(response.data["evaluations"][0]["overall_score"], 83)
        self.assertEqual(response.data["evaluation_summary"]["assigned_count"], 2)
        self.assertEqual(response.data["evaluation_summary"]["submitted_count"], 1)
        self.assertEqual(response.data["evaluation_summary"]["average_score"], 83)

    def test_submit_scorecard_rejects_missing_or_extra_core_criteria(self):
        url = reverse("interviews-detail", args=[self.interview.id])
        
        # 1. Missing "Cultural Fit"
        data = {
            "panelist_evaluation": {
                "panelist": self.panelist1.id,
                "criteria": {
                    "Communication Skills": 4,
                    "Subject Knowledge": 5,
                    "Confidence": 3,
                    "Problem Solving": 4
                },
                "recommendation": "Hire"
            }
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("criteria", response.data["panelist_evaluation"])

        # 2. Unexpected core criterion "Coding" inside criteria (should go to custom_criteria)
        data = {
            "panelist_evaluation": {
                "panelist": self.panelist1.id,
                "criteria": {
                    "Communication Skills": 4,
                    "Subject Knowledge": 5,
                    "Confidence": 3,
                    "Problem Solving": 4,
                    "Cultural Fit": 5,
                    "Coding": 5
                },
                "recommendation": "Hire"
            }
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("criteria", response.data["panelist_evaluation"])

    def test_submit_scorecard_rejects_unassigned_panelist(self):
        unassigned_panelist = Panelist.objects.create(name="Stranger", email="stranger@school.edu")
        url = reverse("interviews-detail", args=[self.interview.id])
        data = {
            "panelist_evaluation": {
                "panelist": unassigned_panelist.id,
                "criteria": {
                    "Communication Skills": 4,
                    "Subject Knowledge": 5,
                    "Confidence": 3,
                    "Problem Solving": 4,
                    "Cultural Fit": 5
                },
                "recommendation": "Hire"
            }
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("panelist", response.data["panelist_evaluation"])

    def test_submit_scorecard_updates_existing_evaluation(self):
        url = reverse("interviews-detail", args=[self.interview.id])
        data1 = {
            "panelist_evaluation": {
                "panelist": self.panelist1.id,
                "criteria": {
                    "Communication Skills": 4,
                    "Subject Knowledge": 4,
                    "Confidence": 4,
                    "Problem Solving": 4,
                    "Cultural Fit": 4
                },
                "recommendation": "Hire"
            }
        }
        response1 = self.client.patch(url, data1, format="json")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Check summary average
        self.assertEqual(response1.data["evaluation_summary"]["average_score"], 80)
        
        # Submit again for panelist1 with different scores
        data2 = {
            "panelist_evaluation": {
                "panelist": self.panelist1.id,
                "criteria": {
                    "Communication Skills": 5,
                    "Subject Knowledge": 5,
                    "Confidence": 5,
                    "Problem Solving": 5,
                    "Cultural Fit": 5
                },
                "recommendation": "Strong Hire"
            }
        }
        response2 = self.client.patch(url, data2, format="json")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Check summary average updated to 100
        self.assertEqual(response2.data["evaluation_summary"]["average_score"], 100)
        from interviews.models import InterviewEvaluation
        self.assertEqual(InterviewEvaluation.objects.filter(interview=self.interview).count(), 1)

