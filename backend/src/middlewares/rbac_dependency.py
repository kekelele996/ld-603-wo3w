from fastapi import Request

from src.constants.error_codes import ERROR_CODES
from src.services.errors import ServiceError

# 角色取值与 x-role 请求头保持一致：inspector / vendor / property_manager / auditor
ROLE_INSPECTOR = "inspector"
ROLE_VENDOR = "vendor"
ROLE_PROPERTY_MANAGER = "property_manager"
ROLE_AUDITOR = "auditor"

READ_ONLY_ROLES = {ROLE_AUDITOR}


def current_user(request: Request) -> dict:
    return getattr(request.state, "user", {"id": 0, "role": "anonymous"})


def require_roles(request: Request, *allowed: str) -> dict:
    user = current_user(request)
    if user.get("role") not in allowed:
        raise ServiceError(ERROR_CODES["RBAC_DENIED"], status_code=403)
    return user


def ensure_not_readonly(request: Request) -> dict:
    """审计员只读：所有写操作统一在这里拦一道。"""
    user = current_user(request)
    if user.get("role") in READ_ONLY_ROLES:
        raise ServiceError(ERROR_CODES["RBAC_DENIED"], status_code=403)
    return user
