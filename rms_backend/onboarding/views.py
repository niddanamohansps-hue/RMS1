from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsHRAdmin
from .models import Offer, OnboardingRecord
from .serializers import OfferSerializer, OnboardingSerializer, OnboardingTaskSerializer
from users.utils import auto_id

class OfferViewSet(viewsets.ModelViewSet):
    serializer_class = OfferSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "candidate":
            return Offer.objects.filter(candidate=user)
        return Offer.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "accept", "decline"]:
            return [IsAuthenticated()]
        return [IsHRAdmin()]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        offer = self.get_object()
        if offer.candidate != request.user and request.user.role != "admin":
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        offer.status = "Accepted"
        offer.save()
        if not hasattr(offer, "onboarding"):
            OnboardingRecord.objects.create(
                record_id=auto_id("ONB", OnboardingRecord),
                employee_name=offer.candidate_name,
                role=offer.role,
                joining_date=offer.joining_date,
                offer=offer,
                candidate=offer.candidate,
            )
        from notifications.tasks import create_notification_task
        create_notification_task.delay(
            recipient_id=offer.candidate.id,
            notification_type="offer_accepted",
            title="Offer Accepted",
            message=f"You have accepted the offer for {offer.role}. Onboarding has been initiated.",
        )
        return Response(OfferSerializer(offer).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        offer = self.get_object()
        if offer.candidate != request.user and request.user.role != "admin":
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        offer.status = "Rejected"
        offer.save()
        return Response(OfferSerializer(offer).data)


class OnboardingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "candidate":
            return OnboardingRecord.objects.filter(candidate=self.request.user)
        return OnboardingRecord.objects.all()

    def get_serializer_class(self):
        if self.action == "tasks":
            return OnboardingTaskSerializer
        return OnboardingSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsHRAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["patch"], permission_classes=[IsHRAdmin])
    def tasks(self, request, pk=None):
        record = self.get_object()
        serializer = OnboardingTaskSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        record.refresh_from_db()
        if record.completion_percentage == 100:
            record.status = "Completed"
            record.save()
        return Response(OnboardingSerializer(record).data)
