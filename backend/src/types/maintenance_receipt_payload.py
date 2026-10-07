from pydantic import BaseModel

class ReceiptPartPayload(BaseModel):
    item_code: str
    part_name: str
    quantity: int
    photo_urls: list[str] = []

class MaintenanceReceiptPayload(BaseModel):
    ticket_id: int
    vendor_name: str = ""
    parts: list[ReceiptPartPayload]
    # 演示外委渠道报送失败（纸质单录入失败）：落 SUBMIT_FAILED，等整单重试
    simulate_failure: bool = False

class ReceiptReviewPayload(BaseModel):
    note: str = ""
