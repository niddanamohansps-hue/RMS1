from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"job-categories", views.JobCategoryViewSet,      basename="job-categories")
router.register(r"roles",          views.ExistingRoleViewSet,     basename="roles")
router.register(r"role-requests",  views.RoleRequestViewSet,     basename="role-requests")
router.register(r"job-requests",   views.JobRequestViewSet,      basename="job-requests")
router.register(r"approvals",      views.ApprovalRequestViewSet,  basename="approvals")
router.register(r"job-postings",   views.JobPostingViewSet,       basename="job-postings")

urlpatterns = [
    path("dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard-stats"),
    path("", include(router.urls)),
]
