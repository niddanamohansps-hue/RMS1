"""rms_backend URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import serve_resume_from_db

urlpatterns = [
    path("media/resumes/<str:year>/<str:month>/<str:filename>", serve_resume_from_db, name="serve-resume"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("jobs.urls")),
    path("api/", include("applications.urls")),
    path("api/", include("interviews.urls")),
    path("api/", include("onboarding.urls")),
    path("api/", include("notifications.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


