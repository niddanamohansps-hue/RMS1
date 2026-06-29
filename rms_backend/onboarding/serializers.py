from rest_framework import serializers
from users.utils import auto_id
from .models import Offer, OnboardingRecord

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Offer
        fields = "__all__"
        read_only_fields = ["offer_id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["offer_id"] = auto_id("OFR", Offer)
        return super().create(validated_data)


class OfferStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Offer
        fields = ["status"]


class OnboardingSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model  = OnboardingRecord
        fields = "__all__"
        read_only_fields = ["record_id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["record_id"] = auto_id("ONB", OnboardingRecord)
        return super().create(validated_data)


class OnboardingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OnboardingRecord
        fields = [
            "task_profile", "task_offer", "task_docs_upload",
            "task_docs_verify", "task_bgc", "task_checkin", "status",
        ]
