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
