from django.contrib import admin
from .models import Panelist, Interview

@admin.register(Panelist)
class PanelistAdmin(admin.ModelAdmin):
    list_display  = ["name", "email", "phone", "department", "is_active"]
    list_filter   = ["is_active", "department"]
    search_fields = ["name", "email"]


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display  = ["interview_id", "candidate_name", "role", "date", "time", "mode", "status", "score"]
    list_filter   = ["status", "mode", "round"]
    search_fields = ["interview_id", "candidate_name", "role"]
    filter_horizontal = ["panel"]
    ordering      = ["-date"]
