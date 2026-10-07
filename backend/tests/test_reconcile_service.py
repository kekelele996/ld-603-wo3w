"""回执对账回归测试：不依赖网络框架，仅验证 service 层对账与状态机。

运行：PYTHONPATH=backend python3 backend/tests/test_reconcile_service.py
"""
import sys
import types
import pathlib

# 无 fastapi 环境下用桩模块，便于在最小 CI 中直接运行
try:  # pragma: no cover
    import fastapi  # noqa: F401
except ModuleNotFoundError:
    fastapi_stub = types.ModuleType("fastapi")
    fastapi_stub.Request = object
    sys.modules["fastapi"] = fastapi_stub

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from src.services.maintenance_receipt_service import MaintenanceReceiptService  # noqa: E402
from src.services.hazard_ticket_service import HazardTicketService  # noqa: E402
from src.services.errors import ServiceError  # noqa: E402
from src.seed import seed  # noqa: E402


class Part:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def model_dump(self):
        return dict(self.__dict__)


class Payload:
    def __init__(self, ticket_id, parts, simulate_failure=False):
        self.ticket_id = ticket_id
        self.vendor_name = "安泰消防维保"
        self.parts = parts
        self.simulate_failure = simulate_failure


class Review:
    def __init__(self, note=""):
        self.note = note


VENDOR = {"id": 9001, "role": "vendor"}
MANAGER = {"id": 7, "role": "property_manager"}


def test_reconcile_match_and_mismatch():
    svc = MaintenanceReceiptService()
    ticket = seed["hazardTicket"][0]

    ok = [
        {"item_code": "HZ-001", "part_name": "消防水带", "quantity": 2, "photo_urls": ["/a.png"]},
        {"item_code": "HZ-002", "part_name": "阀门", "quantity": 1, "photo_urls": ["/b.png"]},
    ]
    _, matched, qualified = svc._reconcile(ticket, ok)
    assert matched is True and qualified == 3

    bad = [
        {"item_code": "HZ-001", "part_name": "消防水带", "quantity": 1, "photo_urls": []},
        {"item_code": "HZ-002", "part_name": "闸阀", "quantity": 1, "photo_urls": ["/b.png"]},
    ]
    detail, matched, qualified = svc._reconcile(ticket, bad)
    assert matched is False and qualified == 0
    assert all(line["reason"] for line in detail)


def test_full_flow_confirm_writes_back_and_closes():
    rsvc = MaintenanceReceiptService()
    hsvc = HazardTicketService()

    # 未确认前关单被拒
    try:
        hsvc.close(2, MANAGER)
        raise AssertionError("close must be blocked")
    except ServiceError as exc:
        assert exc.code == "TICKET_ALREADY_CLOSED"

    # 配不上 -> 对账队列
    queued = rsvc.submit(Payload(2, [Part(item_code="HZ-101", part_name="温感探头", quantity=1, photo_urls=["/x"])]), VENDOR)
    assert queued["status"] == "PENDING_REVIEW"
    assert len(rsvc.list_queue()) >= 1

    # 驳回无意见 -> 校验失败；有意见 -> 退回整改中，不关单
    try:
        rsvc.reject(queued["id"], Review(""), MANAGER)
        raise AssertionError("reject note required")
    except ServiceError as exc:
        assert exc.code == "VALIDATION_FAILED"
    rsvc.reject(queued["id"], Review("型号不符"), MANAGER)
    assert seed["hazardTicket"][1]["rectify_status"] == "RECTIFYING"
    assert seed["hazardTicket"][1]["closed_at"] == ""

    # 重新报对 -> MATCHED -> 主管确认 -> 写回设备 + 关单
    matched = rsvc.submit(Payload(2, [Part(item_code="HZ-101", part_name="烟感探头", quantity=1, photo_urls=["/y"])]), VENDOR)
    assert matched["status"] == "MATCHED"
    rsvc.confirm(matched["id"], Review("通过"), MANAGER)
    assert seed["fireDevice"][1]["qualified_part_count"] >= 1
    assert seed["hazardTicket"][1]["closed_at"]
    hsvc.close(2, MANAGER)  # 已确认后显式关单成功


def test_failed_submission_whole_order_retry():
    rsvc = MaintenanceReceiptService()
    try:
        rsvc.submit(Payload(3, [Part(item_code="HZ-201", part_name="喷淋头防尘罩", quantity=3, photo_urls=[])],
                           simulate_failure=True), VENDOR)
        raise AssertionError("failure must raise")
    except ServiceError as exc:
        assert exc.code == "RECEIPT_SUBMIT_FAILED"

    failed = [row for row in seed["maintenanceReceipt"] if row["status"] == "SUBMIT_FAILED"]
    assert failed and seed["hazardTicket"][2]["closed_at"] == ""
    retried = rsvc.retry(failed[-1]["id"], VENDOR)
    assert retried["status"] == "MATCHED"
    assert retried["qualified_part_count"] == 3


if __name__ == "__main__":
    test_reconcile_match_and_mismatch()
    test_full_flow_confirm_writes_back_and_closes()
    test_failed_submission_whole_order_retry()
    print("ALL_RECEIPT_TESTS_OK")
