from rest_framework import serializers
from users.utils import auto_id
from .models import Panelist, Interview

class PanelistSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Panelist
        fields = "__all__"
        read_only_fields = ["created_at"]

    def validate_email(self, value):
        qs = Panelist.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A panelist with this email already exists.")
        return value


class InterviewSerializer(serializers.ModelSerializer):
    panel_details = PanelistSerializer(source="panel", many=True, read_only=True)
    panel         = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Panelist.objects.all(), write_only=True
    )

    class Meta:
        model  = Interview
        fields = "__all__"
        read_only_fields = ["interview_id", "created_at", "updated_at"]

    def create(self, validated_data):
        panel_data = validated_data.pop("panel", [])
        validated_data["interview_id"] = auto_id("INT", Interview)
        interview = Interview.objects.create(**validated_data)
        interview.panel.set(panel_data)

        # Trigger email notification task
        from django.db import transaction
        from notifications.tasks import send_interview_email_task
        transaction.on_commit(lambda: send_interview_email_task.delay(interview.id))

        return interview

    def update(self, instance, validated_data):
        panel_data = validated_data.pop("panel", None)
        
        # Track if scheduling fields are changing
        scheduling_fields = ["date", "time", "mode", "meeting_link", "round"]
        has_scheduling_changes = False
        
        for field in scheduling_fields:
            if field in validated_data and getattr(instance, field) != validated_data[field]:
                has_scheduling_changes = True
                
        if panel_data is not None:
            current_panel_ids = set(instance.panel.values_list("id", flat=True))
            new_panel_ids = {p.id for p in panel_data}
            if current_panel_ids != new_panel_ids:
                has_scheduling_changes = True

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if panel_data is not None:
            instance.panel.set(panel_data)

        # Trigger email notification task only if scheduling details changed
        if has_scheduling_changes:
            from django.db import transaction
            from notifications.tasks import send_interview_email_task
            transaction.on_commit(lambda: send_interview_email_task.delay(instance.id))

        return instance


class InterviewScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Interview
        fields = ["score", "recommendation", "feedback", "status"]
