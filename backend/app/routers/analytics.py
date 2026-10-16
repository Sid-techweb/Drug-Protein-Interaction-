from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import AnalyticsDashboardResponse
from app.exceptions.base_exceptions import AuthenticationException

router = APIRouter(prefix="/api/v1/analytics", tags=["Platform Analytics Engine"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_dashboard_analytics(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve real-time aggregated platform telemetry directly from PostgreSQL."""
    service = AnalyticsService(db)
    return service.get_dashboard_analytics(user_id)
