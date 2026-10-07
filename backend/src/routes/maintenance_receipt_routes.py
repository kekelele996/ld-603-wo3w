from fastapi import APIRouter
from src.controllers.maintenance_receipt_controller import (
    list_maintenance_receipt,
    list_reconcile_queue,
    submit_maintenance_receipt,
    retry_maintenance_receipt,
    confirm_maintenance_receipt,
    reject_maintenance_receipt,
)

router = APIRouter(prefix="/api/maintenance-receipt", tags=["MaintenanceReceipt"])
# 审计员只读：GET 全角色可查，POST 复核动作在 controller 内做 RBAC
router.get("")(list_maintenance_receipt)
router.get("/queue")(list_reconcile_queue)
router.post("/submit")(submit_maintenance_receipt)
router.post("/{receipt_id}/retry")(retry_maintenance_receipt)
router.post("/{receipt_id}/confirm")(confirm_maintenance_receipt)
router.post("/{receipt_id}/reject")(reject_maintenance_receipt)
