from fastapi import APIRouter, Depends, Header, status
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.candidate_service import CandidateService
from app.schemas.candidate import CandidateCreateRequest, CandidateQueueResponse
from app.exceptions.base_exceptions import AuthenticationException, ResourceNotFoundException

router = APIRouter(prefix="/api/v1/candidate", tags=["Candidate Queue System"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.post("/queue", response_model=List[CandidateQueueResponse], status_code=status.HTTP_201_CREATED)
def add_to_candidate_queue(
    request: CandidateCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add selected drug compounds to Candidate Queue for AI Prediction in Sprint 4."""
    service = CandidateService(db)
    items = service.add_candidates_to_queue(
        drug_ids=request.drug_ids,
        user_id=user_id,
        protein_id=request.protein_id
    )
    return items

@router.get("", response_model=List[CandidateQueueResponse])
def get_candidate_queue(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve list of candidate queue compounds prepared by user."""
    service = CandidateService(db)
    return service.get_user_candidates(user_id)

@router.delete("/{candidate_id}")
def remove_candidate_from_queue(
    candidate_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Remove compound from Candidate Queue."""
    service = CandidateService(db)
    success = service.remove_candidate(candidate_id, user_id)
    if not success:
        raise ResourceNotFoundException("CandidateQueue", candidate_id)
    return {"message": "Candidate removed successfully."}
