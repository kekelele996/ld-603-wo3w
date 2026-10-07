class ServiceError(Exception):
    def __init__(self, code, message="", status_code=400):
        super().__init__(message or code)
        self.code = code
        self.status_code = status_code
