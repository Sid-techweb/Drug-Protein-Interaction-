from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ScientistValidationCreate(BaseModel):
    protein_id: str
    drug_id: str
    decision: str  # APPROVED, REJECTED, NEEDS_FURTHER_VALIDATION
    experimental_notes: str
    experimental_method: str  # IN_VITRO, IN_VIVO, LITERATURE, CLINICAL, OTHER
    confidence: float = 100.0
    scientist_name: str
    institution: Optional[str] = None

class ScientistValidationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    protein_id: str
    drug_id: str
    decision: str
    experimental_notes: str
    experimental_method: str
    confidence: float
    scientist_name: str
    institution: Optional[str] = None
    validated_at: datetime
    created_at: datetime
