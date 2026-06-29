from django.db import models

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied",      "Applied"),
        ("Shortlisted",  "Shortlisted"),
        ("Selected",     "Selected"),
        ("Rejected",     "Rejected"),
        ("Offer Sent",   "Offer Sent"),
        ("Offer Accepted","Offer Accepted"),
        ("Withdrawn",    "Withdrawn"),
    ]

    app_id          = models.CharField(max_length=30, unique=True)
    candidate       = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="job_applications"
    )
    posting         = models.ForeignKey(
        "jobs.JobPosting", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="job_applications"
    )
    role            = models.CharField(max_length=200)
    experience      = models.CharField(max_length=50, blank=True)
    qualification   = models.CharField(max_length=200, blank=True)
    cover_letter    = models.TextField(blank=True)
    notice_period   = models.CharField(max_length=50, blank=True)
    has_referral    = models.BooleanField(default=False)
    referral_emp_id = models.CharField(max_length=50, blank=True)
    referred_by     = models.CharField(max_length=200, blank=True)
    applied_date    = models.DateField(auto_now_add=True)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    admin_note      = models.TextField(blank=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_applications"
        ordering = ["-applied_date"]
        unique_together = [["candidate", "posting"]]

    def __str__(self):
        return f"{self.app_id} — {self.candidate.get_full_name()} → {self.role}"


class GeneralApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied",     "Applied"),
        ("Shortlisted", "Shortlisted"),
        ("Rejected",    "Rejected"),
    ]

    app_id         = models.CharField(max_length=30, unique=True)
    candidate      = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="general_applications"
    )
    preferred_role = models.CharField(max_length=200, blank=True)
    preferred_dept = models.CharField(max_length=200, blank=True)
    experience     = models.CharField(max_length=50, blank=True)
    qualification  = models.CharField(max_length=200, blank=True)
    applied_date   = models.DateField(auto_now_add=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    admin_note     = models.TextField(blank=True)

    class Meta:
        db_table = "general_applications"
        ordering = ["-applied_date"]

    def __str__(self):
        return f"{self.app_id} — {self.candidate.get_full_name()} (General)"
