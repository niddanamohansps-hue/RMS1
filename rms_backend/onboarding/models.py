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

    # Onboarding Compulsory Details
    aadhar_number = models.CharField(max_length=20, blank=True, null=True)
    aadhar_card = models.FileField(upload_to="onboarding/aadhar/%Y/", blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    pan_card = models.FileField(upload_to="onboarding/pan/%Y/", blank=True, null=True)
    bank_holder_name = models.CharField(max_length=200, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=20, blank=True, null=True)
    bank_name = models.CharField(max_length=200, blank=True, null=True)
    bank_passbook = models.FileField(upload_to="onboarding/bank/%Y/", blank=True, null=True)
    passport_photo = models.FileField(upload_to="onboarding/photos/%Y/", blank=True, null=True)

    # Onboarding Optional Details
    pf_number = models.CharField(max_length=50, blank=True, null=True)
    esi_number = models.CharField(max_length=50, blank=True, null=True)
    driving_license = models.FileField(upload_to="onboarding/license/%Y/", blank=True, null=True)
    class10_marksheet = models.FileField(upload_to="onboarding/marks10/%Y/", blank=True, null=True)
    class12_marksheet = models.FileField(upload_to="onboarding/marks12/%Y/", blank=True, null=True)
    degree_certificate = models.FileField(upload_to="onboarding/degree/%Y/", blank=True, null=True)
    experience_certificate = models.FileField(upload_to="onboarding/experience/%Y/", blank=True, null=True)
    professional_certificate = models.FileField(upload_to="onboarding/prof/%Y/", blank=True, null=True)

    # Document-level verification states (JSON lists)
    verified_docs = models.TextField(default="[]", blank=True)
    rejected_docs = models.TextField(default="[]", blank=True)

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
