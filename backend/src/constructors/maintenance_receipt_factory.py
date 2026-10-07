from src.constants.receipt_reconcile_status import ReceiptReconcileStatus
from src.constants.receipt_submit_status import ReceiptSubmitStatus


def create_receipt_component_dto(**overrides):
    row = {
        "item_code": "item code 1",
        "part_name": "part 1",
        "quantity": 1,
        "photo_url": "/mock/receipt-part-1.png",
        "matched": False,
        "mismatch_reason": "",
    }
    row.update(overrides)
    return row


def create_maintenance_receipt_dto(**overrides):
    row = {
        "id": 1,
        "hazard_ticket_id": 1,
        "vendor_id": 1,
        "vendor_name": "外委维保商 1",
        "paper_receipt_no": "PAPER-0001",
        "submit_status": ReceiptSubmitStatus[0],
        "reconcile_status": ReceiptReconcileStatus[0],
        "components": [],
        "mismatch_details": [],
        "qualified_component_count": 0,
        "delivery_error": "",
        "submitted_at": "2026-10-07T09:00:00Z",
        "retried_at": "",
        "reviewed_by": None,
        "reviewed_note": "",
        "confirmed_at": "",
    }
    row.update(overrides)
    return row
