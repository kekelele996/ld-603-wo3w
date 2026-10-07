from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.constants.log_templates import LOG_TEMPLATES
from src.constants.receipt_reconcile_status import ReceiptReconcileStatus
from src.constants.receipt_submit_status import ReceiptSubmitStatus
from src.constants.rectify_status import RectifyStatus
from src.constructors.maintenance_receipt_factory import create_maintenance_receipt_dto
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.maintenance_receipt_repository import MaintenanceReceiptRepository
from src.services.fire_device_service import FireDeviceService
from src.utils.service_error import ServiceError
from src.utils.time_utils import now_iso


def _field(payload, name, default=None):
    if isinstance(payload, dict):
        return payload.get(name, default)
    return getattr(payload, name, default)


def _component_dicts(components):
    rows = []
    for component in components or []:
        item_code = _field(component, "item_code", "")
        rows.append(
            {
                "item_code": str(item_code).strip(),
                "part_name": str(_field(component, "part_name", "")).strip(),
                "quantity": int(_field(component, "quantity", 1)),
                "photo_url": str(_field(component, "photo_url", "") or "").strip(),
                "matched": False,
                "mismatch_reason": "",
            }
        )
    return rows


def match_receipt(ticket, receipt):
    """比对回执上报部件与整改单登记的隐患条目，返回 (部件明细, 差异, 合格部件数)。"""
    registered = {item["item_code"]: item for item in ticket.get("registered_items", [])}
    mismatch_details = []
    qualified = 0

    for component in receipt["components"]:
        reasons = []
        item_code = component["item_code"]
        expected = registered.get(item_code)
        if expected is None:
            reasons.append("ITEM_NOT_REGISTERED")
            mismatch_details.append(
                {"item_code": item_code, "reason": "ITEM_NOT_REGISTERED",
                 "expected": "", "actual": component["part_name"]}
            )
        else:
            if component["part_name"] != expected["part_name"]:
                reasons.append("PART_NAME_MISMATCH")
                mismatch_details.append(
                    {"item_code": item_code, "reason": "PART_NAME_MISMATCH",
                     "expected": expected["part_name"], "actual": component["part_name"]}
                )
            if component["quantity"] != int(expected["expected_quantity"]):
                reasons.append("QUANTITY_MISMATCH")
                mismatch_details.append(
                    {"item_code": item_code, "reason": "QUANTITY_MISMATCH",
                     "expected": expected["expected_quantity"], "actual": component["quantity"]}
                )
            if expected.get("photo_required", True) and not component["photo_url"]:
                reasons.append("PHOTO_MISSING")
                mismatch_details.append(
                    {"item_code": item_code, "reason": "PHOTO_MISSING",
                     "expected": "/receipt photo", "actual": ""}
                )

        matched = not reasons
        component["matched"] = matched
        component["mismatch_reason"] = ";".join(reasons)
        if matched:
            qualified += component["quantity"]

    reported_codes = {component["item_code"] for component in receipt["components"]}
    for item_code, expected in registered.items():
        if item_code not in reported_codes:
            mismatch_details.append(
                {"item_code": item_code, "reason": "ITEM_NOT_REPORTED",
                 "expected": expected["part_name"], "actual": ""}
            )

    return receipt["components"], mismatch_details, qualified


