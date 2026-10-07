from src.seed import seed


class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]

    def find_by_id(self, device_id):
        for row in seed["fireDevice"]:
            if row["id"] == device_id:
                return row
        return None

    def add_qualified_part_count(self, device_id, count) -> dict:
        device = self.find_by_id(device_id)
        if device is None:
            return {}
        device["qualified_part_count"] = int(device.get("qualified_part_count", 0)) + int(count)
        return device
