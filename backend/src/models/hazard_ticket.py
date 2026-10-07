from pydantic import BaseModel


class RegisteredHazardItem(BaseModel):
    item_code: str
    part_name: str
    expected_quantity: int = 1
    photo_required: bool = True


class HazardTicket(BaseModel):
    id: int | float
    result_id: int | float
    severity: str
    owner_id: int | float
    deadline: str
    rectify_status: str
    rectify_note: str
    closed_at: str
    registered_items: list[dict] = []
    last_receipt_id: int | float | None = None
