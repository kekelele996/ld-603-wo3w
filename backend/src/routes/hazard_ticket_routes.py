from fastapi import APIRouter
from src.controllers.hazard_ticket_controller import list_hazard_ticket, close_hazard_ticket
router = APIRouter(prefix="/api/hazard-ticket", tags=["HazardTicket"])
router.get("")(list_hazard_ticket)
# 关单前置：回执对账未确认前 409，确认前不关单
router.post("/{ticket_id}/close")(close_hazard_ticket)
