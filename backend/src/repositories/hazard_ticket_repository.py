from src.seed import seed


class HazardTicketRepository:
    def find_all(self):
        return seed["hazardTicket"]

    def find_by_id(self, ticket_id):
        for row in seed["hazardTicket"]:
            if row["id"] == ticket_id:
                return row
        return None

    def update(self, row, **changes):
        row.update(changes)
        return row
