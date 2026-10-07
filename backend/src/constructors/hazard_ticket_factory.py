def create_hazard_ticket_dto(**overrides):
    row = {"id":1,"result_id":1,"severity":"severity 1","owner_id":1,"deadline":"deadline 1","rectify_status":"OPEN","rectify_note":"rectify note 1","closed_at":"","registered_items":[],"last_receipt_id":None}
    row.update(overrides)
    return row
