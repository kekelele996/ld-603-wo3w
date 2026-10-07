from fastapi import Depends

from src.middlewares.guards import deny_read_only, require_roles, require_user
from src.services.maintenance_receipt_service import MaintenanceReceiptService
from src.types.maintenance_receipt_payload import (
    MaintenanceReceiptPayload,
    ReceiptRetryPayload,
    ReceiptReviewPayload,
)

service = MaintenanceReceiptService()


def list_maintenance_receipt(
    ticket_id: int | None = None,
    reconcile_status: str | None = None,
    submit_status: str | None = None,
    user=Depends(require_user),
):
    return service.list(ticket_id=ticket_id, reconcile_status=reconcile_status, submit_status=submit_status)


def list_reconcile_queue(user=Depends(require_user)):
    return service.list_queue()


def report_maintenance_receipt(
    payload: MaintenanceReceiptPayload,
    user=Depends(require_roles("VENDOR", "SUPERVISOR")),
    _guard=Depends(deny_read_only),
):
    return service.report(payload)


def retry_maintenance_receipt(
    receipt_id: int,
    payload: ReceiptRetryPayload,
    user=Depends(require_roles("VENDOR", "SUPERVISOR")),
    _guard=Depends(deny_read_only),
):
    return service.retry(receipt_id, payload)


def review_maintenance_receipt(
    receipt_id: int,
    payload: ReceiptReviewPayload,
    user=Depends(require_roles("SUPERVISOR")),
    _guard=Depends(deny_read_only),
):
    return service.review(receipt_id, payload.action, user, payload.note)
