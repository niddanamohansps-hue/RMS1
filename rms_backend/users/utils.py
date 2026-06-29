from datetime import date

def auto_id(prefix: str, model, id_field: str = "id") -> str:
    """Generate a sequential ID like JR-2026-0001."""
    year = date.today().year
    count = model.objects.count() + 1
    return f"{prefix}-{year}-{count:04d}"
