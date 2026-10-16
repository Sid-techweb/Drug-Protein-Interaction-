from fastapi import APIRouter, Depends, Header, status
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.quantum_service import QuantumService
from app.schemas.quantum import (
    QUBOOptimizeRequest,
    QuantumJobResponse,
    RankComparisonResponse
)
from app.exceptions.base_exceptions import AuthenticationException, ResourceNotFoundException

router = APIRouter(prefix="/api/v1/quantum", tags=["Quantum Optimization Engine"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.post("/optimize", response_model=QuantumJobResponse, status_code=status.HTTP_201_CREATED)
def optimize_candidates(
    request: QUBOOptimizeRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Formulate multi-objective QUBO problem and execute D-Wave quantum simulated annealing."""
    service = QuantumService(db)
    weights = request.weights
    return service.optimize_candidates(
        protein_id=request.protein_id,
        user_id=user_id,
        prediction_ids=request.prediction_ids,
        w_prob=weights.weight_probability if weights else 1.0,
        w_aff=weights.weight_affinity if weights else 1.0,
        w_lip=weights.weight_lipinski if weights else 0.5,
        w_div=weights.weight_diversity_penalty if weights else 0.8
    )

@router.get("/jobs", response_model=List[QuantumJobResponse])
def get_user_quantum_jobs(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve history of quantum optimization jobs for user."""
    service = QuantumService(db)
    return service.quantum_repo.get_jobs_by_user(user_id)

@router.get("/jobs/{job_id}", response_model=QuantumJobResponse)
def get_quantum_job_details(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve telemetry metrics and candidate selections for a quantum job."""
    service = QuantumService(db)
    job = service.quantum_repo.get_job_by_id(job_id)
    if not job:
        raise ResourceNotFoundException("QuantumJob", job_id)
    return job

@router.get("/jobs/{job_id}/comparison", response_model=RankComparisonResponse)
def get_comparison_results(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve Before AI vs After Quantum candidate ranking comparison analytics."""
    service = QuantumService(db)
    return service.get_comparison_results(job_id)
