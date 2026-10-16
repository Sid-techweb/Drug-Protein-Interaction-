import time
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.logging.logger import logger

class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        correlation_id = getattr(request.state, "correlation_id", "N/A")

        response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)

        extra = {
            "correlation_id": correlation_id,
            "method": request.method,
            "url": str(request.url.path),
            "status_code": response.status_code,
            "process_time_ms": process_time_ms
        }

        log_msg = f"{request.method} {request.url.path} Completed with status {response.status_code} in {process_time_ms}ms"
        
        if response.status_code >= 400:
            logger.warning(log_msg, extra=extra)
        else:
            logger.info(log_msg, extra=extra)

        return response
