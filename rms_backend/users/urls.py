from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("auth/register/",        views.RegisterView.as_view(),       name="auth-register"),
    path("auth/login/",           TokenObtainPairView.as_view(),      name="auth-login"),
    path("auth/token/refresh/",   TokenRefreshView.as_view(),         name="auth-token-refresh"),
    path("auth/logout/",          views.LogoutView.as_view(),         name="auth-logout"),
    path("auth/me/",              views.MeView.as_view(),             name="auth-me"),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="auth-change-password"),
    path("auth/password-reset/send-otp/", views.SendOTPView.as_view(), name="auth-send-otp"),
    path("auth/password-reset/verify-otp/", views.VerifyOTPView.as_view(), name="auth-verify-otp"),
    path("auth/password-reset/reset/", views.ResetPasswordView.as_view(), name="auth-reset-password"),
]
