from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsHRAdmin
# pyrefly: ignore [missing-import]
from .models import Panelist, Interview
# pyrefly: ignore [missing-import]
from .serializers import PanelistSerializer, InterviewSerializer, InterviewScoreSerializer

class PanelistViewSet(viewsets.ModelViewSet):
    serializer_class   = PanelistSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["name", "email", "department"]
    ordering_fields    = ["name"]

    def get_queryset(self):
        Panelist.objects.get_or_create(
            name="admin",
            defaults={"email": "admin@southpoint.edu", "department": "HR"}
        )
        return Panelist.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            from django.db.models import Q
            full_name = f"{user.first_name} {user.last_name}".strip()
            return Interview.objects.filter(
                Q(application__candidate=user) | Q(candidate_name__iexact=full_name)
            ).select_related("application", "application__candidate").prefetch_related("panel", "evaluations")
        
        # If the user is a panelist (and not the main HR admin or superuser), filter interviews to only theirs
        if not user.is_superuser and user.email != "hr@southpoint.edu":
            if Panelist.objects.filter(email=user.email).exists():
                return Interview.objects.filter(panel__email=user.email).distinct().select_related("application", "application__candidate").prefetch_related("panel", "evaluations")

        return Interview.objects.all().select_related("application", "application__candidate").prefetch_related("panel", "evaluations")

    def get_permissions(self):
        if self.action in ["list", "retrieve", "score", "upcoming"]:
            return [IsAuthenticated()]
        return [IsHRAdmin()]

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def score(self, request, pk=None):
        interview = self.get_object()
        serializer = InterviewScoreSerializer(interview, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if interview.application:
            from notifications.tasks import create_notification_task
            create_notification_task.delay(
                recipient_id=interview.application.candidate.id,
                notification_type="interview_scheduled",
                title=f"Interview Update — {interview.role}",
                message=f"Your Round {interview.round} interview status is now '{interview.status}'.",
            )
        return Response(InterviewSerializer(interview).data)

    @action(detail=True, methods=["post"])
    def remind(self, request, pk=None):
        interview = self.get_object()
        from django.utils import timezone
        from notifications.tasks import send_interview_reminder_task
        send_interview_reminder_task.delay(interview.id)
        
        interview.reminder_sent_at = timezone.now()
        interview.save()
        return Response(InterviewSerializer(interview).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming(self, request):
        today = timezone.now().date()
        if request.user.role == "candidate":
            qs = Interview.objects.filter(
                application__candidate=request.user,
                status="Scheduled",
                date__gte=today,
            ).select_related("application", "application__candidate").prefetch_related("panel")
        else:
            qs = Interview.objects.filter(
                status="Scheduled", date__gte=today
            ).select_related("application", "application__candidate").prefetch_related("panel")
        return Response(InterviewSerializer(qs, many=True).data)
