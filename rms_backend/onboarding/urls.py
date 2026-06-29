from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"offers",     views.OfferViewSet,     basename="offers")
router.register(r"onboarding", views.OnboardingViewSet, basename="onboarding")

urlpatterns = [
    path("", include(router.urls)),
]
