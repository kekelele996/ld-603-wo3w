from fastapi import Request
from fastapi.responses import JSONResponse

from src.services.errors import ServiceError
from src.services.maintenance_receipt_service import MaintenanceReceiptService
from src.middlewares.rbac_dependency import (
    require_roles,
    ensure_not_readonly,
    ROLE_VENDOR,
    ROLE_PROPERTY_MANAGER,
)
from src.types.maintenance_receipt_payload import MaintenanceReceiptPayload, ReceiptReviewPayload

service = MaintenanceReceiptService()


def _wrap(exc: ServiceError) -> JSONResponse:
    # controller 二次包装：service 抛业务码，controller 统一成 HTTP 错误体
    return JSONResponse(status_code=exc.status_code, content={"code": exc.code, "message": exc.message})


def list_maintenance_receipt(status: str | None = None):
    try:
        return service.list(status)
    except ServiceError as exc:
        return _wrap(exc)


def list_reconcile_queue():
    try:
        return service.list_queue()
    except ServiceError as exc:
        return _wrap(exc)


def submit_maintenance_receipt(request: Request, payload: MaintenanceReceiptPayload):
    try:
        ensure_not_readonly(request)
        user = require_roles(request, ROLE_VENDOR, ROLE_PROPERTY_MANAGER)
        return service.submit(payload, user)
    except ServiceError as exc:
        return _wrap(exc)


def retry_maintenance_receipt(request: Request, receipt_id: int):
    try:
        ensure_not_readonly(request)
        user = require_roles(request, ROLE_VENDOR, ROLE_PROPERTY_MANAGER)
        return service.retry(receipt_id, user)
    except ServiceError as exc:
        return _wrap(exc)


def confirm_maintenance_receipt(request: Request, receipt_id: int, payload: ReceiptReviewPayload):
    try:
        ensure_not_readonly(request)
        user = require_roles(request, ROLE_PROPERTY_MANAGER)
        return service.confirm(receipt_id, payload, user)
    except ServiceError as exc:
        return _wrap(exc)


def reject_maintenance_receipt(request: Request, receipt_id: int, payload: ReceiptReviewPayload):
    try:
        ensure_not_readonly(request)
        user = require_roles(request, ROLE_PROPERTY_MANAGER)
        return service.reject(receipt_id, payload, user)
    except ServiceError as exc:
        return _wrap(exc)
