from src.seed import seed


class HazardTicketRepository:
    def find_all(self):
        return seed["hazardTicket"]

    def find_by_id(self, ticket_id):
        for row in seed["hazardTicket"]:
            if row["id"] == ticket_id:
                return row
        return None

    def is_closed(self, ticket_id) -> bool:
        ticket = self.find_by_id(ticket_id)
        return bool(ticket and ticket.get("closed_at"))

    def update_status(self, ticket, status: str, closed_at: str = ""):
        ticket["rectify_status"] = status
        if closed_at:
            ticket["closed_at"] = closed_at
        return ticket
