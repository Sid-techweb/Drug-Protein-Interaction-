from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.explainability_service import ExplainabilityService
from app.schemas.prediction import ExplainabilityResponse
from app.exceptions.base_exceptions import AuthenticationException

router = APIRouter(prefix="/api/v1/explainability", tags=["Explainable AI (XAI) Attribution"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.get("/heatmap/{prediction_id}", response_model=ExplainabilityResponse)
def get_explainability_heatmap(
    prediction_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve cross-attention residue & atom attribution heatmap for a prediction."""
    service = ExplainabilityService(db)
    return service.get_explainability_heatmap(prediction_id)
