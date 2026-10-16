from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.exceptions.base_exceptions import HelixQException
from app.constants.error_codes import ErrorCode
from app.logging.logger import logger

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HelixQException)
    async def helixq_exception_handler(request: Request, exc: HelixQException):
        correlation_id = getattr(request.state, "correlation_id", "N/A")
        logger.error(f"HelixQ Exception: {exc.message}", extra={"correlation_id": correlation_id, "error_code": exc.error_code})
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "type": f"https://helixq.ai/errors/{exc.error_code.value}",
                "title": exc.error_code.name,
                "status": exc.status_code,
                "detail": exc.message,
                "instance": str(request.url.path),
                "error_code": exc.error_code.value,
                "correlation_id": correlation_id,
                "details": exc.details
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        correlation_id = getattr(request.state, "correlation_id", "N/A")
        logger.warning(f"Request Validation Error: {exc.errors()}", extra={"correlation_id": correlation_id})
        
        return JSONResponse(
            status_code=422,
            content={
                "type": "https://helixq.ai/errors/ERR_VAL_422",
                "title": "VALIDATION_ERROR",
                "status": 422,
                "detail": "Invalid request parameters provided.",
                "instance": str(request.url.path),
                "error_code": ErrorCode.VALIDATION_ERROR.value,
                "correlation_id": correlation_id,
                "validation_errors": str(exc.errors())
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        correlation_id = getattr(request.state, "correlation_id", "N/A")
        logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True, extra={"correlation_id": correlation_id})
        
        return JSONResponse(
            status_code=500,
            content={
                "type": "https://helixq.ai/errors/ERR_SYS_500",
                "title": "INTERNAL_SERVER_ERROR",
                "status": 500,
                "detail": "An unexpected internal error occurred. Please contact system administrator.",
                "instance": str(request.url.path),
                "error_code": ErrorCode.INTERNAL_SERVER_ERROR.value,
                "correlation_id": correlation_id
            }
        )
