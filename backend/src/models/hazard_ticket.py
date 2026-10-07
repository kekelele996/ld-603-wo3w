from pydantic import BaseModel

class HazardItem(BaseModel):
    item_code: str
    part_name: str
    required_quantity: int | float
    photo_required: bool = True

class HazardTicket(BaseModel):
    id: int | float
    result_id: int | float
    device_id: int | float = 0
    severity: str
    owner_id: int | float
    deadline: str
    rectify_status: str
    rectify_note: str
    closed_at: str
    hazard_items: list[HazardItem] = []
