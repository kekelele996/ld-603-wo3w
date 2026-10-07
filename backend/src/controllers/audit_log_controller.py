from src.services.audit_log_service import AuditLogService

service = AuditLogService()


def list_audit_log():
    # 审计日志仅供查询，写操作由 audit_log_middleware / record_audit 统一落库
    return service.list()
