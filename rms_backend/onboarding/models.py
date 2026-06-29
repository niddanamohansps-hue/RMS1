from django.db import models

class Offer(models.Model):
    STATUS_CHOICES = [
        ("Draft",    "Draft"),
        ("Sent",     "Sent"),
        ("Accepted", "Accepted"),
        ("Rejected", "Rejected"),
        ("Expired",  "Expired"),
    ]

    offer_id       = models.CharField(max_length=30, unique=True)
    candidate      = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="offers"
    )
    candidate_name = models.CharField(max_length=200)
    role           = models.CharField(max_length=200)
    ctc            = models.CharField(max_length=100, blank=True)
    issued_date    = models.DateField(null=True, blank=True)
    expiry_date    = models.DateField(null=True, blank=True)
    joining_date   = models.DateField(null=True, blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Draft")
    offer_letter   = models.FileField(upload_to="offer_letters/%Y/", blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "offers"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.offer_id} — {self.candidate_name} [{self.status}]"


class OnboardingRecord(models.Model):
    STATUS_CHOICES = [
        ("Documents Pending", "Documents Pending"),
        ("In Progress",       "In Progress"),
        ("Completed",         "Completed"),
    ]

    record_id     = models.CharField(max_length=30, unique=True)
    employee_name = models.CharField(max_length=200)
    role          = models.CharField(max_length=200)
    joining_date  = models.DateField(null=True, blank=True)
    employee_id   = models.CharField(max_length=50, blank=True)
    status        = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default="Documents Pending"
    )
    offer = models.OneToOneField(
        Offer, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="onboarding"
    )
    candidate = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="onboarding_records"
    )
    task_profile     = models.BooleanField(default=False, verbose_name="Profile Completed")
    task_offer       = models.BooleanField(default=False, verbose_name="Offer Accepted")
    task_docs_upload = models.BooleanField(default=False, verbose_name="Documents Uploaded")
    task_docs_verify = models.BooleanField(default=False, verbose_name="Documents Verified")
    task_bgc         = models.BooleanField(default=False, verbose_name="Background Check")
    task_checkin     = models.BooleanField(default=False, verbose_name="Day-1 Check-in")
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "onboarding_records"
        ordering = ["joining_date"]

    def __str__(self):
        return f"{self.record_id} — {self.employee_name} [{self.status}]"

    @property
    def completion_percentage(self):
        tasks = [
            self.task_profile, self.task_offer, self.task_docs_upload,
            self.task_docs_verify, self.task_bgc, self.task_checkin,
        ]
        return round(sum(tasks) / len(tasks) * 100)
