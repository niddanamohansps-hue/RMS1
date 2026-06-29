from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsHRAdmin, IsCandidate
from notifications.models import Notification
from .models import JobApplication, GeneralApplication
from .serializers import (
    JobApplicationSerializer, JobApplicationStatusSerializer,
    GeneralApplicationSerializer
)

class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    Candidates: can create and view their own.
    HR Admins: can view all, update status.
    """
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return JobApplication.objects.filter(candidate=user).select_related("posting", "candidate")
        return JobApplication.objects.all().select_related("posting", "candidate")

    def get_permissions(self):
        if self.action == "create":
            return [IsCandidate()]
        if self.action in ["update", "partial_update", "destroy", "update_status"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        apps = JobApplication.objects.filter(candidate=request.user).select_related("posting", "candidate")
        serializer = JobApplicationSerializer(apps, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], permission_classes=[IsHRAdmin])
    def update_status(self, request, pk=None):
        instance = self.get_object()
        serializer = JobApplicationStatusSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "status" in request.data:
            from notifications.tasks import create_notification_task
            create_notification_task.delay(
                recipient_id=instance.candidate.id,
                notification_type="application_status",
                title=f"Application Update: {instance.role}",
                message=(
                    f"Your application for {instance.role} has been updated to "
                    f"'{instance.status}'."
                ),
            )
        return Response(JobApplicationSerializer(instance, context={"request": request}).data)


class GeneralApplicationViewSet(viewsets.ModelViewSet):
    """
    Career Page → "Submit Profile" (general / talent-pool).
    Admin Dashboard → Applications tab (General).
    """
    serializer_class = GeneralApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return GeneralApplication.objects.filter(candidate=user)
        return GeneralApplication.objects.all().select_related("candidate")

    def get_permissions(self):
        if self.action == "create":
            return [IsCandidate()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        apps = GeneralApplication.objects.filter(candidate=request.user).select_related("candidate")
        return Response(GeneralApplicationSerializer(apps, many=True, context={"request": request}).data)
