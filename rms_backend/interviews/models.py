from django.db import models

class Panelist(models.Model):
    name       = models.CharField(max_length=200)
    email      = models.EmailField(unique=True)
    phone      = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "panelists"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Interview(models.Model):
    STATUS_CHOICES = [
        ("Scheduled",  "Scheduled"),
        ("Completed",  "Completed"),
        ("Cancelled",  "Cancelled"),
        ("Rescheduled","Rescheduled"),
    ]
    MODE_CHOICES = [
        ("Online",  "Online"),
        ("Offline", "Offline"),
    ]
    RECOMMENDATION_CHOICES = [
        ("Selected",  "Selected"),
        ("Rejected",  "Rejected"),
        ("On Hold",   "On Hold"),
        ("Next Round","Next Round"),
    ]

    interview_id   = models.CharField(max_length=30, unique=True)
    application    = models.ForeignKey(
        "applications.JobApplication", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="interviews"
    )
    candidate_name = models.CharField(max_length=200)
    role           = models.CharField(max_length=200)
    date           = models.DateField()
    time           = models.TimeField()
    panel          = models.ManyToManyField(Panelist, blank=True, related_name="interviews")
    score          = models.PositiveIntegerField(null=True, blank=True)
    recommendation = models.CharField(
        max_length=20, choices=RECOMMENDATION_CHOICES, blank=True
    )
    feedback       = models.TextField(blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Scheduled")
    mode           = models.CharField(max_length=20, choices=MODE_CHOICES, default="Online")
    meeting_link   = models.URLField(blank=True)
    round          = models.PositiveIntegerField(default=1)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interviews"
        ordering = ["-date", "-time"]

    def __str__(self):
        return f"{self.interview_id} — {self.candidate_name} (Round {self.round})"


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

@receiver(post_save, sender=Panelist)
def sync_panelist_user_account(sender, instance, created, **kwargs):
    User = get_user_model()
    user, user_created = User.objects.get_or_create(
        email=instance.email,
        defaults={
            "username": instance.email,
            "first_name": instance.name,
            "role": "admin",
            "is_staff": True,
            "is_active": instance.is_active,
        }
    )
    
    if user_created:
        user.set_password("Panel@123")
        user.save()
    else:
        user.first_name = instance.name
        user.is_active = instance.is_active
        user.role = "admin"
        user.save()

