"""rms_backend URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import serve_resume_from_db
from django.http import JsonResponse
from django.core.mail import send_mail
import traceback

def test_email_view(request):
    try:
        result = send_mail(
            subject="Render Live SMTP Debug",
            message="Testing SMTP configuration with fail_silently=False",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=["niddanamohan@gmail.com"],
            fail_silently=False
        )
        return JsonResponse({"success": True, "result": result, "message": "Email sent successfully!"})
    except Exception as e:
        error_msg = traceback.format_exc()
        return JsonResponse({"success": False, "error": str(e), "traceback": error_msg}, status=500)

urlpatterns = [
    path("api/test-email-debug/", test_email_view),
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

