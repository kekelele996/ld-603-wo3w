from __future__ import annotations

from src.constants.error_codes import ERROR_CODES
from src.constants.log_templates import LOG_TEMPLATES
from src.constructors.maintenance_receipt_factory import create_receipt_dto, create_reconcile_line_dto
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.maintenance_receipt_repository import MaintenanceReceiptRepository
from src.services.errors import ServiceError
from src.utils.audit import record_audit

# 对账队列状态：部件/照片与隐患条目配不上，等物业主管复核
QUEUE_STATUS = "PENDING_REVIEW"
MATCHED_STATUS = "MATCHED"
CONFIRMED_STATUS = "CONFIRMED"
REJECTED_STATUS = "REJECTED"
SUBMIT_FAILED_STATUS = "SUBMIT_FAILED"

REVIEWABLE_STATUS = {MATCHED_STATUS, QUEUE_STATUS}


class MaintenanceReceiptService:
    def __init__(self):
        self.repo = MaintenanceReceiptRepository()
        self.ticket_repo = HazardTicketRepository()
        self.device_repo = FireDeviceRepository()

    def list(self, status: str | None = None):
        rows = self.repo.find_all()
        if status:
            rows = [row for row in rows if row["status"] == status]
        return rows

    def list_queue(self):
        return self.list(QUEUE_STATUS)

    # ---- 对账核心：回执部件/照片 vs 整改单隐患条目 ----
    def _reconcile(self, ticket, receipt_parts) -> tuple[list[dict], bool, int]:
        details = []
        all_matched = True
        qualified_part_count = 0
        parts_by_code = {part["item_code"]: part for part in receipt_parts}

        for item in ticket.get("hazard_items", []):
            code = item["item_code"]
            required_qty = int(item.get("required_quantity", 0))
            photo_required = bool(item.get("photo_required", True))
            part = parts_by_code.get(code)

            if part is None:
                matched = False
                reason = "回执缺少该隐患条目的更换部件"
                receipt_qty = 0
                receipt_name = ""
                photo_ok = False
            else:
                receipt_qty = int(part.get("quantity", 0))
                receipt_name = part.get("part_name", "")
                photo_count = len(part.get("photo_urls", []))
                photo_ok = (not photo_required) or photo_count > 0

                reasons = []
                if receipt_name != item.get("part_name", ""):
                    reasons.append("更换部件名称与登记不一致")
                if receipt_qty < required_qty:
                    reasons.append(f"更换数量不足（需{required_qty}）")
                if not photo_ok:
                    reasons.append("缺少更换后照片")
                matched = not reasons
                reason = "；".join(reasons)

            if matched:
                qualified_part_count += required_qty
            else:
                all_matched = False

            details.append(create_reconcile_line_dto(
                item_code=code,
                expected_part_name=item.get("part_name", ""),
                receipt_part_name=receipt_name,
                required_quantity=required_qty,
                receipt_quantity=receipt_qty,
                photo_ok=photo_ok,
                matched=matched,
                reason=reason
            ))

        # 回执多报了整改单未登记的部件，同样算配不上
        known_codes = {item["item_code"] for item in ticket.get("hazard_items", [])}
        for code, part in parts_by_code.items():
            if code in known_codes:
                continue
            all_matched = False
            details.append(create_reconcile_line_dto(
                item_code=code,
                expected_part_name="",
                receipt_part_name=part.get("part_name", ""),
                required_quantity=0,
                receipt_quantity=int(part.get("quantity", 0)),
                photo_ok=len(part.get("photo_urls", [])) > 0,
                matched=False,
                reason="整改单未登记该隐患条目"
            ))

        return details, all_matched, qualified_part_count

    # ---- 维保商按整改单号报回执 ----
    def submit(self, payload, user) -> dict:
        ticket = self.ticket_repo.find_by_id(payload.ticket_id)
        if ticket is None:
            raise ServiceError(ERROR_CODES["TICKET_NOT_FOUND"], status_code=404)
        if ticket.get("closed_at"):
            # 确认前不关单：已关单整改单不允许再报送
            raise ServiceError(ERROR_CODES["TICKET_ALREADY_CLOSED"], status_code=409)
        if not payload.parts:
            raise ServiceError(ERROR_CODES["VALIDATION_FAILED"], "回执至少包含一条更换部件", 422)

        parts = [part.model_dump() for part in payload.parts]

        # 模拟纸质单子录入渠道可能报送失败：失败按整单挂起，按没关闭算，等待整单重试
        force_fail = bool(getattr(payload, "simulate_failure", False))
        if force_fail:
            receipt = create_receipt_dto(
                payload.ticket_id,
                user.get("id", 0),
                payload.vendor_name,
                parts,
                status=SUBMIT_FAILED_STATUS,
                last_error="回执报送失败，需按整单重试"
            )
            self.repo.insert(receipt)
            record_audit(self._actor(user), LOG_TEMPLATES["MaintenanceReceipt"][0], "MaintenanceReceipt", receipt["id"])
            raise ServiceError(ERROR_CODES["RECEIPT_SUBMIT_FAILED"], status_code=502)

        details, all_matched, qualified_part_count = self._reconcile(ticket, parts)
        receipt = create_receipt_dto(
            payload.ticket_id,
            user.get("id", 0),
            payload.vendor_name,
            parts,
            status=MATCHED_STATUS if all_matched else QUEUE_STATUS,
            reconcile_detail=details,
            qualified_part_count=qualified_part_count
        )
        self.repo.insert(receipt)
        self.ticket_repo.update_status(ticket, "PENDING_RECONCILE")
        record_audit(self._actor(user), LOG_TEMPLATES["MaintenanceReceipt"][0], "MaintenanceReceipt", receipt["id"])
        record_audit(self._actor(user), LOG_TEMPLATES["MaintenanceReceipt"][2], "HazardTicket", ticket["id"])
        return receipt

    # ---- 报送失败后按整单重试，成功前按没关闭算 ----
    def retry(self, receipt_id, user) -> dict:
        receipt = self.repo.find_by_id(receipt_id)
        if receipt is None:
            raise ServiceError(ERROR_CODES["RECEIPT_NOT_FOUND"], status_code=404)
        if receipt["status"] != SUBMIT_FAILED_STATUS:
            raise ServiceError(ERROR_CODES["RECEIPT_SUBMIT_FAILED"], "仅报送失败的回执允许整单重试", 409)

        ticket = self.ticket_repo.find_by_id(receipt["ticket_id"])
        if ticket is None:
            raise ServiceError(ERROR_CODES["TICKET_NOT_FOUND"], status_code=404)

        # 整单重试：原失败单保留留痕，新单重新走完整对账
        details, all_matched, qualified_part_count = self._reconcile(ticket, receipt["parts"])
        new_receipt = create_receipt_dto(
            ticket["id"],
            receipt["vendor_id"],
            receipt["vendor_name"],
            [dict(part) for part in receipt["parts"]],
            attempts=int(receipt.get("attempts", 1)) + 1,
            status=MATCHED_STATUS if all_matched else QUEUE_STATUS,
            reconcile_detail=details,
            qualified_part_count=qualified_part_count
        )
        self.repo.insert(new_receipt)
        receipt["last_error"] = f"已整单重试为回执#{new_receipt['id']}"
        self.ticket_repo.update_status(ticket, "PENDING_RECONCILE")
        record_audit(self._actor(user), LOG_TEMPLATES["MaintenanceReceipt"][1], "MaintenanceReceipt", new_receipt["id"])
        return new_receipt

    # ---- 物业主管复核确认：合格部件数写回设备档案并关单 ----
    def confirm(self, receipt_id, payload, user) -> dict:
        receipt = self._get_reviewable(receipt_id)
        ticket = self.ticket_repo.find_by_id(receipt["ticket_id"])
        if ticket is None:
            raise ServiceError(ERROR_CODES["TICKET_NOT_FOUND"], status_code=404)
        if ticket.get("closed_at"):
            raise ServiceError(ERROR_CODES["TICKET_ALREADY_CLOSED"], status_code=409)

        qualified = int(receipt.get("qualified_part_count", 0))
        device_id = ticket.get("device_id", 0)
        if device_id:
            self.device_repo.add_qualified_part_count(device_id, qualified)
            record_audit(self._actor(user), LOG_TEMPLATES["FireDevice"][4], "FireDevice", device_id)

        self.repo.update(
            receipt,
            status=CONFIRMED_STATUS,
            review_note=payload.note,
            reviewed_by=user.get("id", 0),
            reviewed_at=self._now()
        )
        self.ticket_repo.update_status(ticket, "RECONCILED", closed_at=self._now())
        record_audit(self._actor(user), LOG_TEMPLATES["MaintenanceReceipt"][3], "MaintenanceReceipt", receipt["id"])
        return receipt

    # ---- 物业主管复核驳回：退回维保商，整改单继续按未关闭算 ----
    def reject(self, receipt_id, payload, user) -> dict:
        receipt = self._get_reviewable(receipt_id)
        if not payload.note:
            raise ServiceError(ERROR_CODES["VALIDATION_FAILED"], "驳回复核必须填写复核意见", 422)
        ticket = self.ticket_repo.find_by_id(receipt["ticket_id"])

        self.repo.update(
            receipt,
            status=REJECTED_STATUS,
            review_note=payload.note,
            reviewed_by=user.get("id", 0),
            reviewed_at=self._now()
        )
        if ticket is not None:
            self.ticket_repo.update_status(ticket, "RECTIFYING")
        record_audit(self._actor(user), LOG_TEMPLATES["MaintenanceReceipt"][4], "MaintenanceReceipt", receipt["id"])
        return receipt

    def _get_reviewable(self, receipt_id) -> dict:
        receipt = self.repo.find_by_id(receipt_id)
        if receipt is None:
            raise ServiceError(ERROR_CODES["RECEIPT_NOT_FOUND"], status_code=404)
        if receipt["status"] not in REVIEWABLE_STATUS:
            raise ServiceError(ERROR_CODES["RECEIPT_NOT_REVIEWABLE"], status_code=409)
        return receipt

    @staticmethod
    def _actor(user) -> str:
        return f"{user.get('role', 'unknown')}:{user.get('id', 0)}"

    @staticmethod
    def _now() -> str:
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
