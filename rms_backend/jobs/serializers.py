from rest_framework import serializers
from users.utils import auto_id
from .models import (
    JobCategory, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting
)

class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = "__all__"


class ExistingRoleSerializer(serializers.ModelSerializer):
    vacancies = serializers.ReadOnlyField()

    class Meta:
        model  = ExistingRole
        fields = "__all__"
        read_only_fields = ["role_id", "created_at", "updated_at"]

    def create(self, validated_data):
        if not validated_data.get("role_id"):
            validated_data["role_id"] = auto_id("ROL", ExistingRole)
        return super().create(validated_data)


class RoleRequestSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = RoleRequest
        fields = "__all__"
        read_only_fields = ["request_id", "date", "reviewed_at", "created_by"]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else obj.submitted_by

    def create(self, validated_data):
        validated_data["request_id"] = auto_id("RR", RoleRequest)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class RoleRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RoleRequest
        fields = ["status", "reviewer_note"]


class JobRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobRequest
        fields = "__all__"
        read_only_fields = ["request_id", "created_at", "updated_at", "created_by"]

    def create(self, validated_data):
        validated_data["request_id"] = auto_id("JR", JobRequest)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class ApprovalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ApprovalHistory
        fields = "__all__"
        read_only_fields = ["date"]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    history = ApprovalHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = ApprovalRequest
        fields = "__all__"
        read_only_fields = ["date"]


class ApprovalActionSerializer(serializers.Serializer):
    action   = serializers.ChoiceField(choices=["Approve", "Reject", "Send Back"])
    note     = serializers.CharField(required=False, allow_blank=True)
    acted_by = serializers.CharField(required=False)


class JobPostingSerializer(serializers.ModelSerializer):
    application_count = serializers.SerializerMethodField()
    category          = serializers.SlugRelatedField(
        slug_field="name",
        queryset=JobCategory.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model  = JobPosting
        fields = "__all__"
        read_only_fields = ["posting_id", "created_at", "updated_at"]

    def get_application_count(self, obj):
        return getattr(obj, "annotated_application_count", obj.job_applications.count())

    def create(self, validated_data):
        validated_data["posting_id"] = auto_id("JP", JobPosting)
        return super().create(validated_data)


class JobPostingPublicSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field="name",
        queryset=JobCategory.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model  = JobPosting
        fields = [
            "id", "posting_id", "role", "department", "type", "category",
            "location", "description", "qualifications", "experience",
            "salary_range", "deadline", "expiry_date", "status",
        ]
