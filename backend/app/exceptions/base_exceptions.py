from app.constants.error_codes import ErrorCode

class HelixQException(Exception):
    def __init__(self, message: str, error_code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, status_code: int = 500, details: dict = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}

class ResourceNotFoundException(HelixQException):
    def __init__(self, resource_name: str, resource_id: str):
        super().__init__(
            message=f"{resource_name} with identifier '{resource_id}' was not found.",
            error_code=ErrorCode.NOT_FOUND,
            status_code=404
        )

class AuthenticationException(HelixQException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            error_code=ErrorCode.UNAUTHORIZED,
            status_code=401
        )

class UniProtException(HelixQException):
    def __init__(self, message: str = "Failed to communicate with UniProt Service"):
        super().__init__(
            message=message,
            error_code=ErrorCode.UNIPROT_SERVICE_UNAVAILABLE,
            status_code=503
        )
