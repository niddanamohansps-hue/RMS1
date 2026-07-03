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


# ── Auto-create ApprovalRequest when a RoleRequest is created or resubmitted ─────────────
@receiver(post_save, sender=RoleRequest)
def create_approval_for_role_request(sender, instance, created, **kwargs):
    """
    When a new RoleRequest is submitted, automatically create a corresponding
    ApprovalRequest so it appears in the /api/approvals/ list.
    If it's updated (resubmitted) and its status changes to "Pending", create a new ApprovalRequest.
    """
    if created:
        ApprovalRequest.objects.create(
            request_id=instance.request_id,
            type="Role Request",
            title=instance.role,
            department=instance.department,
            submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
            status="Pending",
            role_request=instance,
        )
    else:
        # Sync title and department of all approvals linked to this role request
        ApprovalRequest.objects.filter(role_request=instance).update(
            title=instance.role,
            department=instance.department
        )

        if instance.status == "Cancelled":
            ApprovalRequest.objects.filter(role_request=instance, status="Pending").update(status="Cancelled")
        elif instance.status == "Pending":
            # If it's updated to Pending (resubmitted), check if there is already an active Pending approval
            has_pending = ApprovalRequest.objects.filter(role_request=instance, status="Pending").exists()
            if not has_pending:
                ApprovalRequest.objects.create(
                    request_id=instance.request_id,
                    type="Role Request",
                    title=instance.role,
                    department=instance.department,
                    submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
                    status="Pending",
                    role_request=instance,
                )


# ── Auto-create ApprovalRequest when a JobRequest is created or resubmitted ──────────────
@receiver(post_save, sender=JobRequest)
def create_approval_for_job_request(sender, instance, created, **kwargs):
    """
    When a new JobRequest is submitted, automatically create a corresponding
    ApprovalRequest so it appears in the /api/approvals/ list.
    If it's updated (resubmitted) and its status changes to "Pending", create a new ApprovalRequest.
    """
    if created:
        ApprovalRequest.objects.create(
            request_id=instance.request_id,
            type="Job Request",
            title=instance.role,
            department=instance.department or "",
            submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
            status="Pending",
            job_request=instance,
        )
    else:
        # Sync title and department of all approvals linked to this job request
        ApprovalRequest.objects.filter(job_request=instance).update(
            title=instance.role,
            department=instance.department or ""
        )

        if instance.status == "Cancelled":
            ApprovalRequest.objects.filter(job_request=instance, status="Pending").update(status="Cancelled")
        elif instance.status == "Pending":
            # If it's updated to Pending (resubmitted), check if there is already an active Pending approval
            has_pending = ApprovalRequest.objects.filter(job_request=instance, status="Pending").exists()
            if not has_pending:
                ApprovalRequest.objects.create(
                    request_id=instance.request_id,
                    type="Job Request",
                    title=instance.role,
                    department=instance.department or "",
                    submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
                    status="Pending",
                    job_request=instance,
                )


