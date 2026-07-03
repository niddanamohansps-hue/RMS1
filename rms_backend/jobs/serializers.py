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
    history = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = RoleRequest
        fields = "__all__"
        read_only_fields = ["request_id", "date", "reviewed_at", "created_by"]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else obj.submitted_by

    def get_history(self, obj):
        history_list = []
        history_list.append({
            "act": "Submitted",
            "by": obj.submitted_by or (obj.created_by.get_full_name() if obj.created_by else "Current User"),
            "date": obj.date.isoformat() if obj.date else "",
            "note": ""
        })
        for apr in obj.approvals.all():
            for h in apr.history.all().order_by("date"):
                history_list.append({
                    "act": h.action,
                    "by": h.acted_by,
                    "date": h.date.isoformat() if h.date else "",
                    "note": h.note or ""
                })
        return history_list

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
    history = serializers.SerializerMethodField(read_only=True)
    category = serializers.SlugRelatedField(
        slug_field="name",
        queryset=JobCategory.objects.all(),
        allow_null=True,
        required=False
    )

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

    def get_history(self, obj):
        history_list = []
        history_list.append({
            "act": "Submitted",
            "by": obj.submitted_by or (obj.created_by.get_full_name() if obj.created_by else "Current User"),
            "date": obj.created_at.date().isoformat() if obj.created_at else "",
            "note": ""
        })
        for apr in obj.approvals.all():
            for h in apr.history.all().order_by("date"):
                history_list.append({
                    "act": h.action,
                    "by": h.acted_by,
                    "date": h.date.isoformat() if h.date else "",
                    "note": h.note or ""
                })
        return history_list


class ApprovalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ApprovalHistory
        fields = "__all__"
        read_only_fields = ["date"]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    history = ApprovalHistorySerializer(many=True, read_only=True)
    department = serializers.SerializerMethodField(read_only=True)
    justification = serializers.SerializerMethodField(read_only=True)
    vacancies = serializers.SerializerMethodField(read_only=True)
    experience = serializers.SerializerMethodField(read_only=True)
    salary_range = serializers.SerializerMethodField(read_only=True)
    employment_type = serializers.SerializerMethodField(read_only=True)
    source_request_id = serializers.SerializerMethodField(read_only=True)
    source_db_id = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)
    location = serializers.SerializerMethodField(read_only=True)
    category = serializers.SerializerMethodField(read_only=True)
    educational_qualifications = serializers.SerializerMethodField(read_only=True)
    skills_required = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = ApprovalRequest
        fields = "__all__"
        read_only_fields = ["date"]

    def get_department(self, obj):
        if obj.department:
            return obj.department
        if obj.job_request:
            return obj.job_request.department or ""
        if obj.role_request:
            return obj.role_request.department or ""
        return ""

    def get_source_request_id(self, obj):
        """The request_id of the linked RoleRequest or JobRequest."""
        if obj.role_request:
            return obj.role_request.request_id
        if obj.job_request:
            return obj.job_request.request_id
        return None

    def get_source_db_id(self, obj):
        """The pk of the linked RoleRequest or JobRequest."""
        if obj.role_request:
            return obj.role_request.pk
        if obj.job_request:
            return obj.job_request.pk
        return None

    def get_justification(self, obj):
        if obj.role_request:
            return obj.role_request.justification
        if obj.job_request:
            return obj.job_request.justification or obj.job_request.description or ""
        return ""

    def get_vacancies(self, obj):
        if obj.job_request:
            return obj.job_request.vacancies
        return None

    def get_experience(self, obj):
        if obj.job_request:
            return obj.job_request.experience
        if obj.role_request:
            return obj.role_request.experience
        return ""

    def get_salary_range(self, obj):
        if obj.job_request:
            return obj.job_request.salary_range
        if obj.role_request:
            return obj.role_request.salary_range
        return ""

    def get_employment_type(self, obj):
        if obj.job_request:
            return obj.job_request.type
        return ""

    def get_description(self, obj):
        if obj.job_request:
            return obj.job_request.description
        return ""

    def get_location(self, obj):
        if obj.job_request:
            return obj.job_request.location
        return ""

    def get_educational_qualifications(self, obj):
        if obj.job_request:
            return obj.job_request.educational_qualifications
        return ""

    def get_skills_required(self, obj):
        if obj.job_request:
            return obj.job_request.skills_required
        return ""

    def get_category(self, obj):
        if obj.job_request and obj.job_request.category:
            return obj.job_request.category.name
        return ""


class ApprovalActionSerializer(serializers.Serializer):
    action                     = serializers.ChoiceField(choices=["Approve", "Reject", "Send Back"])
    note                       = serializers.CharField(required=False, allow_blank=True)
    acted_by                   = serializers.CharField(required=False)
    department                 = serializers.CharField(required=False, allow_blank=True)
    role                       = serializers.CharField(required=False, allow_blank=True)
    salary_range               = serializers.CharField(required=False, allow_blank=True)
    experience                 = serializers.CharField(required=False, allow_blank=True)
    location                   = serializers.CharField(required=False, allow_blank=True)
    category                   = serializers.CharField(required=False, allow_blank=True)
    vacancies                  = serializers.IntegerField(required=False)
    employment_type            = serializers.CharField(required=False, allow_blank=True)
    description                = serializers.CharField(required=False, allow_blank=True)
    educational_qualifications = serializers.CharField(required=False, allow_blank=True)
    skills_required            = serializers.CharField(required=False, allow_blank=True)


class JobPostingSerializer(serializers.ModelSerializer):
    application_count          = serializers.SerializerMethodField()
    category                   = serializers.SlugRelatedField(
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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get("educational_qualifications") and instance.job_request:
            ret["educational_qualifications"] = instance.job_request.educational_qualifications or ""
        if not ret.get("skills_required") and instance.job_request:
            ret["skills_required"] = instance.job_request.skills_required or ""
        return ret

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
            "educational_qualifications", "skills_required",
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get("educational_qualifications") and instance.job_request:
            ret["educational_qualifications"] = instance.job_request.educational_qualifications or ""
        if not ret.get("skills_required") and instance.job_request:
            ret["skills_required"] = instance.job_request.skills_required or ""
        return ret
