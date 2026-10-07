from src.seed import seed


class MaintenanceReceiptRepository:
    def find_all(self):
        return seed["maintenanceReceipt"]

    def find_by_id(self, receipt_id):
        for row in seed["maintenanceReceipt"]:
            if row["id"] == receipt_id:
                return row
        return None

    def find_latest_by_ticket(self, ticket_id):
        matched = [row for row in seed["maintenanceReceipt"] if row["ticket_id"] == ticket_id]
        return matched[-1] if matched else None

    def insert(self, row) -> dict:
        row["id"] = max((item["id"] for item in seed["maintenanceReceipt"]), default=0) + 1
        seed["maintenanceReceipt"].append(row)
        return row

    def update(self, receipt, **changes) -> dict:
        receipt.update(changes)
        return receipt
