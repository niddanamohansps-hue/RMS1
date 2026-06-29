from rest_framework import serializers
from users.utils import auto_id
from .models import JobApplication, GeneralApplication
from jobs.models import JobPosting

class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField(read_only=True)
    candidate_email = serializers.SerializerMethodField(read_only=True)
    candidate_phone = serializers.SerializerMethodField(read_only=True)
    posting_title   = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = JobApplication
        fields = "__all__"
        read_only_fields = ["app_id", "role", "applied_date", "candidate", "updated_at"]

    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name()

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        return obj.candidate.phone

    def get_posting_title(self, obj):
        return obj.posting.role if obj.posting else obj.role

    def validate(self, attrs):
        request = self.context.get("request")
        posting = attrs.get("posting")
        if (
            request
            and posting
            and JobApplication.objects.filter(
                candidate=request.user, posting=posting
            ).exists()
        ):
            raise serializers.ValidationError(
                "You have already applied to this position."
            )
        return attrs

    def create(self, validated_data):
        validated_data["app_id"] = auto_id("JAPP", JobApplication)
        validated_data["candidate"] = self.context["request"].user
        if validated_data.get("posting"):
            validated_data["role"] = validated_data["posting"].role
        return super().create(validated_data)


class JobApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobApplication
        fields = ["status", "admin_note"]


class GeneralApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField(read_only=True)
    candidate_email = serializers.SerializerMethodField(read_only=True)
    candidate_phone = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = GeneralApplication
        fields = "__all__"
        read_only_fields = ["app_id", "applied_date", "candidate"]

    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name()

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        return obj.candidate.phone

    def create(self, validated_data):
        validated_data["app_id"] = auto_id("GAPP", GeneralApplication)
        validated_data["candidate"] = self.context["request"].user
        return super().create(validated_data)
