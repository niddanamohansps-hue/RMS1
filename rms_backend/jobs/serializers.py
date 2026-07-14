from rest_framework import serializers
from users.utils import auto_id
from .models import (
    JobCategory, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting
)

def get_history_from_approvals(obj, is_job_request=False):
    history_list = []
    
    # Try fetching from prefetched relations to avoid N+1 queries
    has_prefetched = hasattr(obj, "_prefetched_objects_cache") and "approvals" in obj._prefetched_objects_cache
    if has_prefetched:
        histories = []
        for app in obj.approvals.all():
            histories.extend(list(app.history.all()))
        histories.sort(key=lambda x: x.id)
    else:
        from .models import ApprovalHistory
        if is_job_request:
            histories = list(ApprovalHistory.objects.filter(approval__job_request=obj).order_by("id"))
        else:
            histories = list(ApprovalHistory.objects.filter(approval__role_request=obj).order_by("id"))
            
    if not histories:
        # Construct fallback submitted history entry
        submitted_by = obj.submitted_by
        if not submitted_by and getattr(obj, "created_by", None):
            submitted_by = obj.created_by.get_full_name()
        if not submitted_by:
            submitted_by = "Current User"

        date_val = ""
        if hasattr(obj, "created_at") and obj.created_at:
            date_val = obj.created_at.date().isoformat()
        elif hasattr(obj, "date") and obj.date:
            date_val = obj.date.isoformat()

        history_list.append({
            "act": "Submitted",
            "by": submitted_by,
            "date": date_val,
            "note": ""
        })
        return history_list
        
    for h in histories:
        history_list.append({
            "act": h.action,
            "by": h.acted_by,
            "date": h.date.isoformat() if h.date else "",
            "note": h.note or ""
        })
    return history_list


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

    def validate(self, attrs):
        role = attrs.get("role")
        department = attrs.get("department")
        if role:
            attrs["role"] = role.strip()
        if department:
            attrs["department"] = department.strip()
            
        role_val = attrs.get("role")
        dept_val = attrs.get("department")
        exp_val = attrs.get("experience", "")
        sal_val = attrs.get("salary_range", "")
        if role_val and dept_val:
            qs = ExistingRole.objects.filter(
                role__iexact=role_val,
                department__iexact=dept_val,
                experience__iexact=exp_val or "",
                salary_range__iexact=sal_val or "",
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"role": "A role with this name, department, experience, and salary range already exists."}
                )
        return attrs

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
        return get_history_from_approvals(obj, is_job_request=False)

    def validate(self, attrs):
        role = attrs.get("role")
        department = attrs.get("department")
        if role:
            attrs["role"] = role.strip()
        if department:
            attrs["department"] = department.strip()
        return attrs

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

    def validate(self, attrs):
        role = attrs.get("role")
        department = attrs.get("department")
        if role:
            attrs["role"] = role.strip()
        if department:
            attrs["department"] = department.strip()
        return attrs

    def create(self, validated_data):
        validated_data["request_id"] = auto_id("JR", JobRequest)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)

    def get_history(self, obj):
        return get_history_from_approvals(obj, is_job_request=True)


class ApprovalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ApprovalHistory
        fields = "__all__"
        read_only_fields = ["date"]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField(read_only=True)
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

    def get_history(self, obj):
        has_prefetched = hasattr(obj, "_prefetched_objects_cache") and "history" in obj._prefetched_objects_cache
        if has_prefetched:
            histories = list(obj.history.all())
            histories.sort(key=lambda x: x.id)
        else:
            from .models import ApprovalHistory
            if obj.job_request:
                histories = list(ApprovalHistory.objects.filter(approval__job_request=obj.job_request).order_by("id"))
            elif obj.role_request:
                histories = list(ApprovalHistory.objects.filter(approval__role_request=obj.role_request).order_by("id"))
            else:
                histories = list(obj.history.all().order_by("id"))
        return ApprovalHistorySerializer(histories, many=True).data

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
        if obj.role_request:
            return obj.role_request.type
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
        count = getattr(obj, "annotated_application_count", None)
        if count is not None:
            return count
        return obj.job_applications.count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get("educational_qualifications") and instance.job_request:
            ret["educational_qualifications"] = instance.job_request.educational_qualifications or ""
        if not ret.get("skills_required") and instance.job_request:
            ret["skills_required"] = instance.job_request.skills_required or ""
        
        matching_role = None
        need_matching_role = not ret.get("experience") or not ret.get("department") or not ret.get("salary_range")
        if need_matching_role:
            if "matching_roles" not in self.context:
                from jobs.models import ExistingRole
                self.context["matching_roles"] = {r.role: r for r in ExistingRole.objects.all()}
            matching_role = self.context["matching_roles"].get(instance.role)

        if not ret.get("experience"):
            if instance.job_request and instance.job_request.experience:
                ret["experience"] = instance.job_request.experience
            elif matching_role and matching_role.experience:
                ret["experience"] = matching_role.experience

        if not ret.get("department"):
            if instance.job_request and instance.job_request.department:
                ret["department"] = instance.job_request.department
            elif matching_role and matching_role.department:
                ret["department"] = matching_role.department

        if not ret.get("salary_range"):
            if instance.job_request and instance.job_request.salary_range:
                ret["salary_range"] = instance.job_request.salary_range
            elif matching_role and matching_role.salary_range:
                ret["salary_range"] = matching_role.salary_range

        if not ret.get("category") and instance.job_request and instance.job_request.category:
            ret["category"] = instance.job_request.category.name
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
        
        matching_role = None
        need_matching_role = not ret.get("experience") or not ret.get("department") or not ret.get("salary_range")
        if need_matching_role:
            if "matching_roles" not in self.context:
                from jobs.models import ExistingRole
                self.context["matching_roles"] = {r.role: r for r in ExistingRole.objects.all()}
            matching_role = self.context["matching_roles"].get(instance.role)

        if not ret.get("experience"):
            if instance.job_request and instance.job_request.experience:
                ret["experience"] = instance.job_request.experience
            elif matching_role and matching_role.experience:
                ret["experience"] = matching_role.experience

        if not ret.get("department"):
            if instance.job_request and instance.job_request.department:
                ret["department"] = instance.job_request.department
            elif matching_role and matching_role.department:
                ret["department"] = matching_role.department

        if not ret.get("salary_range"):
            if instance.job_request and instance.job_request.salary_range:
                ret["salary_range"] = instance.job_request.salary_range
            elif matching_role and matching_role.salary_range:
                ret["salary_range"] = matching_role.salary_range

        if not ret.get("category") and instance.job_request and instance.job_request.category:
            ret["category"] = instance.job_request.category.name
        return ret
