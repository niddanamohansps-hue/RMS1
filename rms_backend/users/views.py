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
        if user.is_candidate and "profile" in request.data:
            profile, _ = CandidateProfile.objects.get_or_create(user=user)
            ps = CandidateProfileUpdateSerializer(profile, data=request.data["profile"], partial=True)
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
