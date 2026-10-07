from pydantic import BaseModel


class ReceiptComponentPayload(BaseModel):
    item_code: str
    part_name: str
    quantity: int = 1
    photo_url: str = ""


class MaintenanceReceiptPayload(BaseModel):
    hazard_ticket_id: int
    vendor_id: int
    vendor_name: str = ""
    paper_receipt_no: str = ""
    delivery_status: str = "OK"
    components: list[ReceiptComponentPayload] = []


class ReceiptRetryPayload(BaseModel):
    delivery_status: str = "OK"
    components: list[ReceiptComponentPayload] | None = None


class ReceiptReviewPayload(BaseModel):
    action: str
    note: str = ""
