from django.contrib import admin
from .models import Offer, OnboardingRecord

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display  = ["offer_id", "candidate_name", "role", "ctc", "issued_date", "expiry_date", "status"]
    list_filter   = ["status"]
    search_fields = ["offer_id", "candidate_name", "role"]
    raw_id_fields = ["candidate"]


@admin.register(OnboardingRecord)
class OnboardingRecordAdmin(admin.ModelAdmin):
    list_display  = [
        "record_id", "employee_name", "role", "joining_date",
        "employee_id", "status", "completion_percentage"
    ]
    list_filter   = ["status"]
    search_fields = ["record_id", "employee_name"]
    readonly_fields = ["completion_percentage"]
