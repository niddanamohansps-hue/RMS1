"""
Django settings for rms_backend (South Point School — RMS)
"""

import os
import sys
import urllib.parse as urlparse
from pathlib import Path
from datetime import timedelta
# pyrefly: ignore [missing-import]
from decouple import config, Csv
from celery.schedules import crontab

# ─── Base ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
import os

ALLOWED_HOSTS = os.environ.get(
    "ALLOWED_HOSTS",
    "*" if DEBUG else "localhost,127.0.0.1,https://rms1-1-suhq.onrender.com"
).split(",")

render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if render_host and render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_host)

# ─── Installed Apps ──────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    # Local
    "users",
    "jobs",
    "applications",
    "interviews",
    "onboarding",
    "notifications",
]

# ─── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",          # MUST be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "rms_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "rms_backend.wsgi.application"

# ─── Database ─────────────────────────────────────────────────────────────────

if "test" in sys.argv:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    db_url = config("DATABASE_URL", default=None)
    if db_url:
        url = urlparse.urlparse(db_url)
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": url.path[1:],
                "USER": url.username,
                "PASSWORD": url.password,
                "HOST": url.hostname,
                "PORT": url.port or 5432,
                "CONN_MAX_AGE": config("CONN_MAX_AGE", default=600, cast=int),
            }
        }
    else:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": config("DB_NAME", default="rms_db"),
                "USER": config("DB_USER", default="rms_user"),
                "PASSWORD": config("DB_PASSWORD", default=""),
                "HOST": config("DB_HOST", default="127.0.0.1"),
                "PORT": config("DB_PORT", default="5432"),
                "CONN_MAX_AGE": config("CONN_MAX_AGE", default=600, cast=int),
            }
        }

# Custom user model
AUTH_USER_MODEL = "users.User"

# ─── Password Validation ──────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# ─── Static & Media files ─────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ORIGINS",
    default="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://192.168.55.104:5173,http://192.168.55.104:5174",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://192.168.55.104:5173,http://192.168.55.104:5174",
    cast=Csv(),
)

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10000,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "300/minute",
    },
}

# ─── JWT ─────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("ACCESS_TOKEN_LIFETIME", default=60, cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=config("REFRESH_TOKEN_LIFETIME", default=1440, cast=int)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─── Security (production hardening) ─────────────────────────────────────────
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"

# ─── Celery & Redis ──────────────────────────────────────────────────────────
USE_REDIS_CELERY = config("USE_REDIS_CELERY", default=False, cast=bool)

if USE_REDIS_CELERY:
    CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://127.0.0.1:6379/0")
    CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", default="redis://127.0.0.1:6379/0")
    CELERY_TASK_ALWAYS_EAGER = False
else:
    # Eager mode: tasks run synchronously in-process, NO Redis or celery workers required!
    CELERY_BROKER_URL = "memory://"
    CELERY_RESULT_BACKEND = None
    CELERY_TASK_ALWAYS_EAGER = True

CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# Celery Beat Schedule (Only active if using Redis & worker process)
if USE_REDIS_CELERY:
    CELERY_BEAT_SCHEDULE = {
        "check-expired-jobs-every-hour": {
            "task": "jobs.tasks.check_expired_job_postings",
            "schedule": crontab(minute=0, hour="*/1"), # every hour
        }
    }

# ─── Cache (Redis Cache Backend with LocMem fallback) ────────────────────────
if USE_REDIS_CELERY:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": config("REDIS_CACHE_URL", default="redis://127.0.0.1:6379/1"),
        }
    }
else:
    # Local memory cache: stores cache in RAM, 100% free and requires no external services!
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }

# ─── Email Configuration ─────────────────────────────────────────────────────
USE_SMTP_EMAIL = config("USE_SMTP_EMAIL", default=False, cast=bool)

if USE_SMTP_EMAIL:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
    EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
    EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
    EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
    EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")  # Use a Gmail App Password
    DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="no-reply@southpoint.edu")
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

