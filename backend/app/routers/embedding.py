from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.embedding_service import EmbeddingService
from app.schemas.embedding import EmbeddingJobResponse
from app.exceptions.base_exceptions import AuthenticationException

router = APIRouter(prefix="/api/v1/embedding", tags=["ESM-2 Embedding Pipeline Architecture"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.post("/queue/{protein_id}", response_model=EmbeddingJobResponse, status_code=status.HTTP_201_CREATED)
def queue_embedding_job(
    protein_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Queue an ESM-2 transformer embedding job for target protein sequence."""
    service = EmbeddingService(db)
    return service.queue_embedding_job(protein_id)

@router.get("/status/{job_id}", response_model=EmbeddingJobResponse)
def get_embedding_status(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Poll job status for ESM-2 embedding pipeline."""
    service = EmbeddingService(db)
    return service.get_job_status(job_id)
