from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, CandidateProfile
from .serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    CandidateProfileSerializer, CandidateProfileUpdateSerializer
)
from .permissions import IsHRAdmin, IsHRAdminOrReadOnly, IsOwnerOrHRAdmin, IsCandidate

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — candidate self-registration"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
                "tokens": {
                    "access":  str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist refresh token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """GET/PUT /api/auth/me/ — current user profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        if request.user.is_candidate:
            try:
                profile = CandidateProfileSerializer(request.user.profile).data
                data["profile"] = profile
            except CandidateProfile.DoesNotExist:
                data["profile"] = None
        return Response(data)

    def put(self, request):
        user = request.user
        for field in ["first_name", "last_name", "phone"]:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        if user.is_candidate:
            profile, _ = CandidateProfile.objects.get_or_create(user=user)
            profile_data = request.data.get("profile")
            if isinstance(profile_data, str):
                import json
                try:
                    profile_data = json.loads(profile_data)
                except ValueError:
                    profile_data = {}
            if profile_data is None:
                profile_data = {}
            
            file_data = {}
            if "profile.resume" in request.FILES:
                file_data["resume"] = request.FILES["profile.resume"]
            elif "resume" in request.FILES:
                file_data["resume"] = request.FILES["resume"]
            
            serializer_data = {**profile_data, **file_data}
            if serializer_data:
                ps = CandidateProfileUpdateSerializer(profile, data=serializer_data, partial=True)
                ps.is_valid(raise_exception=True)
                ps.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["old_password"]):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"message": "Password changed successfully."})


import random
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        email = email.strip().lower()
        if not User.objects.filter(email=email).exists():
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        otp = str(random.randint(100000, 999999))
        
        # Store OTP in cache for 5 minutes (300 seconds)
        cache.set(f"password_reset_otp_{email}", otp, timeout=300)
        
        # Send Email
        subject = "Password Reset OTP - South Point School"
        message = f"""Dear User,

You have requested to reset your password. 

Your 6-digit One-Time Password (OTP) is:

{otp}

This OTP is valid for 5 minutes. Please do not share this OTP with anyone.

Best regards,
South Point School Recruitment Team"""
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        email = email.strip().lower()
        cached_otp = cache.get(f"password_reset_otp_{email}")
        
        if not cached_otp:
            return Response({"error": "OTP has expired or does not exist. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        
        if cached_otp != str(otp).strip():
            return Response({"error": "Invalid OTP. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified in cache for 5 minutes
        cache.set(f"password_reset_verified_{email}", True, timeout=300)
        return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        
        if not email or not otp or not new_password or not confirm_password:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        email = email.strip().lower()
        
        # Verify cached flag or OTP directly
        is_verified = cache.get(f"password_reset_verified_{email}")
        cached_otp = cache.get(f"password_reset_otp_{email}")
        
        if not is_verified and cached_otp != str(otp).strip():
            return Response({"error": "Session expired or invalid OTP. Please verify again."}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # Clear cache
            cache.delete(f"password_reset_otp_{email}")
            cache.delete(f"password_reset_verified_{email}")
            
            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)


from django.http import HttpResponse, Http404

def serve_resume_from_db(request, year, month, filename):
    from users.models import ResumeFile
    try:
        resume_file = ResumeFile.objects.get(filename=filename)
        response = HttpResponse(resume_file.data, content_type=resume_file.content_type)
        response["Content-Disposition"] = f'inline; filename="{resume_file.filename}"'
        return response
    except ResumeFile.DoesNotExist:
        import os
        from django.conf import settings
        from django.views.static import serve
        
        path = f"resumes/{year}/{month}/{filename}"
        try:
            return serve(request, path, document_root=settings.MEDIA_ROOT)
        except Http404:
            raise Http404("Resume not found in database or local disk")
