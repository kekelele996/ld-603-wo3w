from pydantic import BaseModel

class ReceiptPart(BaseModel):
    item_code: str
    part_name: str
    quantity: int | float
    photo_urls: list[str] = []

class ReconcileLine(BaseModel):
    item_code: str
    expected_part_name: str = ""
    receipt_part_name: str = ""
    required_quantity: int | float = 0
    receipt_quantity: int | float = 0
    photo_ok: bool = False
    matched: bool = False
    reason: str = ""

class MaintenanceReceipt(BaseModel):
    id: int | float
    ticket_id: int | float
    vendor_id: int | float
    vendor_name: str
    submitted_at: str
    status: str
    attempts: int | float = 1
    last_error: str = ""
    reconcile_detail: list[ReconcileLine] = []
    review_note: str = ""
    reviewed_by: int | float = 0
    reviewed_at: str = ""
    qualified_part_count: int | float = 0
    parts: list[ReceiptPart] = []
