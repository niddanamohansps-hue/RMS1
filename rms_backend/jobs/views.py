import urllib.parse
from django.db.models import Count, Q
from django.utils import timezone
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

def _get_cached_list_response(viewset_instance, request, cache_key_prefix, timeout=900):
    sorted_params = sorted(request.query_params.items())
    params_str = urllib.parse.urlencode(sorted_params)
    cache_key = f"{cache_key_prefix}_{params_str}"
    
    data = cache.get(cache_key)
    if data is None:
        response = super(viewset_instance.__class__, viewset_instance).list(request)
        data = response.data
        cache.set(cache_key, data, timeout=timeout)
        return response
    return Response(data)

from users.permissions import IsHRAdmin, IsHRAdminOrReadOnly
from applications.models import JobApplication, GeneralApplication
from interviews.models import Interview
from onboarding.models import Offer, OnboardingRecord

from .models import (
    JobCategory, ExistingRole, RoleRequest, JobRequest,
    ApprovalRequest, ApprovalHistory, JobPosting
)
from .serializers import (
    JobCategorySerializer, ExistingRoleSerializer,
    RoleRequestSerializer, RoleRequestStatusSerializer,
    JobRequestSerializer,
    ApprovalRequestSerializer, ApprovalHistorySerializer, ApprovalActionSerializer,
    JobPostingSerializer, JobPostingPublicSerializer
)

class JobCategoryViewSet(viewsets.ModelViewSet):
    """Exposes dynamic job categories CRUD."""
    queryset           = JobCategory.objects.all()
    serializer_class   = JobCategorySerializer
    permission_classes = [IsHRAdminOrReadOnly]
    search_fields      = ["name"]
    ordering_fields    = ["name"]


class ExistingRoleViewSet(viewsets.ModelViewSet):
    queryset           = ExistingRole.objects.all()
    serializer_class   = ExistingRoleSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["role", "department", "role_id"]
    filterset_fields   = ["department", "status", "type"]
    ordering_fields    = ["department", "role", "headcount", "filled"]

    def list(self, request, *args, **kwargs):
        return _get_cached_list_response(self, request, "existing_roles_list")

    @action(detail=False, methods=["get"])
    def departments(self, request):
        depts = ExistingRole.objects.values_list("department", flat=True).distinct()
        return Response(sorted(set(depts)))

    @action(detail=False, methods=["get"])
    def summary(self, request):
        data = (
            ExistingRole.objects
            .values("department")
            .annotate(
                total_headcount=Count("headcount"),
                total_filled=Count("filled"),
            )
        )
        return Response(list(data))


