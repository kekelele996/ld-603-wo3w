from fastapi import APIRouter
from src.controllers.maintenance_receipt_controller import (
    list_maintenance_receipt,
    list_reconcile_queue,
    report_maintenance_receipt,
    retry_maintenance_receipt,
    review_maintenance_receipt,
)

router = APIRouter(prefix="/api/maintenance-receipt", tags=["MaintenanceReceipt"])
router.get("")(list_maintenance_receipt)
router.get("/queue")(list_reconcile_queue)
router.post("")(report_maintenance_receipt)
router.post("/{receipt_id}/retry")(retry_maintenance_receipt)
router.post("/{receipt_id}/review")(review_maintenance_receipt)
