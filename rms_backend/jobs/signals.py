from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

from jobs.models import (
    JobCategory, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting
)
from applications.models import JobApplication, GeneralApplication
from interviews.models import Interview
from onboarding.models import Offer, OnboardingRecord

# Listen to changes across all KPI-related models to invalidate cached dashboard/listings.
@receiver([post_save, post_delete], sender=JobCategory)
@receiver([post_save, post_delete], sender=ExistingRole)
@receiver([post_save, post_delete], sender=RoleRequest)
@receiver([post_save, post_delete], sender=JobRequest)
@receiver([post_save, post_delete], sender=ApprovalRequest)
@receiver([post_save, post_delete], sender=ApprovalHistory)
@receiver([post_save, post_delete], sender=JobPosting)
@receiver([post_save, post_delete], sender=JobApplication)
@receiver([post_save, post_delete], sender=GeneralApplication)
@receiver([post_save, post_delete], sender=Interview)
@receiver([post_save, post_delete], sender=Offer)
@receiver([post_save, post_delete], sender=OnboardingRecord)
def clear_caches_on_change(sender, **kwargs):
    """
    Clears the entire cache to ensure all dashboard KPI widgets, 
    statistics, and public job posting lists immediately show fresh, consistent data.
    """
    cache.clear()