class RoleRequestViewSet(viewsets.ModelViewSet):
    queryset           = RoleRequest.objects.select_related("created_by").prefetch_related("approvals", "approvals__history").all()
    serializer_class   = RoleRequestSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["role", "department", "request_id"]
    filterset_fields   = ["status", "department"]
    ordering_fields    = ["date", "status"]

    def list(self, request, *args, **kwargs):
        return _get_cached_list_response(self, request, "role_requests_list")

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        instance = self.get_object()
        serializer = RoleRequestStatusSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class JobRequestViewSet(viewsets.ModelViewSet):
    queryset           = JobRequest.objects.select_related("category", "created_by").prefetch_related("approvals", "approvals__history").all()
    serializer_class   = JobRequestSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["role", "request_id"]
    filterset_fields   = ["status", "type"]
    ordering_fields    = ["created_at", "status"]

    def list(self, request, *args, **kwargs):
        return _get_cached_list_response(self, request, "job_requests_list")

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        instance = self.get_object()
        new_status = request.data.get("status")
        if new_status not in ["Pending", "Approved", "Rejected"]:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        instance.status = new_status
        instance.save()
        return Response(JobRequestSerializer(instance).data)


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset           = ApprovalRequest.objects.select_related(
                             "job_request", "job_request__category", "role_request", "role_request__created_by"
                         ).prefetch_related("history").all()
    serializer_class   = ApprovalRequestSerializer
    permission_classes = [IsHRAdmin]
    search_fields      = ["request_id", "title", "submitted_by"]
    filterset_fields   = ["status", "type"]
    ordering_fields    = ["date", "status"]

    def list(self, request, *args, **kwargs):
        return _get_cached_list_response(self, request, "approval_requests_list")

    @action(detail=True, methods=["post"])
    def action(self, request, pk=None):
        approval = self.get_object()
        if approval.status != "Pending":
            return Response(
                {"error": "This approval request has already been processed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_map = {
            "Approve":   "Approved",
            "Reject":    "Rejected",
            "Send Back": "Sent Back",
        }
        raw_action = serializer.validated_data["action"]
        new_status = action_map[raw_action]
        acted_by   = serializer.validated_data.get("acted_by") or request.user.get_full_name()
        note       = serializer.validated_data.get("note", "")

        # Update RoleRequest if type is Role Request
        if approval.type == "Role Request" and approval.role_request:
            role_req = approval.role_request
            if "role" in serializer.validated_data:
                role_req.role = serializer.validated_data["role"]
                approval.title = serializer.validated_data["role"]
            if "department" in serializer.validated_data:
                role_req.department = serializer.validated_data["department"]
                approval.department = serializer.validated_data["department"]
            if "salary_range" in serializer.validated_data:
                role_req.salary_range = serializer.validated_data["salary_range"]
            if "experience" in serializer.validated_data:
                role_req.experience = serializer.validated_data["experience"]
            if "employment_type" in serializer.validated_data:
                role_req.type = serializer.validated_data["employment_type"]
            role_req.save()

        # Update JobRequest if type is Job Request
        if approval.type == "Job Request" and approval.job_request:
            job_req = approval.job_request
            if "role" in serializer.validated_data:
                job_req.role = serializer.validated_data["role"]
                approval.title = serializer.validated_data["role"]
            if "department" in serializer.validated_data:
                job_req.department = serializer.validated_data["department"]
                approval.department = serializer.validated_data["department"]
            if "salary_range" in serializer.validated_data:
                job_req.salary_range = serializer.validated_data["salary_range"]
            if "experience" in serializer.validated_data:
                job_req.experience = serializer.validated_data["experience"]
            if "location" in serializer.validated_data:
                job_req.location = serializer.validated_data["location"]
            if "category" in serializer.validated_data:
                from .models import JobCategory
                cat_name = serializer.validated_data["category"]
                cat_obj = JobCategory.objects.filter(name=cat_name).first()
                if cat_obj:
                    job_req.category = cat_obj
            if "vacancies" in serializer.validated_data:
                job_req.vacancies = serializer.validated_data["vacancies"]
            if "employment_type" in serializer.validated_data:
                job_req.type = serializer.validated_data["employment_type"]
            if "description" in serializer.validated_data:
                job_req.description = serializer.validated_data["description"]
            if "educational_qualifications" in serializer.validated_data:
                job_req.educational_qualifications = serializer.validated_data["educational_qualifications"]
            if "skills_required" in serializer.validated_data:
                job_req.skills_required = serializer.validated_data["skills_required"]
            job_req.save()

        approval.status = new_status
        approval.save()

        ApprovalHistory.objects.create(
            approval=approval,
            action=raw_action,
            acted_by=acted_by,
            note=note,
        )

        if new_status == "Approved" and approval.type == "Job Request" and approval.job_request:
            job_req = approval.job_request
            job_req.status = "Approved"
            job_req.save()

            # Auto-create a JobPosting from the approved JobRequest
            from jobs.models import JobPosting
            from users.utils import auto_id

            # Only create if no posting already exists for this job request
            if not JobPosting.objects.filter(job_request=job_req).exists():
                JobPosting.objects.create(
                    posting_id=auto_id("JP", JobPosting),
                    role=job_req.role,
                    department=job_req.department,
                    type=job_req.type or "Full-time",
                    category=job_req.category,
                    location=job_req.location or "Guwahati, Assam",
                    description=job_req.description,
                    experience=job_req.experience,
                    salary_range=job_req.salary_range,
                    educational_qualifications=job_req.educational_qualifications,
                    skills_required=job_req.skills_required,
                    channel="Career Page",
                    status="Unpublished",
                    job_request=job_req,
                )
        if new_status == "Approved" and approval.type == "Role Request" and approval.role_request:
            role_req = approval.role_request
            role_req.status = "Approved"
            role_req.save()
        if new_status == "Sent Back" and approval.type == "Role Request" and approval.role_request:
            approval.role_request.status = "Sent Back"
            approval.role_request.save()
        if new_status == "Sent Back" and approval.type == "Job Request" and approval.job_request:
            approval.job_request.status = "Sent Back"
            approval.job_request.save()
        if new_status == "Rejected" and approval.type == "Job Request" and approval.job_request:
            approval.job_request.status = "Rejected"
            approval.job_request.save()
        if new_status == "Rejected" and approval.type == "Role Request" and approval.role_request:
            approval.role_request.status = "Rejected"
            approval.role_request.save()

        return Response(ApprovalRequestSerializer(approval).data)


class JobPostingViewSet(viewsets.ModelViewSet):
    filterset_fields = ["status", "channel", "category", "department"]
    search_fields    = ["role", "department", "posting_id"]
    ordering_fields  = ["posted_date", "expiry_date", "created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = JobPosting.objects.select_related("category", "job_request")
        if not user.is_authenticated or user.role == "candidate":
            return queryset.filter(status="Published").order_by("-created_at")
        return queryset.annotate(annotated_application_count=Count("job_applications")).order_by("-created_at")

    def get_serializer_class(self):
        user = self.request.user
        if not user.is_authenticated or user.role == "candidate":
            return JobPostingPublicSerializer
        return JobPostingSerializer

    def get_permissions(self):
        if self.action in ["public"]:
            return [AllowAny()]
        return [IsHRAdmin()]

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def public(self, request):
        category = request.query_params.get("category", "")
        q = request.query_params.get("q", "")
        cache_key = f"public_jobs_{category}_{q}"
        data = cache.get(cache_key)
        if not data:
            qs = JobPosting.objects.select_related("category", "job_request").filter(status="Published")
            if category and category != "All Positions":
                qs = qs.filter(category__name=category)
            if q:
                qs = qs.filter(Q(role__icontains=q) | Q(department__icontains=q))
            serializer = JobPostingPublicSerializer(qs, many=True)
            data = serializer.data
            cache.set(cache_key, data, timeout=900) # Cache for 15 mins
        return Response(data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        posting = self.get_object()
        posting.status = "Published"
        if not posting.posted_date:
            posting.posted_date = timezone.now().date()
        posting.save()
        return Response(JobPostingSerializer(posting).data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        posting = self.get_object()
        posting.status = "Unpublished"
        posting.save()
        return Response(JobPostingSerializer(posting).data)


class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/ — aggregate KPIs for the HR admin dashboard."""
    permission_classes = [IsHRAdmin]

    def get(self, request):
        cache_key = "dashboard_stats"
        data = cache.get(cache_key)
        if not data:
            today = timezone.now().date()
            data = {
                "open_positions":        JobPosting.objects.filter(status="Published").count(),
                "pending_approvals":     ApprovalRequest.objects.filter(status="Pending").count(),
                "total_applicants":      JobApplication.objects.count() + GeneralApplication.objects.count(),
                "interviews_scheduled":  Interview.objects.filter(status="Scheduled", date__gte=today).count(),
                "offers_released":       Offer.objects.filter(status__in=["Sent", "Accepted"]).count(),
                "new_joiners":           OnboardingRecord.objects.filter(
                                             status="Completed",
                                             joining_date__month=today.month,
                                             joining_date__year=today.year,
                                         ).count(),
                "offer_acceptance_rate": _compute_offer_rate(),
                "total_roles":           ExistingRole.objects.count(),
                "active_roles":          ExistingRole.objects.filter(status="Active").count(),
                "pipeline": {
                    "applied":     JobApplication.objects.filter(status="Applied").count(),
                    "shortlisted": JobApplication.objects.filter(status="Shortlisted").count(),
                    "selected":    JobApplication.objects.filter(status="Selected").count(),
                    "offered":     Offer.objects.count(),
                },
            }
            cache.set(cache_key, data, timeout=300) # Cache for 5 mins
        return Response(data)


def _compute_offer_rate():
    total    = Offer.objects.filter(status__in=["Accepted", "Rejected"]).count()
    accepted = Offer.objects.filter(status="Accepted").count()
    if total == 0:
        return "N/A"
    return f"{round(accepted / total * 100, 1)}%"
