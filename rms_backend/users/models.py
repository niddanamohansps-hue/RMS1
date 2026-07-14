from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import FileExtensionValidator

class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Extends Django's built-in User.
    - EMAIL is the login field (no username required from users)
    - username is auto-populated from email internally
    role='admin'     → HR staff who use the admin dashboard
    role='candidate' → Job seekers who use the career page
    """
    ROLE_CHOICES = [
        ("admin",     "HR Admin"),
        ("candidate", "Candidate"),
    ]
    email    = models.EmailField(unique=True)
    role     = models.CharField(max_length=20, choices=ROLE_CHOICES, default="candidate")
    phone    = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "admin"
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)
        from django.core.cache import cache
        cache.delete(f"user_profile_{self.id}")

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}> ({self.role})"

    @property
    def is_hr_admin(self):
        return self.role == "admin"

    @property
    def is_candidate(self):
        return self.role == "candidate"


class CandidateProfile(models.Model):
    """
    Extended profile for candidates — linked 1-to-1 to User.
    """
    EXPERIENCE_CHOICES = [
        ("0-1",  "0–1 years"),
        ("1-2",  "1–2 years"),
        ("2-4",  "2–4 years"),
        ("3-5",  "3–5 years"),
        ("5-8",  "5–8 years"),
        ("8+",   "8+ years"),
    ]

    user              = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    current_location  = models.CharField(max_length=200, blank=True)
    educational_qualification = models.CharField(max_length=200, blank=True)
    degree_name               = models.CharField(max_length=200, blank=True)
    professional_qualification = models.CharField(max_length=200, blank=True)
    professional_degree_name   = models.CharField(max_length=200, blank=True)
    extracurricular_qualification = models.CharField(max_length=200, blank=True)
    extracurricular_degree_name   = models.CharField(max_length=200, blank=True)
    years_of_experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, blank=True)
    roles_interested    = models.JSONField(default=list, blank=True)
    skills              = models.JSONField(default=list, blank=True)
    salary_expectation  = models.CharField(max_length=100, blank=True)
    linkedin_profile    = models.URLField(blank=True)
    portfolio_link      = models.URLField(blank=True)
    resume = models.FileField(
        upload_to="resumes/%Y/%m/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf", "doc", "docx"])],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "candidate_profiles"

    def __str__(self):
        return f"Profile: {self.user.get_full_name()}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.resume:
            try:
                import os
                filename = os.path.basename(self.resume.name)
                self.resume.open("rb")
                file_content = self.resume.read()
                self.resume.close()

                ext = filename.split(".")[-1].lower()
                content_type = "application/pdf"
                if ext in ["doc", "docx"]:
                    content_type = "application/msword"
                if ext == "docx":
                    content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                ResumeFile.objects.update_or_create(
                    filename=filename,
                    defaults={
                        "content_type": content_type,
                        "data": file_content,
                    }
                )
            except Exception as e:
                print("Error saving resume binary to database:", e)


class ResumeFile(models.Model):
    filename     = models.CharField(max_length=255, unique=True)
    content_type = models.CharField(max_length=100)
    data         = models.BinaryField()
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "resume_files"

    def __str__(self):
        return self.filename
