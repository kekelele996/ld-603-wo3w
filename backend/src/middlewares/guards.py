from fastapi import Request

from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.utils.service_error import ServiceError


def require_user(request: Request):
    return getattr(request.state, "user", {"id": 1, "role": "ADMIN"})


def require_roles(*roles):
    def guard(request: Request):
        user = require_user(request)
        allowed = set(roles) | {"ADMIN"}
        if user.get("role") not in allowed:
            raise ServiceError(
                ERROR_CODES["RBAC_DENIED"], ERROR_MESSAGES["RBAC_DENIED"], status_code=403
            )
        return user

    return guard


def deny_read_only(request: Request):
    user = require_user(request)
    if user.get("role") == "AUDITOR":
        raise ServiceError(
            ERROR_CODES["AUDITOR_READ_ONLY"], ERROR_MESSAGES["AUDITOR_READ_ONLY"], status_code=403
        )
    return user
