from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsHRAdmin(BasePermission):
    """Only authenticated users with role='admin' can access."""
    message = "Only HR Admins can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsHRAdminOrReadOnly(BasePermission):
    """Read-only for everyone; write only for HR Admins."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsOwnerOrHRAdmin(BasePermission):
    """Object-level: owner (candidate) can see/edit their own; admin sees all."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        candidate = getattr(obj, "candidate", None)
        return candidate == request.user


class IsCandidate(BasePermission):
    """Only candidates can perform this action (e.g., submit application)."""
    message = "Only candidates can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "candidate"
        )
