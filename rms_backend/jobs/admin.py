from django.contrib import admin
from .models import (
    JobCategory, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting
)

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display  = ["name", "description", "created_at"]
    search_fields = ["name"]


@admin.register(ExistingRole)
class ExistingRoleAdmin(admin.ModelAdmin):
    list_display  = ["role_id", "role", "department", "type", "headcount", "filled", "status"]
    list_filter   = ["department", "status", "type"]
    search_fields = ["role", "department", "role_id"]
    ordering      = ["department", "role"]


@admin.register(RoleRequest)
class RoleRequestAdmin(admin.ModelAdmin):
    list_display  = ["request_id", "role", "department", "status", "date"]
    list_filter   = ["status", "department"]
    search_fields = ["request_id", "role"]


@admin.register(JobRequest)
class JobRequestAdmin(admin.ModelAdmin):
    list_display  = ["request_id", "role", "vacancies", "type", "status", "created_at"]
    list_filter   = ["status", "type"]
    search_fields = ["request_id", "role"]


class ApprovalHistoryInline(admin.TabularInline):
    model  = ApprovalHistory
    extra  = 0
    readonly_fields = ["date"]


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display  = ["request_id", "type", "title", "submitted_by", "status", "date"]
    list_filter   = ["status", "type"]
    search_fields = ["request_id", "title", "submitted_by"]
    inlines       = [ApprovalHistoryInline]


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display  = ["posting_id", "role", "department", "channel", "status", "posted_date", "expiry_date"]
    list_filter   = ["status", "channel", "category"]
    search_fields = ["posting_id", "role", "department"]
    ordering      = ["-created_at"]
