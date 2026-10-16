from fastapi import APIRouter, Depends, Header, status
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.dti_trainer import DTITrainer
from app.repositories.model_repository import ModelRepository
from app.schemas.model_registry import ModelMetadataResponse, ModelTrainRequest
from app.exceptions.base_exceptions import AuthenticationException, ResourceNotFoundException

router = APIRouter(prefix="/api/v1/model-registry", tags=["Model Manager Registry"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.get("/active", response_model=ModelMetadataResponse)
def get_active_model_metadata(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve active PyTorch DTI model version and evaluation metrics (ROC-AUC, Accuracy, F1)."""
    repo = ModelRepository(db)
    active = repo.get_active_model()
    if not active:
        # Auto train initial model
        trainer = DTITrainer(db)
        active = trainer.train_and_checkpoint(epochs=5, version_tag="v1.0.0")
    return active

@router.get("/all", response_model=List[ModelMetadataResponse])
def get_all_model_versions(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve history of all trained PyTorch model versions and checkpoints."""
    repo = ModelRepository(db)
    return repo.get_all_models()

@router.post("/train", response_model=ModelMetadataResponse, status_code=status.HTTP_201_CREATED)
def train_new_model_version(
    request: ModelTrainRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Trigger PyTorch training pipeline, evaluate metrics, and save model checkpoint."""
    trainer = DTITrainer(db)
    version_tag = f"v1.{int(datetime.utcnow().timestamp()) % 1000}.0"
    return trainer.train_and_checkpoint(epochs=request.epochs or 5, version_tag=version_tag)
