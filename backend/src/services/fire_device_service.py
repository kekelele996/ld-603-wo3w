from src.constants.log_templates import LOG_TEMPLATES
from src.repositories.fire_device_repository import FireDeviceRepository


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()

    def list(self):
        return self.repo.find_all()

    def writeback_qualified_components(self, device_id, qualified_count, receipt_id):
        device = self.repo.find_by_id(device_id)
        if device is None:
            return None
        self.repo.update(
            device,
            qualified_component_count=int(qualified_count),
            last_writeback_receipt_id=receipt_id,
        )
        print(LOG_TEMPLATES["FireDevice"][4], device_id, qualified_count, receipt_id)
        return device
