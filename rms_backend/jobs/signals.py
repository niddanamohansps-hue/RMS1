from django.db.models.signals import post_save, post_delete, pre_save
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


# ── Track when a RoleRequest transitions to "Approved" status ──────────────────────────
@receiver(pre_save, sender=RoleRequest)
def track_role_request_approval(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = RoleRequest.objects.get(pk=instance.pk)
            instance._is_just_approved = (old_instance.status != "Approved" and instance.status == "Approved")
        except RoleRequest.DoesNotExist:
            instance._is_just_approved = (instance.status == "Approved")
    else:
        instance._is_just_approved = (instance.status == "Approved")


# ── Auto-create ApprovalRequest when a RoleRequest is created or resubmitted ─────────────
@receiver(post_save, sender=RoleRequest)
def create_approval_for_role_request(sender, instance, created, **kwargs):
    """
    When a new RoleRequest is submitted, automatically create a corresponding
    ApprovalRequest so it appears in the /api/approvals/ list.
    If it's updated (resubmitted) and its status changes to "Pending", create a new ApprovalRequest.
    """
    if created:
        apr = ApprovalRequest.objects.create(
            request_id=instance.request_id,
            type="Role Request",
            title=instance.role,
            department=instance.department,
            submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
            status="Pending",
            role_request=instance,
        )
        ApprovalHistory.objects.create(
            approval=apr,
            action="Submitted",
            acted_by=apr.submitted_by or "Requester",
            note=instance.justification or ""
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
                apr = ApprovalRequest.objects.create(
                    request_id=instance.request_id,
                    type="Role Request",
                    title=instance.role,
                    department=instance.department,
                    submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
                    status="Pending",
                    role_request=instance,
                )
                ApprovalHistory.objects.create(
                    approval=apr,
                    action="Submitted",
                    acted_by=apr.submitted_by or "Requester",
                    note=instance.justification or ""
                )

    # Auto-create or update ExistingRole when status transitions to Approved
    if getattr(instance, "_is_just_approved", False):
        # 1. Update the status of any pending approval requests to Approved
        ApprovalRequest.objects.filter(role_request=instance, status="Pending").update(status="Approved")

        # 2. Create or update the ExistingRole
        from users.utils import auto_id
        
        existing = ExistingRole.objects.filter(
            role__iexact=instance.role,
            department__iexact=instance.department
        ).first()
        
        if existing:
            existing.headcount += 1
            if existing.status == "Inactive":
                existing.status = "Active"
            existing.save()
        else:
            ExistingRole.objects.create(
                role_id=auto_id("ROL", ExistingRole),
                role=instance.role,
                department=instance.department,
                salary_range=instance.salary_range,
                experience=instance.experience,
                type=instance.type or "Full-time",
                headcount=1,
                filled=0,
                status="Active"
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
        apr = ApprovalRequest.objects.create(
            request_id=instance.request_id,
            type="Job Request",
            title=instance.role,
            department=instance.department or "",
            submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
            status="Pending",
            job_request=instance,
        )
        ApprovalHistory.objects.create(
            approval=apr,
            action="Submitted",
            acted_by=apr.submitted_by or "Requester",
            note=instance.justification or instance.description or ""
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
                apr = ApprovalRequest.objects.create(
                    request_id=instance.request_id,
                    type="Job Request",
                    title=instance.role,
                    department=instance.department or "",
                    submitted_by=instance.created_by.get_full_name() if instance.created_by else instance.submitted_by,
                    status="Pending",
                    job_request=instance,
                )
                ApprovalHistory.objects.create(
                    approval=apr,
                    action="Submitted",
                    acted_by=apr.submitted_by or "Requester",
                    note=instance.justification or instance.description or ""
                )


# ── Bidirectional Sync between CandidateProfile and GeneralApplication ─────────────────

from users.models import CandidateProfile

EXPERIENCE_MAP_TO_PROFILE = {
    "0-1": "0-1", "0–1 years": "0-1", "0–1 years (fresher)": "0-1", "fresher": "0-1",
    "1-2": "1-2", "1–2 years": "1-2", "1–3 years": "1-2", "1-3": "1-2",
    "2-4": "2-4", "2–4 years": "2-4",
    "3-5": "3-5", "3–5 years": "3-5",
    "5-8": "5-8", "5–8 years": "5-8",
    "8+": "8+", "8+ years": "8+",
}

EXPERIENCE_MAP_TO_APP = {
    "0-1": "0–1 years",
    "1-2": "1–2 years",
    "2-4": "2–4 years",
    "3-5": "3–5 years",
    "5-8": "5–8 years",
    "8+": "8+ years",
}

def normalize_to_profile_exp(exp):
    if not exp:
        return ""
    val = exp.lower().strip().replace("–", "-")
    for k, v in EXPERIENCE_MAP_TO_PROFILE.items():
        if k in val:
            return v
    return "0-1"

def normalize_to_app_exp(exp_code):
    return EXPERIENCE_MAP_TO_APP.get(exp_code, exp_code or "")

def parse_qualification(qual_str):
    qual_str = (qual_str or "").strip()
    if not qual_str:
        return "", ""
    if "(" in qual_str and ")" in qual_str:
        parts = qual_str.split("(", 1)
        edu = parts[0].strip()
        deg = parts[1].split(")", 1)[0].strip()
        return edu, deg
    return qual_str, ""


@receiver(post_save, sender=CandidateProfile)
def sync_candidate_profile_to_general_application(sender, instance, created, **kwargs):
    """
    Sync updates from CandidateProfile to GeneralApplication if it exists.
    """
    gen_app = GeneralApplication.objects.filter(candidate=instance.user).first()
    if gen_app:
        edu = instance.educational_qualification or ""
        deg = instance.degree_name or ""
        qual = f"{edu} ({deg})" if (edu and deg) else (edu or deg or "")
        profile_role = ", ".join(instance.roles_interested) if instance.roles_interested else ""
        
        updated = False
        if gen_app.preferred_role != profile_role:
            gen_app.preferred_role = profile_role
            updated = True
        if gen_app.experience != instance.years_of_experience:
            gen_app.experience = instance.years_of_experience
            updated = True
        if gen_app.qualification != qual:
            gen_app.qualification = qual
            updated = True
            
        if updated:
            gen_app.save()


@receiver(post_save, sender=GeneralApplication)
def sync_general_application_to_candidate_profile(sender, instance, created, **kwargs):
    """
    Sync updates from GeneralApplication to CandidateProfile.
    """
    profile, _ = CandidateProfile.objects.get_or_create(user=instance.candidate)
    edu, deg = parse_qualification(instance.qualification)
    roles_list = [r.strip() for r in instance.preferred_role.split(",")] if instance.preferred_role else []
    
    updated = False
    if profile.roles_interested != roles_list:
        profile.roles_interested = roles_list
        updated = True
    if profile.years_of_experience != instance.experience:
        profile.years_of_experience = instance.experience
        updated = True
    if profile.educational_qualification != edu:
        profile.educational_qualification = edu
        updated = True
    if profile.degree_name != deg:
        profile.degree_name = deg
        updated = True
        
    if updated:
        profile.save()



