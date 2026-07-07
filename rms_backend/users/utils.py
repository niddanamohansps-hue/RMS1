from datetime import date

def auto_id(prefix: str, model, id_field: str = "id") -> str:
    """Generate a sequential ID like JR-2026-0001, ensuring uniqueness."""
    year = date.today().year
    
    # Determine the unique ID field name for this model dynamically
    field_name = None
    common_fields = ["role_id", "posting_id", "request_id", "app_id", "interview_id", "offer_id", "record_id"]
    for f in common_fields:
        if f in [field.name for field in model._meta.get_fields()]:
            field_name = f
            break
    if not field_name:
        field_name = id_field
        
    count = model.objects.count() + 1
    while True:
        candidate_id = f"{prefix}-{year}-{count:04d}"
        kwargs = {field_name: candidate_id}
        if not model.objects.filter(**kwargs).exists():
            return candidate_id
        count += 1


from django.core.cache import cache
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings

class CachedJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token[api_settings.USER_ID_CLAIM]
        cache_key = f"user_profile_{user_id}"
        user = cache.get(cache_key)
        if user is None:
            user = super().get_user(validated_token)
            if user:
                cache.set(cache_key, user, timeout=300)  # Cache for 5 minutes
        return user

