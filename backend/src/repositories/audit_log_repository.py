from src.seed import seed


class AuditLogRepository:
    def find_all(self):
        return seed["auditLog"]
