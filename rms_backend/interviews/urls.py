from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"panelists",  views.PanelistViewSet,  basename="panelists")
router.register(r"interviews", views.InterviewViewSet, basename="interviews")

urlpatterns = [
    path("", include(router.urls)),
]
