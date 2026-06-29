from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, CandidateProfile

class RegisterSerializer(serializers.ModelSerializer):
    """Candidate self-registration from the career page. Uses email + password only."""
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            "id", "first_name", "last_name", "email",
            "phone", "password", "confirm_password",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name":  {"required": True},
            "email":      {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
        )
        user.role = "candidate"
        user.save()
        CandidateProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Read-only user info returned after login / in profile."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ["id", "email", "first_name", "last_name", "phone", "role", "full_name"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = CandidateProfile
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    """Used by candidate to update their own profile."""
    class Meta:
        model = CandidateProfile
        exclude = ["user", "created_at", "updated_at"]
