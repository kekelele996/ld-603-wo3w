from pydantic import BaseModel


class ReceiptComponent(BaseModel):
    item_code: str
    part_name: str
    quantity: int = 1
    photo_url: str = ""
    matched: bool = False
    mismatch_reason: str = ""


class MaintenanceReceipt(BaseModel):
    id: int | float
    hazard_ticket_id: int | float
    vendor_id: int | float
    vendor_name: str
    paper_receipt_no: str
    submit_status: str
    reconcile_status: str
    components: list[dict] = []
    mismatch_details: list[dict] = []
    qualified_component_count: int = 0
    delivery_error: str = ""
    submitted_at: str
    retried_at: str = ""
    reviewed_by: int | float | None = None
    reviewed_note: str = ""
    confirmed_at: str = ""
