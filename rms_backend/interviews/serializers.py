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
        from notifications.tasks import send_interview_email_task
        send_interview_email_task.delay(interview.id)

        return interview

    def update(self, instance, validated_data):
        panel_data = validated_data.pop("panel", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if panel_data is not None:
            instance.panel.set(panel_data)

        # Trigger email notification task
        from notifications.tasks import send_interview_email_task
        send_interview_email_task.delay(instance.id)

        return instance


class InterviewScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Interview
        fields = ["score", "recommendation", "feedback", "status"]
