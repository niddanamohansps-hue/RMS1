from django.contrib import admin
from .models import JobApplication, GeneralApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display  = ["app_id", "candidate", "role", "posting", "applied_date", "status"]
    list_filter   = ["status"]
    search_fields = ["app_id", "candidate__email", "role"]
    raw_id_fields = ["candidate", "posting"]
    ordering      = ["-applied_date"]


@admin.register(GeneralApplication)
class GeneralApplicationAdmin(admin.ModelAdmin):
    list_display  = ["app_id", "candidate", "preferred_role", "preferred_dept", "status", "applied_date"]
    list_filter   = ["status"]
    search_fields = ["app_id", "candidate__email", "preferred_role"]
    raw_id_fields = ["candidate"]
