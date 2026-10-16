from fastapi import APIRouter, Depends, Header, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.repositories.drug_repository import DrugRepository
from app.schemas.drug import DrugResponse
from app.exceptions.base_exceptions import AuthenticationException, ResourceNotFoundException

router = APIRouter(prefix="/api/v1/drug", tags=["Drug Intelligence Engine"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.get("", response_model=dict)
def search_drug_library(
    search: Optional[str] = Query(None, description="Search by Name, ChEMBL ID, or SMILES"),
    dataset_id: Optional[str] = Query(None, description="Filter by Dataset ID"),
    lipinski_only: bool = Query(False, description="Filter Lipinski Rule of 5 Compliant Compounds"),
    limit: int = Query(24, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Search, filter, and paginate drug candidates with dynamic property & fingerprint relationships."""
    repo = DrugRepository(db)
    items = repo.search_drugs(
        user_id=user_id,
        search_query=search,
        dataset_id=dataset_id,
        lipinski_only=lipinski_only,
        limit=limit,
        offset=offset
    )
    total = repo.count_drugs(
        user_id=user_id,
        search_query=search,
        dataset_id=dataset_id,
        lipinski_only=lipinski_only
    )

    drugs_res = [DrugResponse.from_orm(d) for d in items]

    return {
        "items": drugs_res,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.get("/{drug_id}", response_model=DrugResponse)
def get_drug_details(
    drug_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve full molecular properties, bioactivity, targets, and SMILES details for a compound."""
    repo = DrugRepository(db)
    drug = repo.get_drug_by_id(drug_id)
    if not drug:
        raise ResourceNotFoundException("Drug", drug_id)
    return drug
