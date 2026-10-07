from fastapi import Request
from fastapi.responses import JSONResponse

from src.middlewares.rbac_dependency import require_roles, ensure_not_readonly, ROLE_PROPERTY_MANAGER
from src.services.errors import ServiceError
from src.services.hazard_ticket_service import HazardTicketService

service = HazardTicketService()


def list_hazard_ticket():
    return service.list()


def close_hazard_ticket(request: Request, ticket_id: int):
    try:
        ensure_not_readonly(request)
        user = require_roles(request, ROLE_PROPERTY_MANAGER)
        return service.close(ticket_id, user)
    except ServiceError as exc:
        # controller 层包装：确认前不关单等业务规则在此转 HTTP 错误
        return JSONResponse(status_code=exc.status_code, content={"code": exc.code, "message": exc.message})
