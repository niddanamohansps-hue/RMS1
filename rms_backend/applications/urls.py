from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"applications",         views.JobApplicationViewSet,     basename="applications")
router.register(r"general-applications", views.GeneralApplicationViewSet, basename="general-applications")

urlpatterns = [
    path("", include(router.urls)),
]
