from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES


class ServiceError(Exception):
    """service 层统一抛出的业务异常，controller 负责二次包装为 HTTP 响应。"""

    def __init__(self, code: str, message: str | None = None, status_code: int = 400):
        self.code = code or ERROR_CODES["VALIDATION_FAILED"]
        self.message = message or ERROR_MESSAGES.get(self.code, "service error")
        self.status_code = status_code
        super().__init__(self.message)
