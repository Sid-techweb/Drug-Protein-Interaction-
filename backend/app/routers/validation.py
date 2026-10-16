from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.validation import ScientistValidationCreate, ScientistValidationResponse
from app.services.validation_service import (
    create_or_update_validation,
    get_validations_for_protein,
    get_validation_for_pair
)

router = APIRouter(prefix="/api/v1/validation", tags=["Scientist Validation"])

@router.post("", response_model=ScientistValidationResponse, status_code=status.HTTP_201_CREATED)
def submit_validation(payload: ScientistValidationCreate, db: Session = Depends(get_db)):
    return create_or_update_validation(db, payload)

@router.get("/protein/{protein_id}", response_model=List[ScientistValidationResponse])
def get_protein_validations(protein_id: str, db: Session = Depends(get_db)):
    return get_validations_for_protein(db, protein_id)

@router.get("/{protein_id}/{drug_id}", response_model=ScientistValidationResponse)
def get_pair_validation(protein_id: str, drug_id: str, db: Session = Depends(get_db)):
    val = get_validation_for_pair(db, protein_id, drug_id)
    if not val:
        raise HTTPException(status_code=404, detail="No validation record found for this target and compound pair")
    return val
