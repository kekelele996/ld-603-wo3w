from src.seed import seed


class MaintenanceReceiptRepository:
    def find_all(self):
        return seed["maintenanceReceipt"]

    def find_by_id(self, receipt_id):
        for row in seed["maintenanceReceipt"]:
            if row["id"] == receipt_id:
                return row
        return None

    def find_by_ticket(self, ticket_id):
        return [row for row in seed["maintenanceReceipt"] if row["hazard_ticket_id"] == ticket_id]

    def next_id(self):
        return max((row["id"] for row in seed["maintenanceReceipt"]), default=0) + 1

    def insert(self, row):
        seed["maintenanceReceipt"].append(row)
        return row

    def update(self, row, **changes):
        row.update(changes)
        return row
