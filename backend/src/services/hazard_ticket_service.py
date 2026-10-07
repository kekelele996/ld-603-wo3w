from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.constants.log_templates import LOG_TEMPLATES
from src.constants.receipt_reconcile_status import ReceiptReconcileStatus
from src.constants.receipt_submit_status import ReceiptSubmitStatus
from src.constants.rectify_status import RectifyStatus
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.maintenance_receipt_repository import MaintenanceReceiptRepository
from src.utils.service_error import ServiceError
from src.utils.time_utils import now_iso


class HazardTicketService:
    def __init__(self):
        self.repo = HazardTicketRepository()
        self.receipt_repo = MaintenanceReceiptRepository()

    def list(self):
        return self.repo.find_all()

    def _has_confirmed_receipt(self, ticket_id):
        for receipt in self.receipt_repo.find_by_ticket(ticket_id):
            if (
                receipt["submit_status"] == ReceiptSubmitStatus[0]
                and receipt["reconcile_status"] == ReceiptReconcileStatus[3]
            ):
                return True
        return False

    def close(self, ticket_id):
        ticket = self.repo.find_by_id(ticket_id)
        if ticket is None:
            raise ServiceError(
                ERROR_CODES["HAZARD_TICKET_NOT_FOUND"],
                ERROR_MESSAGES["HAZARD_TICKET_NOT_FOUND"],
                status_code=404,
            )
        # 配不上挂对账队列、回执报送未成功的整改单，物业主管确认前一律不关单
        if ticket["rectify_status"] != RectifyStatus[3] and not self._has_confirmed_receipt(ticket_id):
            print(LOG_TEMPLATES["HazardTicket"][4], ticket_id)
            raise ServiceError(
                ERROR_CODES["HAZARD_TICKET_NOT_CLOSABLE"],
                ERROR_MESSAGES["HAZARD_TICKET_NOT_CLOSABLE"],
                status_code=409,
            )
        if not ticket["closed_at"]:
            self.repo.update(ticket, rectify_status=RectifyStatus[3], closed_at=now_iso())
        print(LOG_TEMPLATES["HazardTicket"][5], ticket_id, ticket.get("last_receipt_id"))
        return ticket
