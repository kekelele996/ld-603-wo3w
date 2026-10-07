from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def create_receipt_dto(ticket_id, vendor_id, vendor_name, parts, **overrides):
    row = {
        "id": 0,
        "ticket_id": ticket_id,
        "vendor_id": vendor_id,
        "vendor_name": vendor_name,
        "submitted_at": _now(),
        "status": "SUBMITTED",
        "attempts": 1,
        "last_error": "",
        "reconcile_detail": [],
        "review_note": "",
        "reviewed_by": 0,
        "reviewed_at": "",
        "qualified_part_count": 0,
        "parts": parts
    }
    row.update(overrides)
    return row


def create_reconcile_line_dto(**overrides):
    row = {
        "item_code": "",
        "expected_part_name": "",
        "receipt_part_name": "",
        "required_quantity": 0,
        "receipt_quantity": 0,
        "photo_ok": False,
        "matched": False,
        "reason": ""
    }
    row.update(overrides)
    return row