class MaintenanceReceiptService:
    def __init__(self):
        self.repo = MaintenanceReceiptRepository()
        self.ticket_repo = HazardTicketRepository()
        self.result_repo = InspectionResultRepository()
        self.device_repo = FireDeviceRepository()
        self.device_service = FireDeviceService()

    def list(self, ticket_id=None, reconcile_status=None, submit_status=None):
        rows = self.repo.find_all()
        if ticket_id is not None:
            rows = [row for row in rows if row["hazard_ticket_id"] == ticket_id]
        if reconcile_status is not None:
            rows = [row for row in rows if row["reconcile_status"] == reconcile_status]
        if submit_status is not None:
            rows = [row for row in rows if row["submit_status"] == submit_status]
        return rows

    def list_queue(self):
        # 对账队列：报送成功但部件/照片与隐患条目配不上，等物业主管复核
        return self.list(reconcile_status=ReceiptReconcileStatus[2])

    def _get_ticket(self, ticket_id):
        ticket = self.ticket_repo.find_by_id(ticket_id)
        if ticket is None:
            raise ServiceError(
                ERROR_CODES["HAZARD_TICKET_NOT_FOUND"],
                ERROR_MESSAGES["HAZARD_TICKET_NOT_FOUND"],
                status_code=404,
            )
        return ticket

    def _build_and_match(self, ticket, components, submitted_at):
        receipt = create_maintenance_receipt_dto(
            id=self.repo.next_id(),
            hazard_ticket_id=ticket["id"],
            submitted_at=submitted_at,
            components=components,
        )
        component_rows, mismatch_details, qualified = match_receipt(ticket, receipt)
        receipt["components"] = component_rows
        receipt["mismatch_details"] = mismatch_details
        receipt["qualified_component_count"] = qualified
        if mismatch_details:
            receipt["reconcile_status"] = ReceiptReconcileStatus[2]  # MISMATCH_PENDING_REVIEW
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[2], last_receipt_id=receipt["id"])
            print(LOG_TEMPLATES["MaintenanceReceipt"][4], receipt["id"], ticket["id"])
        else:
            receipt["reconcile_status"] = ReceiptReconcileStatus[1]  # MATCHED，待主管确认
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[1], last_receipt_id=receipt["id"])
            print(LOG_TEMPLATES["MaintenanceReceipt"][3], receipt["id"], ticket["id"])
        return receipt

    def report(self, payload):
        """维保商按整改单号报送整单回执；报送失败只落失败记录，按未关闭、未对账处理。"""
        ticket = self._get_ticket(_field(payload, "hazard_ticket_id"))
        submitted_at = now_iso()
        receipt = create_maintenance_receipt_dto(
            id=self.repo.next_id(),
            hazard_ticket_id=ticket["id"],
            vendor_id=_field(payload, "vendor_id"),
            vendor_name=_field(payload, "vendor_name", ""),
            paper_receipt_no=_field(payload, "paper_receipt_no", ""),
            submitted_at=submitted_at,
            components=_component_dicts(_field(payload, "components")),
        )

        if _field(payload, "delivery_status", "OK") != "OK":
            receipt["submit_status"] = ReceiptSubmitStatus[1]  # SUBMIT_FAILED
            receipt["delivery_error"] = "回执整单报送失败，成功前按未关闭处理"
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[0], last_receipt_id=receipt["id"])
            self.repo.insert(receipt)
            print(LOG_TEMPLATES["MaintenanceReceipt"][1], receipt["id"], ticket["id"])
            return receipt

        # 整单送达成功后再做匹配
        receipt = self._build_and_match(ticket, receipt["components"], submitted_at)
        receipt["submit_status"] = ReceiptSubmitStatus[0]
        receipt["vendor_id"] = _field(payload, "vendor_id")
        receipt["vendor_name"] = _field(payload, "vendor_name", "")
        receipt["paper_receipt_no"] = _field(payload, "paper_receipt_no", "")
        self.repo.insert(receipt)
        print(LOG_TEMPLATES["MaintenanceReceipt"][0], receipt["id"], ticket["id"])
        return receipt

    def retry(self, receipt_id, payload):
        """报送失败后按整单重试；重试仍失败继续按未关闭处理。"""
        receipt = self.repo.find_by_id(receipt_id)
        if receipt is None:
            raise ServiceError(
                ERROR_CODES["RECEIPT_NOT_FOUND"], ERROR_MESSAGES["RECEIPT_NOT_FOUND"], status_code=404
            )
        if receipt["submit_status"] != ReceiptSubmitStatus[1]:
            raise ServiceError(
                ERROR_CODES["RECEIPT_RETRY_TARGET_FAILED"],
                ERROR_MESSAGES["RECEIPT_RETRY_TARGET_FAILED"],
            )
        ticket = self._get_ticket(receipt["hazard_ticket_id"])
        receipt["retried_at"] = now_iso()

        if _field(payload, "delivery_status", "OK") != "OK":
            receipt["delivery_error"] = "整单重试仍失败，继续按未关闭处理"
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[0])
            print(LOG_TEMPLATES["MaintenanceReceipt"][2], receipt["id"], "failed")
            return receipt

        components = _component_dicts(_field(payload, "components")) or receipt["components"]
        receipt["components"] = components
        component_rows, mismatch_details, qualified = match_receipt(ticket, receipt)
        receipt["components"] = component_rows
        receipt["mismatch_details"] = mismatch_details
        receipt["qualified_component_count"] = qualified
        receipt["submit_status"] = ReceiptSubmitStatus[0]
        receipt["delivery_error"] = ""
        if mismatch_details:
            receipt["reconcile_status"] = ReceiptReconcileStatus[2]
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[2])
        else:
            receipt["reconcile_status"] = ReceiptReconcileStatus[1]
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[1])
        print(LOG_TEMPLATES["MaintenanceReceipt"][2], receipt["id"], ticket["id"])
        return receipt

    def _resolve_device_id(self, ticket):
        result = self.result_repo.find_by_id(ticket["result_id"])
        return result["device_id"] if result else None

    def review(self, receipt_id, action, reviewer, note=""):
        """物业主管复核：确认前不关单；确认后把合格部件数写回设备档案并关单。"""
        receipt = self.repo.find_by_id(receipt_id)
        if receipt is None:
            raise ServiceError(
                ERROR_CODES["RECEIPT_NOT_FOUND"], ERROR_MESSAGES["RECEIPT_NOT_FOUND"], status_code=404
            )
        ticket = self._get_ticket(receipt["hazard_ticket_id"])
        reviewable = {ReceiptReconcileStatus[1], ReceiptReconcileStatus[2]}
        if receipt["submit_status"] != ReceiptSubmitStatus[0] or receipt["reconcile_status"] not in reviewable:
            raise ServiceError(
                ERROR_CODES["RECEIPT_NOT_REVIEWABLE"], ERROR_MESSAGES["RECEIPT_NOT_REVIEWABLE"]
            )

        reviewer_id = reviewer.get("id")
        if action == "reject":
            receipt["reconcile_status"] = ReceiptReconcileStatus[4]  # REJECTED
            receipt["reviewed_by"] = reviewer_id
            receipt["reviewed_note"] = note
            self.ticket_repo.update(ticket, rectify_status=RectifyStatus[0])
            print(LOG_TEMPLATES["MaintenanceReceipt"][6], receipt["id"], ticket["id"])
            return receipt

        if action != "confirm":
            raise ServiceError(ERROR_CODES["VALIDATION_FAILED"], ERROR_MESSAGES["VALIDATION_FAILED"])

        receipt["reconcile_status"] = ReceiptReconcileStatus[3]  # CONFIRMED
        receipt["reviewed_by"] = reviewer_id
        receipt["reviewed_note"] = note

        device_id = self._resolve_device_id(ticket)
        if device_id is not None:
            self.device_service.writeback_qualified_components(
                device_id, receipt["qualified_component_count"], receipt["id"]
            )

        closed_at = now_iso()
        receipt["confirmed_at"] = closed_at
        self.ticket_repo.update(
            ticket,
            rectify_status=RectifyStatus[3],  # CLOSED
            closed_at=closed_at,
            last_receipt_id=receipt["id"],
        )
        print(LOG_TEMPLATES["MaintenanceReceipt"][5], receipt["id"], ticket["id"])
        print(LOG_TEMPLATES["HazardTicket"][5], ticket["id"], receipt["id"])
        return receipt
