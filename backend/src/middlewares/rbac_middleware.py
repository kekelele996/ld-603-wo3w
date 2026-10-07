from src.constants.user_role import UserRole

# 审计员只读：仅可访问 GET / HEAD / OPTIONS
READ_ONLY_ROLES = {"AUDITOR"}
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def allow_roles(*roles):
    allowed = set(roles) | {"ADMIN"}

    def checker(request):
        user = getattr(request.state, "user", {})
        role = user.get("role", "ADMIN")
        return role in allowed

    return checker


def is_read_only_request(request):
    user = getattr(request.state, "user", {})
    return user.get("role") in READ_ONLY_ROLES and request.method not in SAFE_METHODS


def resolve_role(headers):
    role = headers.get("x-role", "ADMIN").upper()
    return role if role in UserRole else "ADMIN"
