from sqlalchemy.orm import Session
from app.models.scientist_validation import ScientistValidation
from app.models.protein import Protein
from app.models.drug import Drug
from app.schemas.validation import ScientistValidationCreate
from fastapi import HTTPException, status
from typing import List, Optional

def create_or_update_validation(db: Session, payload: ScientistValidationCreate) -> ScientistValidation:
    # Verify protein & drug exist
    protein = db.query(Protein).filter(Protein.id == payload.protein_id).first()
    if not protein:
        raise HTTPException(status_code=404, detail=f"Protein {payload.protein_id} not found")
    
    drug = db.query(Drug).filter(Drug.id == payload.drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail=f"Drug {payload.drug_id} not found")

    # Check if a validation record already exists for this protein & drug pair
    existing = db.query(ScientistValidation).filter(
        ScientistValidation.protein_id == payload.protein_id,
        ScientistValidation.drug_id == payload.drug_id
    ).first()

    if existing:
        existing.decision = payload.decision
        existing.experimental_notes = payload.experimental_notes
        existing.experimental_method = payload.experimental_method
        existing.confidence = payload.confidence
        existing.scientist_name = payload.scientist_name
        existing.institution = payload.institution
        db.commit()
        db.refresh(existing)
        return existing
    
    record = ScientistValidation(
        protein_id=payload.protein_id,
        drug_id=payload.drug_id,
        decision=payload.decision,
        experimental_notes=payload.experimental_notes,
        experimental_method=payload.experimental_method,
        confidence=payload.confidence,
        scientist_name=payload.scientist_name,
        institution=payload.institution,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_validations_for_protein(db: Session, protein_id: str) -> List[ScientistValidation]:
    return db.query(ScientistValidation).filter(ScientistValidation.protein_id == protein_id).all()

def get_validation_for_pair(db: Session, protein_id: str, drug_id: str) -> Optional[ScientistValidation]:
    return db.query(ScientistValidation).filter(
        ScientistValidation.protein_id == protein_id,
        ScientistValidation.drug_id == drug_id
    ).first()
