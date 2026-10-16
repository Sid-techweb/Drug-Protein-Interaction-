from fastapi import APIRouter, Depends, Header, Query, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.inference_service import InferenceService
from app.schemas.prediction import DTIPredictionRequest, BatchPredictionRequest, DTIPredictionResponse
from app.exceptions.base_exceptions import AuthenticationException

router = APIRouter(prefix="/api/v1/prediction", tags=["AI Prediction Engine"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.post("/dti", response_model=DTIPredictionResponse, status_code=status.HTTP_201_CREATED)
def predict_single_dti(
    request: DTIPredictionRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Execute Multimodal Neural Network forward pass for single Protein-Drug pair."""
    service = InferenceService(db)
    return service.predict_single_dti(request.protein_id, request.drug_id, user_id)

@router.post("/batch", response_model=List[DTIPredictionResponse], status_code=status.HTTP_201_CREATED)
def predict_batch_dti(
    request: BatchPredictionRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Execute batch AI predictions for target protein against multiple queued candidate drugs."""
    service = InferenceService(db)
    return service.predict_batch_dti(request.protein_id, request.drug_ids, user_id)

@router.get("/history", response_model=List[DTIPredictionResponse])
def get_prediction_history(
    protein_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve history of AI predictions executed by user, optionally filtered by protein_id."""
    service = InferenceService(db)
    if protein_id:
        return service.pred_repo.get_predictions_by_protein(user_id, protein_id)
    return service.pred_repo.get_predictions_by_user(user_id)
