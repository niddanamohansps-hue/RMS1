from django.db import models

class Notification(models.Model):
    TYPE_CHOICES = [
        ("application_status", "Application Status Change"),
        ("interview_scheduled","Interview Scheduled"),
        ("offer_received",     "Offer Received"),
        ("offer_accepted",     "Offer Accepted"),
        ("onboarding",         "Onboarding Update"),
        ("general",            "General"),
    ]

    recipient   = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="notifications")
    type        = models.CharField(max_length=30, choices=TYPE_CHOICES, default="general")
    title       = models.CharField(max_length=200)
    message     = models.TextField()
    is_read     = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notif → {self.recipient.email}: {self.title}"
