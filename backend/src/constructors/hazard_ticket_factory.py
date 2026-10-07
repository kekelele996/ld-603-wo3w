def create_hazard_ticket_dto(**overrides):
    row = {
        "id": 1,
        "result_id": 1,
        "device_id": 1,
        "severity": "HIGH",
        "owner_id": 1,
        "deadline": "2026-10-20",
        "rectify_status": "RECTIFYING",
        "rectify_note": "rectify note 1",
        "closed_at": "",
        "hazard_items": [
            {"item_code": "HZ-001", "part_name": "消防水带", "required_quantity": 1, "photo_required": True}
        ],
    }
    row.update(overrides)
    return row
