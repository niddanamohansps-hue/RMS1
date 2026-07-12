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
        many=True, queryset=Panelist.objects.all(), write_only=True, required=False
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

        # Trigger email notification task ONLY if date and time are both set
        if interview.date and interview.time:
            from django.db import transaction
            from notifications.tasks import send_interview_email_task
            transaction.on_commit(lambda: send_interview_email_task.delay(interview.id, is_reschedule=False))

        return interview

    def update(self, instance, validated_data):
        panel_data = validated_data.pop("panel", None)
        
        # Track if scheduling fields are changing
        scheduling_fields = ["date", "time", "mode", "meeting_link", "round"]
        scheduling_changed = False
        
        for field in scheduling_fields:
            if field in validated_data and getattr(instance, field) != validated_data[field]:
                scheduling_changed = True
                
        # Determine if it was already scheduled previously
        was_previously_scheduled = bool(instance.date and instance.time)

        new_panelist_ids_to_email = []
        if panel_data is not None:
            current_panel_ids = set(instance.panel.values_list("id", flat=True))
            new_panel_ids = {p.id for p in panel_data}
            
            # If scheduling itself changed, we will email ALL currently assigned panelists (new_panel_ids) the updated schedule.
            # But if scheduling did NOT change, and only panelists changed, we only email the newly added panelists.
            if not scheduling_changed:
                added_panel_ids = new_panel_ids - current_panel_ids
                new_panelist_ids_to_email = list(added_panel_ids)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if panel_data is not None:
            instance.panel.set(panel_data)

        # Trigger emails ONLY if the interview actually has a date and time scheduled!
        if instance.date and instance.time:
            from django.db import transaction
            if scheduling_changed:
                from notifications.tasks import send_interview_email_task
                is_reschedule = was_previously_scheduled
                transaction.on_commit(lambda: send_interview_email_task.delay(instance.id, is_reschedule=is_reschedule))
            elif new_panelist_ids_to_email:
                from notifications.tasks import send_new_panelists_email_task
                transaction.on_commit(lambda: send_new_panelists_email_task.delay(instance.id, new_panelist_ids_to_email))

        return instance


class InterviewScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Interview
        fields = ["score", "recommendation", "feedback", "status"]
