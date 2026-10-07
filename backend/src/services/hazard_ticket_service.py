from src.constants.error_codes import ERROR_CODES
from src.constants.log_templates import LOG_TEMPLATES
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.maintenance_receipt_repository import MaintenanceReceiptRepository
from src.services.errors import ServiceError
from src.utils.audit import record_audit

CONFIRMED_STATUS = "CONFIRMED"


class HazardTicketService:
    def __init__(self):
        self.repo = HazardTicketRepository()
        self.receipt_repo = MaintenanceReceiptRepository()

    def list(self):
        return self.repo.find_all()

    def close(self, ticket_id, user) -> dict:
        """整改单关单前置：必须存在已对账确认的回执，否则确认前不关单。"""
        ticket = self.repo.find_by_id(ticket_id)
        if ticket is None:
            raise ServiceError(ERROR_CODES["TICKET_NOT_FOUND"], status_code=404)
        receipt = self.receipt_repo.find_latest_by_ticket(ticket_id)
        if receipt is None or receipt.get("status") != CONFIRMED_STATUS:
            raise ServiceError(ERROR_CODES["TICKET_ALREADY_CLOSED"], status_code=409)
        self.repo.update_status(ticket, "RECONCILED", closed_at=self._now())
        record_audit(f"{user.get('role', 'unknown')}:{user.get('id', 0)}",
                     LOG_TEMPLATES["HazardTicket"][4], "HazardTicket", ticket_id)
        return ticket

    @staticmethod
    def _now() -> str:
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
