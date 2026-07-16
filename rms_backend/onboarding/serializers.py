from rest_framework import serializers
from users.utils import auto_id
from .models import Offer, OnboardingRecord


class OnboardingSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model  = OnboardingRecord
        fields = "__all__"
        read_only_fields = ["record_id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["record_id"] = auto_id("ONB", OnboardingRecord)
        return super().create(validated_data)


class OfferSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    onboarding = OnboardingSerializer(read_only=True)

    class Meta:
        model  = Offer
        fields = "__all__"
        read_only_fields = ["offer_id", "created_at", "updated_at"]

    def get_department(self, obj):
        if not obj.role:
            return "General"
        if "role_departments" not in self.context:
            from jobs.models import ExistingRole, JobPosting
            role_depts = {r.role.lower(): r.department for r in ExistingRole.objects.all() if r.role}
            for p in JobPosting.objects.all():
                if p.role and p.role.lower() not in role_depts:
                    role_depts[p.role.lower()] = p.department
            self.context["role_departments"] = role_depts
        
        return self.context["role_departments"].get(obj.role.lower(), "General")

    def validate(self, attrs):
        candidate = attrs.get("candidate")
        candidate_name = attrs.get("candidate_name")
        role_name = attrs.get("role")
        if not candidate and candidate_name:
            from django.contrib.auth import get_user_model
            from django.db.models import Value
            from django.db.models.functions import Concat
            from applications.models import JobApplication, GeneralApplication
            # Try to match from JobApplication first to get the exact candidate
            app = None
            if role_name:
                app = JobApplication.objects.filter(candidate__first_name__iexact=candidate_name.split()[0], role__iexact=role_name).first()
            if not app:
                app = JobApplication.objects.filter(candidate__first_name__iexact=candidate_name.split()[0]).first()
            if app and app.candidate:
                attrs["candidate"] = app.candidate
            else:
                app2 = None
                if role_name:
                    app2 = GeneralApplication.objects.filter(candidate__first_name__iexact=candidate_name.split()[0], preferred_role__iexact=role_name).first()
                if not app2:
                    app2 = GeneralApplication.objects.filter(candidate__first_name__iexact=candidate_name.split()[0]).first()
                if app2 and app2.candidate:
                    attrs["candidate"] = app2.candidate
                else:
                    user = get_user_model().objects.annotate(
                        full_name=Concat('first_name', Value(' '), 'last_name')
                    ).filter(full_name__iexact=candidate_name).first()
                    if user:
                        attrs["candidate"] = user
        return attrs

    def create(self, validated_data):
        validated_data["offer_id"] = auto_id("OFR", Offer)
        return super().create(validated_data)


class OfferStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Offer
        fields = ["status"]


class OnboardingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OnboardingRecord
        fields = [
            "task_profile", "task_offer", "task_docs_upload",
            "task_docs_verify", "task_bgc", "task_checkin", "status",
        ]
