from rest_framework import serializers
from users.utils import auto_id
from .models import Panelist, Interview, InterviewEvaluation

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


CORE_CRITERIA = {
    "Communication Skills",
    "Subject Knowledge",
    "Confidence",
    "Problem Solving",
    "Cultural Fit",
}


class InterviewEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewEvaluation
        fields = [
            "id",
            "panelist",
            "criteria",
            "custom_criteria",
            "overall_score",
            "recommendation",
            "notes",
            "submitted_at",
            "updated_at",
        ]
        read_only_fields = ["id", "overall_score", "submitted_at", "updated_at"]

    def validate_criteria(self, value):
        if not value:
            raise serializers.ValidationError("criteria cannot be empty.")
        keys = set(value.keys())
        if keys != CORE_CRITERIA:
            missing = CORE_CRITERIA - keys
            unexpected = keys - CORE_CRITERIA
            raise serializers.ValidationError(
                "criteria must contain exactly the core rubric. "
                f"Missing: {sorted(missing)}. Unexpected (move to "
                f"custom_criteria instead): {sorted(unexpected)}."
            )
        if not all(isinstance(v, int) and 1 <= v <= 5 for v in value.values()):
            raise serializers.ValidationError("Every core criterion score must be an integer 1-5.")
        return value

    def validate_custom_criteria(self, value):
        if value:
            if not all(isinstance(v, int) and 1 <= v <= 5 for v in value.values()):
                raise serializers.ValidationError("Every custom criterion score must be an integer 1-5.")
        return value


class InterviewSerializer(serializers.ModelSerializer):
    panel_details = PanelistSerializer(source="panel", many=True, read_only=True)
    panel         = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Panelist.objects.all(), write_only=True, required=False
    )
    evaluations   = InterviewEvaluationSerializer(many=True, read_only=True)
    panelist_evaluation = InterviewEvaluationSerializer(write_only=True, required=False)
    evaluation_summary = serializers.SerializerMethodField()

    class Meta:
        model  = Interview
        fields = [
            "id", "interview_id", "application", "candidate_name", "role", "date", "time",
            "panel", "panel_details", "score", "recommendation", "feedback", "status",
            "mode", "meeting_link", "round", "reminder_sent_at", "created_at", "updated_at",
            "evaluations", "panelist_evaluation", "evaluation_summary"
        ]
        read_only_fields = ["interview_id", "created_at", "updated_at"]

    def get_evaluation_summary(self, instance):
        evals = instance.evaluations.all()
        assigned_count = len(instance.panel.all())
        valid_scores = [e.overall_score for e in evals if e.overall_score is not None]
        submitted_count = len(valid_scores)
        
        if submitted_count > 0:
            avg = round(sum(valid_scores) / submitted_count)
        else:
            avg = None
            
        return {
            "assigned_count": assigned_count,
            "submitted_count": len(evals),
            "average_score": avg
        }

    def create(self, validated_data):
        panel_data = validated_data.pop("panel", [])
        validated_data["interview_id"] = auto_id("INT", Interview)

        # Set status to Scheduled if date and time are provided and status is default/Pending
        status = validated_data.get("status", "Pending")
        if validated_data.get("date") and validated_data.get("time") and status == "Pending":
            validated_data["status"] = "Scheduled"

        interview = Interview.objects.create(**validated_data)
        interview.panel.set(panel_data)

        # Trigger email notification task ONLY if date and time are both set
        if interview.date and interview.time:
            from django.db import transaction
            from notifications.tasks import send_interview_email_task
            transaction.on_commit(lambda: send_interview_email_task.delay(interview.id, is_reschedule=False))

        return interview

    def update(self, instance, validated_data):
        evaluation_data = validated_data.pop("panelist_evaluation", None)
        panel_data = validated_data.pop("panel", None)
        
        # Track if scheduling fields are changing
        scheduling_fields = ["date", "time", "mode", "meeting_link", "round"]
        scheduling_changed = False
        
        for field in scheduling_fields:
            if field in validated_data and getattr(instance, field) != validated_data[field]:
                scheduling_changed = True
                
        # Determine if it was already scheduled previously
        was_previously_scheduled = bool(instance.date and instance.time)

        # Update status if date and time are set and status is in Pending/Scheduled/Rescheduled
        status = validated_data.get("status", instance.status)
        if status in ["Pending", "Scheduled", "Rescheduled"]:
            has_date_time = bool(validated_data.get("date", instance.date) and validated_data.get("time", instance.time))
            if has_date_time:
                if scheduling_changed and was_previously_scheduled:
                    validated_data["status"] = "Rescheduled"
                else:
                    validated_data["status"] = "Scheduled"

        # Track completion status and score for candidate email trigger
        was_completed = (instance.status == "Completed")
        old_score = instance.score

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

        # Upsert scorecard if panelist_evaluation is provided
        if evaluation_data is not None:
            panelist = evaluation_data.pop("panelist")

            if panelist.name == 'admin':
                if not instance.panel.filter(pk=panelist.pk).exists():
                    instance.panel.add(panelist)
            elif not instance.panel.filter(pk=panelist.pk).exists():
                raise serializers.ValidationError(
                    {"panelist_evaluation": {"panelist": "This panelist is not assigned to this interview."}}
                )

            criteria = evaluation_data.get("criteria", {})
            custom_criteria = evaluation_data.get("custom_criteria", {})
            all_criteria = {**criteria, **(custom_criteria or {})}
            overall_score = self._compute_overall_score(all_criteria)

            InterviewEvaluation.objects.update_or_create(
                interview=instance,
                panelist=panelist,
                defaults={
                    **evaluation_data,
                    "overall_score": overall_score,
                },
            )

        from django.db import transaction

        # Trigger emails ONLY if the interview actually has a date and time scheduled!
        if instance.date and instance.time:
            if scheduling_changed:
                from notifications.tasks import send_interview_email_task
                is_reschedule = was_previously_scheduled
                transaction.on_commit(lambda: send_interview_email_task.delay(instance.id, is_reschedule=is_reschedule))
            elif new_panelist_ids_to_email:
                from notifications.tasks import send_new_panelists_email_task
                transaction.on_commit(lambda: send_new_panelists_email_task.delay(instance.id, new_panelist_ids_to_email))

        # Trigger candidate completed score email
        if instance.status == "Completed" and instance.score is not None:
            if not was_completed or instance.score != old_score:
                from notifications.tasks import send_interview_completed_email_task
                transaction.on_commit(lambda: send_interview_completed_email_task.delay(instance.id))

        return instance

    @staticmethod
    def _compute_overall_score(criteria):
        if not criteria:
            return None
        total = sum(criteria.values())
        return round(total / (len(criteria) * 5) * 100)



class InterviewScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Interview
        fields = ["score", "recommendation", "feedback", "status"]

    def update(self, instance, validated_data):
        was_completed = (instance.status == "Completed")
        old_score = instance.score

        instance = super().update(instance, validated_data)

        if instance.status == "Completed" and instance.score is not None:
            if not was_completed or instance.score != old_score:
                from django.db import transaction
                from notifications.tasks import send_interview_completed_email_task
                transaction.on_commit(lambda: send_interview_completed_email_task.delay(instance.id))

        return instance
