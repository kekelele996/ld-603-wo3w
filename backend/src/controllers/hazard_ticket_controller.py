from fastapi import Depends

from src.middlewares.guards import deny_read_only, require_roles
from src.services.hazard_ticket_service import HazardTicketService

service = HazardTicketService()


def list_hazard_ticket():
    return service.list()


def close_hazard_ticket(
    ticket_id: int,
    user=Depends(require_roles("SUPERVISOR")),
    _guard=Depends(deny_read_only),
):
    return service.close(ticket_id)
