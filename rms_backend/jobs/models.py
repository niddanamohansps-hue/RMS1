from django.db import models

class JobCategory(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_categories"
        verbose_name_plural = "Job Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ExistingRole(models.Model):
    STATUS_CHOICES = [
        ("Active",   "Active"),
        ("Inactive", "Inactive"),
    ]
    TYPE_CHOICES = [
        ("Full-time",  "Full-time"),
        ("Part-time",  "Part-time"),
        ("Contract",   "Contract"),
        ("Internship", "Internship"),
    ]
    DEPT_CHOICES = [
        ("Science",        "Science"),
        ("Commerce",       "Commerce"),
        ("Arts",           "Arts"),
        ("Administration", "Administration"),
        ("Sports",         "Sports"),
        ("Languages",      "Languages"),
        ("Student Welfare","Student Welfare"),
    ]

    role_id      = models.CharField(max_length=30, unique=True)
    department   = models.CharField(max_length=100, choices=DEPT_CHOICES)
    role         = models.CharField(max_length=200)
    type         = models.CharField(max_length=50, choices=TYPE_CHOICES, default="Full-time")
    headcount    = models.PositiveIntegerField(default=1)
    filled       = models.PositiveIntegerField(default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    experience   = models.CharField(max_length=50, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "existing_roles"
        ordering = ["department", "role"]

    def __str__(self):
        return f"{self.role_id} — {self.role} ({self.department})"

    @property
    def vacancies(self):
        return max(0, self.headcount - self.filled)


class RoleRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending",  "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    request_id    = models.CharField(max_length=30, unique=True)
    department    = models.CharField(max_length=100)
    role          = models.CharField(max_length=200)
    justification = models.TextField()
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    submitted_by  = models.CharField(max_length=200, blank=True)
    date          = models.DateField(auto_now_add=True)
    reviewed_at   = models.DateTimeField(null=True, blank=True)
    reviewer_note = models.TextField(blank=True)
    created_by    = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="role_requests_created"
    )

    class Meta:
        db_table = "role_requests"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.request_id} — {self.role} ({self.status})"


class JobRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending",  "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    request_id    = models.CharField(max_length=30, unique=True)
    role          = models.CharField(max_length=200)
    vacancies     = models.PositiveIntegerField(default=1)
    experience    = models.CharField(max_length=50, blank=True)
    salary_range  = models.CharField(max_length=100, blank=True)
    type          = models.CharField(max_length=50, default="Full-time")
    qualification = models.CharField(max_length=200, blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    submitted_by  = models.CharField(max_length=200, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)
    created_by    = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="job_requests_created"
    )

    class Meta:
        db_table = "job_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.request_id} — {self.role} ({self.status})"


class ApprovalRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending",   "Pending"),
        ("Approved",  "Approved"),
        ("Rejected",  "Rejected"),
        ("Sent Back", "Sent Back"),
    ]
    TYPE_CHOICES = [
        ("Job Request",  "Job Request"),
        ("Role Request", "Role Request"),
    ]

    request_id   = models.CharField(max_length=30)
    type         = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title        = models.CharField(max_length=200)
    department   = models.CharField(max_length=100, blank=True)
    submitted_by = models.CharField(max_length=200, blank=True)
    date         = models.DateField(auto_now_add=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    job_request  = models.ForeignKey(
        JobRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="approvals"
    )
    role_request = models.ForeignKey(
        RoleRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="approvals"
    )

    class Meta:
        db_table = "approval_requests"
        ordering = ["-date"]

    def __str__(self):
        return f"Approval({self.request_id}) — {self.status}"


class ApprovalHistory(models.Model):
    approval = models.ForeignKey(
        ApprovalRequest, on_delete=models.CASCADE, related_name="history"
    )
    action   = models.CharField(max_length=50)
    acted_by = models.CharField(max_length=200)
    date     = models.DateField(auto_now_add=True)
    note     = models.TextField(blank=True)

    class Meta:
        db_table = "approval_history"
        ordering = ["date"]

    def __str__(self):
        return f"{self.approval.request_id} — {self.action} by {self.acted_by}"


class JobPosting(models.Model):
    STATUS_CHOICES = [
        ("Published",   "Published"),
        ("Unpublished", "Unpublished"),
        ("Closed",      "Closed"),
    ]
    CHANNEL_CHOICES = [
        ("External", "External"),
        ("Internal", "Internal"),
    ]

    posting_id     = models.CharField(max_length=30, unique=True)
    role           = models.CharField(max_length=200)
    department     = models.CharField(max_length=100, blank=True)
    type           = models.CharField(max_length=50, default="Full-time")
    category       = models.ForeignKey(
        JobCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="postings"
    )
    location       = models.CharField(max_length=200, default="Guwahati, Assam")
    description    = models.TextField(blank=True)
    qualifications = models.JSONField(default=list)
    experience     = models.CharField(max_length=50, blank=True)
    salary_range   = models.CharField(max_length=100, blank=True)
    qualification  = models.CharField(max_length=200, blank=True)
    channel        = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default="External")
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Unpublished")
    posted_date    = models.DateField(null=True, blank=True)
    expiry_date    = models.DateField(null=True, blank=True)
    deadline       = models.CharField(max_length=100, blank=True)
    job_request    = models.ForeignKey(
        JobRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="postings"
    )
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_postings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.posting_id} — {self.role} [{self.status}]"

    @property
    def application_count(self):
        return self.job_applications.count()
